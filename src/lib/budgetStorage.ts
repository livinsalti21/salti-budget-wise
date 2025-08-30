import { supabase } from '@/integrations/supabase/client';
import type { BudgetInput, WeeklyBudgetResult } from './budgetUtils';
import { getCurrentWeekStart, normToWeekly } from './budgetUtils';

// Optional: Use edge function for enhanced budget operations
export async function getBudgetAnalytics(userId: string, weeksBack = 8): Promise<any[]> {
  try {
    const { data, error } = await supabase.functions.invoke('budget-operations', {
      body: {
        action: 'get_budget_analytics',
        userId,
        weeksBack
      }
    });

    if (error) throw error;
    return data?.analytics || [];
  } catch (error) {
    console.error('Error getting budget analytics:', error);
    return [];
  }
}

interface StoredBudget {
  id: string;
  user_id: string;
  week_start_date: string;
  title: string;
  created_at: string;
  budget_items: Array<{
    category: string;
    planned_cents: number;
    actual_cents: number;
  }>;
}

// Convert BudgetInput to database format and save
export async function saveBudgetToDatabase(
  userId: string, 
  budgetData: BudgetInput,
  budgetResult: WeeklyBudgetResult,
  title?: string
): Promise<{ success: boolean; budgetId?: string; error?: string }> {
  try {
    const weekStart = getCurrentWeekStart();
    
    // Create main budget record with conflict resolution
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .upsert({
        user_id: userId,
        week_start_date: weekStart,
        title: title || `Budget for ${new Date(weekStart).toLocaleDateString()}`,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,week_start_date'
      })
      .select()
      .single();

    if (budgetError) throw budgetError;

    // Delete existing budget items for this week
    await supabase
      .from('budget_items')
      .delete()
      .eq('budget_id', budget.id);

    // Create budget items from budget data
    const budgetItems = [];

    // Add income items
    budgetData.incomes.forEach((income, index) => {
      budgetItems.push({
        budget_id: budget.id,
        category: income.source || `Income ${index + 1}`,
        planned_cents: Math.round(normToWeekly(income.amount, income.cadence) * 100),
        actual_cents: 0
      });
    });

    // Add fixed expense items
    budgetData.fixed_expenses.forEach(expense => {
      budgetItems.push({
        budget_id: budget.id,
        category: expense.name,
        planned_cents: Math.round(normToWeekly(expense.amount, expense.cadence) * 100),
        actual_cents: 0
      });
    });

    // Add variable spending allocations
    budgetResult.weekly.allocations.forEach(allocation => {
      budgetItems.push({
        budget_id: budget.id,
        category: allocation.name,
        planned_cents: Math.round(allocation.weekly_amount * 100),
        actual_cents: 0
      });
    });

    // Add savings goal
    budgetItems.push({
      budget_id: budget.id,
      category: 'Save n Stack',
      planned_cents: Math.round(budgetResult.weekly.save_n_stack * 100),
      actual_cents: 0
    });

    // Insert all budget items
    const { error: itemsError } = await supabase
      .from('budget_items')
      .insert(budgetItems);

    if (itemsError) throw itemsError;

    // Also save to budget_inputs for AI tracking
    await supabase
      .from('budget_inputs')
      .insert({
        user_id: userId,
        payload: budgetData as any,
        input_method: 'computed'
      });

    return { success: true, budgetId: budget.id };
  } catch (error) {
    console.error('Error saving budget:', error);
    return { success: false, error: error.message };
  }
}

// Load existing budget for current week
export async function loadCurrentWeekBudget(userId: string): Promise<{
  budgetData: BudgetInput | null;
  budgetId?: string;
}> {
  try {
    const weekStart = getCurrentWeekStart();
    
    // Try to get from structured budget first
    const { data: budget } = await supabase
      .from('budgets')
      .select(`
        id,
        title,
        budget_items (
          category,
          planned_cents,
          actual_cents
        )
      `)
      .eq('user_id', userId)
      .eq('week_start_date', weekStart)
      .single();

    if (budget && budget.budget_items?.length > 0) {
      // Convert back to BudgetInput format
      const budgetData = convertStoredBudgetToBudgetInput(budget);
      return { budgetData, budgetId: budget.id };
    }

    // Fallback to latest budget_inputs entry
    const { data: latestInput } = await supabase
      .from('budget_inputs')
      .select('payload')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (latestInput?.payload) {
      return { budgetData: latestInput.payload as unknown as BudgetInput };
    }

    return { budgetData: null };
  } catch (error) {
    console.error('Error loading budget:', error);
    return { budgetData: null };
  }
}

// Load budget history
export async function loadBudgetHistory(userId: string, limit = 8): Promise<StoredBudget[]> {
  try {
    const { data: budgets } = await supabase
      .from('budgets')
      .select(`
        id,
        user_id,
        week_start_date,
        title,
        created_at,
        budget_items (
          category,
          planned_cents,
          actual_cents
        )
      `)
      .eq('user_id', userId)
      .order('week_start_date', { ascending: false })
      .limit(limit);

    return budgets || [];
  } catch (error) {
    console.error('Error loading budget history:', error);
    return [];
  }
}

// Update actual spending for a budget item
export async function updateBudgetItemSpending(
  budgetId: string,
  category: string,
  actualCents: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('budget_items')
      .update({ actual_cents: actualCents })
      .eq('budget_id', budgetId)
      .eq('category', category);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating budget item:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to convert stored budget back to BudgetInput format
function convertStoredBudgetToBudgetInput(budget: any): BudgetInput {
  const items = budget.budget_items || [];
  
  // Categorize budget items
  const incomes = items
    .filter((item: any) => item.category.toLowerCase().includes('income'))
    .map((item: any) => ({
      amount: item.planned_cents / 100,
      cadence: 'weekly',
      source: item.category
    }));

  const fixed_expenses = items
    .filter((item: any) => 
      !item.category.toLowerCase().includes('income') &&
      !item.category.toLowerCase().includes('save') &&
      !['Groceries', 'Gas', 'Eating Out', 'Fun', 'Misc'].includes(item.category)
    )
    .map((item: any) => ({
      name: item.category,
      amount: item.planned_cents / 100,
      cadence: 'weekly'
    }));

  // Extract variable spending splits from allocations
  const variableItems = items.filter((item: any) => 
    ['Groceries', 'Gas', 'Eating Out', 'Fun', 'Misc'].includes(item.category)
  );
  
  const totalVariable = variableItems.reduce((sum: number, item: any) => sum + item.planned_cents, 0);
  const splits: Record<string, number> = {};
  
  variableItems.forEach((item: any) => {
    const key = item.category.toLowerCase().replace(' ', '_');
    splits[key] = totalVariable > 0 ? (item.planned_cents / totalVariable) : 0;
  });

  // Default splits if none found
  const defaultSplits = {
    groceries: 0.4,
    gas: 0.2,
    eating_out: 0.2,
    fun: 0.15,
    misc: 0.05
  };

  return {
    incomes: incomes.length > 0 ? incomes : [{ amount: 500, cadence: 'weekly', source: 'Primary Income' }],
    fixed_expenses: fixed_expenses,
    variable_preferences: {
      save_rate: 0.20, // Default save rate
      splits: Object.keys(splits).length > 0 ? splits : defaultSplits
    },
    goals: [] // Goals are not stored in this simplified structure
  };
}