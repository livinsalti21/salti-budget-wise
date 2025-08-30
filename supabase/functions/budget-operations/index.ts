import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } }
      }
    );

    const { action, ...params } = await req.json();
    console.log('Budget operation:', action, params);

    switch (action) {
      case 'get_balance_sheet':
        return await getBalanceSheet(supabase, params);
      case 'get_budget_analytics':
        return await getBudgetAnalytics(supabase, params);
      case 'export_budget':
        return await exportBudget(supabase, params);
      case 'calculate_budget':
        return await calculateBudget(supabase, params);
      case 'process_csv_upload':
        return await processCSVUpload(supabase, params);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error in budget-operations:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getBalanceSheet(supabase: any, { userId, weekStart }: any) {
  try {
    // Get current week's budget
    const { data: budget } = await supabase
      .from('budgets')
      .select(`
        id,
        title,
        week_start_date,
        budget_items (
          category,
          planned_cents,
          actual_cents
        )
      `)
      .eq('user_id', userId)
      .eq('week_start_date', weekStart)
      .single();

    if (!budget) {
      return new Response(JSON.stringify({ error: 'Budget not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const items = budget.budget_items || [];
    
    // Categorize items for balance sheet
    const assets = items
      .filter((item: any) => item.category.toLowerCase().includes('income'))
      .map((item: any) => ({
        name: item.category,
        planned: item.planned_cents / 100,
        actual: item.actual_cents / 100
      }));

    const liabilities = items
      .filter((item: any) => 
        !item.category.toLowerCase().includes('income') && 
        !item.category.toLowerCase().includes('save')
      )
      .map((item: any) => ({
        name: item.category,
        planned: item.planned_cents / 100,
        actual: item.actual_cents / 100
      }));

    const savings = items
      .filter((item: any) => item.category.toLowerCase().includes('save'))
      .map((item: any) => ({
        name: item.category,
        planned: item.planned_cents / 100,
        actual: item.actual_cents / 100
      }));

    // Calculate totals
    const totalIncome = assets.reduce((sum, asset) => sum + asset.planned, 0);
    const totalExpenses = liabilities.reduce((sum, liability) => sum + liability.planned, 0);
    const totalSavings = savings.reduce((sum, saving) => sum + saving.planned, 0);
    const netWorth = totalIncome - totalExpenses;

    // Calculate actual vs planned variance
    const actualIncome = assets.reduce((sum, asset) => sum + asset.actual, 0);
    const actualExpenses = liabilities.reduce((sum, liability) => sum + liability.actual, 0);
    const actualSavings = savings.reduce((sum, saving) => sum + saving.actual, 0);

    const balanceSheet = {
      budget_id: budget.id,
      week_start: budget.week_start_date,
      title: budget.title,
      assets: {
        items: assets,
        total_planned: totalIncome,
        total_actual: actualIncome,
        variance: actualIncome - totalIncome
      },
      liabilities: {
        items: liabilities,
        total_planned: totalExpenses,
        total_actual: actualExpenses,
        variance: actualExpenses - totalExpenses
      },
      savings: {
        items: savings,
        total_planned: totalSavings,
        total_actual: actualSavings,
        variance: actualSavings - totalSavings
      },
      net_worth: {
        planned: netWorth,
        actual: actualIncome - actualExpenses,
        savings_rate: totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0
      },
      health_score: calculateHealthScore({
        income: totalIncome,
        expenses: totalExpenses,
        savings: totalSavings,
        variance: Math.abs(actualExpenses - totalExpenses)
      })
    };

    return new Response(JSON.stringify({ balance_sheet: balanceSheet }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error getting balance sheet:', error);
    throw error;
  }
}

async function getBudgetAnalytics(supabase: any, { userId, weeksBack = 8 }: any) {
  try {
    // Get budget history
    const { data: budgets } = await supabase
      .from('budgets')
      .select(`
        id,
        week_start_date,
        budget_items (
          category,
          planned_cents,
          actual_cents
        )
      `)
      .eq('user_id', userId)
      .order('week_start_date', { ascending: false })
      .limit(weeksBack);

    const analytics = budgets?.map((budget: any) => {
      const items = budget.budget_items || [];
      const totalIncome = items
        .filter((item: any) => item.category.toLowerCase().includes('income'))
        .reduce((sum: number, item: any) => sum + item.planned_cents, 0) / 100;
      
      const totalExpenses = items
        .filter((item: any) => !item.category.toLowerCase().includes('income') && !item.category.toLowerCase().includes('save'))
        .reduce((sum: number, item: any) => sum + item.planned_cents, 0) / 100;
      
      const totalSavings = items
        .filter((item: any) => item.category.toLowerCase().includes('save'))
        .reduce((sum: number, item: any) => sum + item.planned_cents, 0) / 100;

      return {
        week: budget.week_start_date,
        income: totalIncome,
        expenses: totalExpenses,
        savings: totalSavings,
        savings_rate: totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0,
        net_worth: totalIncome - totalExpenses
      };
    }) || [];

    return new Response(JSON.stringify({ analytics }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error getting budget analytics:', error);
    throw error;
  }
}

async function exportBudget(supabase: any, { userId, budgetId, format }: any) {
  try {
    // Get budget data
    const { data: budget } = await supabase
      .from('budgets')
      .select(`
        *,
        budget_items (*)
      `)
      .eq('id', budgetId)
      .eq('user_id', userId)
      .single();

    if (!budget) {
      throw new Error('Budget not found');
    }

    if (format === 'csv') {
      const csvData = generateCSV(budget);
      return new Response(csvData, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="budget-${budget.week_start_date}.csv"`
        },
      });
    }

    // For other formats, return structured data
    return new Response(JSON.stringify({ budget }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error exporting budget:', error);
    throw error;
  }
}

async function calculateBudget(supabase: any, { userId, budgetData }: any) {
  try {
    // Server-side budget calculations with enhanced logic
    const weeklyIncome = budgetData.incomes.reduce((sum: number, income: any) => {
      return sum + normalizeToWeekly(income.amount, income.cadence);
    }, 0);

    const weeklyFixedExpenses = budgetData.fixed_expenses.reduce((sum: number, expense: any) => {
      return sum + normalizeToWeekly(expense.amount, expense.cadence);
    }, 0);

    const remainder = weeklyIncome - weeklyFixedExpenses;
    const saveRate = budgetData.variable_preferences?.save_rate || 0.2;
    const savings = remainder * saveRate;
    const variableSpending = remainder - savings;

    const splits = budgetData.variable_preferences?.splits || {
      groceries: 0.4,
      gas: 0.2,
      eating_out: 0.2,
      fun: 0.15,
      misc: 0.05
    };

    const allocations = Object.entries(splits).map(([category, percentage]) => ({
      name: category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      weekly_amount: variableSpending * (percentage as number)
    }));

    const result = {
      weekly: {
        income: weeklyIncome,
        fixed: weeklyFixedExpenses,
        save_n_stack: savings,
        variable_total: variableSpending,
        remainder,
        allocations
      },
      status: getStatus(remainder, weeklyIncome),
      tips: generateTips(weeklyIncome, weeklyFixedExpenses, savings, remainder)
    };

    return new Response(JSON.stringify({ budget_result: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error calculating budget:', error);
    throw error;
  }
}

// Helper functions
function normalizeToWeekly(amount: number, cadence: string): number {
  const cadenceMap: Record<string, number> = {
    'weekly': 1,
    'biweekly': 0.5,
    'monthly': 12 / 52,
    'yearly': 1 / 52,
    'daily': 7
  };
  return amount * (cadenceMap[cadence.toLowerCase()] || 1);
}

function calculateHealthScore(data: any): number {
  let score = 50; // Base score
  
  // Income stability (higher income = better score)
  if (data.income > 1000) score += 20;
  else if (data.income > 500) score += 10;
  
  // Expense ratio (lower expenses relative to income = better)
  const expenseRatio = data.expenses / data.income;
  if (expenseRatio < 0.5) score += 20;
  else if (expenseRatio < 0.7) score += 10;
  else if (expenseRatio > 0.9) score -= 20;
  
  // Savings rate (higher savings = better)
  const savingsRatio = data.savings / data.income;
  if (savingsRatio > 0.2) score += 15;
  else if (savingsRatio > 0.1) score += 10;
  else if (savingsRatio < 0.05) score -= 15;
  
  // Budget accuracy (lower variance = better)
  const accuracyRatio = data.variance / data.expenses;
  if (accuracyRatio < 0.1) score += 15;
  else if (accuracyRatio < 0.2) score += 5;
  else if (accuracyRatio > 0.5) score -= 15;
  
  return Math.max(0, Math.min(100, score));
}

function getStatus(remainder: number, income: number): string {
  const ratio = remainder / income;
  if (ratio > 0.3) return 'healthy';
  if (ratio > 0.1) return 'warning';
  return 'critical';
}

function generateTips(income: number, expenses: number, savings: number, remainder: number): string[] {
  const tips = [];
  
  const savingsRate = savings / income;
  if (savingsRate < 0.15) {
    tips.push('Consider increasing your savings rate to at least 15% for better financial health.');
  }
  
  const expenseRatio = expenses / income;
  if (expenseRatio > 0.7) {
    tips.push('Your fixed expenses are high relative to income. Look for opportunities to reduce recurring costs.');
  }
  
  if (remainder < 100) {
    tips.push('You have limited flexibility in your budget. Consider finding additional income sources.');
  }
  
  return tips;
}

async function processCSVUpload(supabase: any, { userId, uploadId, csvContent }: any) {
  try {
    console.log('Processing CSV upload for user:', userId, 'Upload ID:', uploadId);
    
    // Parse CSV content
    const lines = csvContent.split('\n').filter((line: string) => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file must contain headers and at least one data row');
    }

    const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
    const rows = lines.slice(1).map((line: string) => {
      const values = line.split(',').map((v: string) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    console.log('Parsed CSV headers:', headers);
    console.log('Parsed rows count:', rows.length);

    // Smart column detection
    const incomes: any[] = [];
    const fixed_expenses: any[] = [];
    const goals: any[] = [];
    
    // Detect column mappings
    const categoryCol = headers.find(h => h.includes('category') || h.includes('item') || h.includes('name')) || headers[0];
    const amountCol = headers.find(h => h.includes('amount') || h.includes('value') || h.includes('cost')) || headers[1];
    const typeCol = headers.find(h => h.includes('type') || h.includes('kind'));
    const frequencyCol = headers.find(h => h.includes('frequency') || h.includes('cadence') || h.includes('period'));
    const descriptionCol = headers.find(h => h.includes('description') || h.includes('note'));

    console.log('Column mappings:', { categoryCol, amountCol, typeCol, frequencyCol });

    rows.forEach((row, index) => {
      const category = row[categoryCol] || `Item ${index + 1}`;
      const amountStr = row[amountCol] || '0';
      const amount = parseFloat(amountStr.replace(/[^\d.-]/g, '')) || 0;
      const type = row[typeCol]?.toLowerCase() || '';
      const frequency = row[frequencyCol]?.toLowerCase() || 'monthly';
      const description = row[descriptionCol] || '';

      if (amount <= 0) return; // Skip zero amounts

      // Categorize based on type or keywords
      if (type.includes('income') || type.includes('salary') || type.includes('wage') ||
          category.toLowerCase().includes('income') || category.toLowerCase().includes('salary')) {
        incomes.push({
          amount,
          cadence: normalizeFrequency(frequency),
          source: category
        });
      } else if (type.includes('goal') || type.includes('target') || type.includes('save') ||
                 category.toLowerCase().includes('goal') || category.toLowerCase().includes('save')) {
        // Try to extract target date from description
        const dateMatch = description.match(/(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})/);
        const targetDate = dateMatch ? dateMatch[0] : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        goals.push({
          name: category,
          target_amount: amount,
          due_date: targetDate
        });
      } else {
        // Default to fixed expense
        fixed_expenses.push({
          name: category,
          amount,
          cadence: normalizeFrequency(frequency)
        });
      }
    });

    // If no incomes found, add a default one
    if (incomes.length === 0) {
      const totalExpenses = fixed_expenses.reduce((sum, exp) => sum + normalizeToWeekly(exp.amount, exp.cadence), 0);
      const estimatedIncome = Math.max(totalExpenses * 1.3, 2000); // 30% buffer over expenses, minimum $2000/month
      incomes.push({
        amount: estimatedIncome,
        cadence: 'monthly',
        source: 'Primary Income (estimated)'
      });
    }

    // Create BudgetInput structure
    const budgetInput = {
      incomes,
      fixed_expenses,
      variable_preferences: {
        save_rate: 0.20,
        splits: {
          groceries: 0.4,
          gas: 0.2,
          eating_out: 0.2,
          fun: 0.15,
          misc: 0.05
        }
      },
      goals
    };

    console.log('Generated budget input:', budgetInput);

    // Store the processed budget
    const weekStart = getCurrentWeekStart();
    
    // Create budget record
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .upsert({
        user_id: userId,
        week_start_date: weekStart,
        title: `Budget from CSV Upload`
      })
      .select()
      .single();

    if (budgetError) throw budgetError;

    // Calculate budget result
    const weeklyIncome = incomes.reduce((sum, income) => sum + normalizeToWeekly(income.amount, income.cadence), 0);
    const weeklyFixedExpenses = fixed_expenses.reduce((sum, exp) => sum + normalizeToWeekly(exp.amount, exp.cadence), 0);
    const remainder = weeklyIncome - weeklyFixedExpenses;
    const savings = remainder * 0.20;
    const variableSpending = remainder - savings;

    const splits = budgetInput.variable_preferences.splits;
    const allocations = Object.entries(splits).map(([category, percentage]) => ({
      name: category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      weekly_amount: variableSpending * (percentage as number)
    }));

    // Delete existing budget items
    await supabase.from('budget_items').delete().eq('budget_id', budget.id);

    // Create budget items
    const budgetItems = [];

    // Income items
    incomes.forEach((income, index) => {
      budgetItems.push({
        budget_id: budget.id,
        category: income.source,
        planned_cents: Math.round(normalizeToWeekly(income.amount, income.cadence) * 100),
        actual_cents: 0
      });
    });

    // Fixed expense items
    fixed_expenses.forEach(expense => {
      budgetItems.push({
        budget_id: budget.id,
        category: expense.name,
        planned_cents: Math.round(normalizeToWeekly(expense.amount, expense.cadence) * 100),
        actual_cents: 0
      });
    });

    // Variable spending allocations
    allocations.forEach(allocation => {
      budgetItems.push({
        budget_id: budget.id,
        category: allocation.name,
        planned_cents: Math.round(allocation.weekly_amount * 100),
        actual_cents: 0
      });
    });

    // Savings
    budgetItems.push({
      budget_id: budget.id,
      category: 'Save n Stack',
      planned_cents: Math.round(savings * 100),
      actual_cents: 0
    });

    // Insert budget items
    const { error: itemsError } = await supabase
      .from('budget_items')
      .insert(budgetItems);

    if (itemsError) throw itemsError;

    // Update upload record with processed status
    if (uploadId) {
      await supabase
        .from('budget_uploads')
        .update({ 
          processed_at: new Date().toISOString(),
          processed_budget_id: budget.id
        })
        .eq('id', uploadId);
    }

    return new Response(JSON.stringify({ 
      success: true,
      budget_input: budgetInput,
      budget_id: budget.id,
      message: `Successfully processed ${rows.length} rows from CSV`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing CSV upload:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

function normalizeFrequency(frequency: string): string {
  const freq = frequency.toLowerCase();
  if (freq.includes('week')) return 'weekly';
  if (freq.includes('month')) return 'monthly';
  if (freq.includes('year')) return 'yearly';
  if (freq.includes('day')) return 'daily';
  return 'monthly'; // default
}

function getCurrentWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek.toISOString().split('T')[0];
}

function generateCSV(budget: any): string {
  const headers = ['Category', 'Planned ($)', 'Actual ($)', 'Variance ($)', 'Variance (%)'];
  const rows = [headers.join(',')];
  
  budget.budget_items?.forEach((item: any) => {
    const planned = item.planned_cents / 100;
    const actual = item.actual_cents / 100;
    const variance = actual - planned;
    const variancePercent = planned > 0 ? (variance / planned) * 100 : 0;
    
    rows.push([
      item.category,
      planned.toFixed(2),
      actual.toFixed(2),
      variance.toFixed(2),
      variancePercent.toFixed(1) + '%'
    ].join(','));
  });
  
  return rows.join('\n');
}