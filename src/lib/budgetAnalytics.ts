import { supabase } from '@/integrations/supabase/client';

export interface BudgetAnalysis {
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  surplus: number;
  categories: CategoryAnalysis[];
}

export interface CategoryAnalysis {
  category: string;
  planned: number;
  actual: number;
  variance: number;
  variancePercentage: number;
  optimizationPotential: number;
  isOverspending: boolean;
}

export interface ScenarioData {
  title: string;
  description: string;
  monthlyExtra: number;
  categories: string[];
  achievability: 'easy' | 'moderate' | 'challenging';
  color: string;
}

export async function getUserBudgetAnalysis(userId: string): Promise<BudgetAnalysis | null> {
  try {
    // Get the most recent budget with items
    const { data: budget } = await supabase
      .from('budgets')
      .select(`
        id,
        budget_items (
          category,
          planned_cents,
          actual_cents
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!budget?.budget_items?.length) {
      return null;
    }

    const items = budget.budget_items;
    
    // Categorize items
    const incomeItems = items.filter(item => 
      item.category.toLowerCase().includes('income') || 
      item.category.toLowerCase().includes('salary')
    );
    
    const savingsItems = items.filter(item => 
      item.category.toLowerCase().includes('save')
    );
    
    const expenseItems = items.filter(item => 
      !item.category.toLowerCase().includes('income') &&
      !item.category.toLowerCase().includes('salary') &&
      !item.category.toLowerCase().includes('save')
    );

    const totalIncome = incomeItems.reduce((sum, item) => sum + item.planned_cents, 0) / 100;
    const totalSavings = savingsItems.reduce((sum, item) => sum + item.planned_cents, 0) / 100;
    const totalExpenses = expenseItems.reduce((sum, item) => sum + item.planned_cents, 0) / 100;
    
    const categories: CategoryAnalysis[] = expenseItems.map(item => {
      const planned = item.planned_cents / 100;
      const actual = item.actual_cents / 100;
      const variance = actual - planned;
      const variancePercentage = planned > 0 ? (variance / planned) * 100 : 0;
      
      // Calculate optimization potential based on category and variance
      let optimizationPotential = 0;
      const categoryLower = item.category.toLowerCase();
      
      if (categoryLower.includes('eating out') || categoryLower.includes('restaurant')) {
        optimizationPotential = planned * 0.5; // Can reduce dining out by 50%
      } else if (categoryLower.includes('fun') || categoryLower.includes('entertainment')) {
        optimizationPotential = planned * 0.3; // Can reduce entertainment by 30%
      } else if (categoryLower.includes('groceries') || categoryLower.includes('food')) {
        optimizationPotential = planned * 0.15; // Can optimize groceries by 15%
      } else if (categoryLower.includes('misc') || categoryLower.includes('shopping')) {
        optimizationPotential = planned * 0.4; // Can reduce misc spending by 40%
      } else if (categoryLower.includes('gas') || categoryLower.includes('transport')) {
        optimizationPotential = planned * 0.2; // Can optimize transportation by 20%
      } else {
        optimizationPotential = Math.max(0, variance); // Only if overspending
      }

      return {
        category: item.category,
        planned,
        actual,
        variance,
        variancePercentage,
        optimizationPotential,
        isOverspending: variance > 0
      };
    });

    const surplus = totalIncome - totalExpenses - totalSavings;

    return {
      totalIncome,
      totalExpenses,
      totalSavings,
      surplus,
      categories
    };
  } catch (error) {
    console.error('Error analyzing budget:', error);
    return null;
  }
}

export function generateDataDrivenScenarios(analysis: BudgetAnalysis): ScenarioData[] {
  const scenarios: ScenarioData[] = [];

  // Conservative scenario - optimize highest variance category
  const highestVarianceCategory = analysis.categories
    .filter(cat => cat.isOverspending)
    .sort((a, b) => b.variance - a.variance)[0];

  if (highestVarianceCategory) {
    scenarios.push({
      title: 'Fix Overspending',
      description: `Reduce ${highestVarianceCategory.category} back to planned amount`,
      monthlyExtra: Math.round(highestVarianceCategory.variance * 4), // Weekly to monthly
      categories: [highestVarianceCategory.category],
      achievability: 'easy',
      color: 'bg-success'
    });
  }

  // Moderate scenario - optimize top optimization opportunities
  const topOptimizations = analysis.categories
    .sort((a, b) => b.optimizationPotential - a.optimizationPotential)
    .slice(0, 2);

  if (topOptimizations.length > 0) {
    const totalOptimization = topOptimizations.reduce((sum, cat) => sum + cat.optimizationPotential, 0);
    scenarios.push({
      title: 'Smart Optimization',
      description: `Optimize ${topOptimizations.map(cat => cat.category).join(' & ')}`,
      monthlyExtra: Math.round(totalOptimization * 4), // Weekly to monthly
      categories: topOptimizations.map(cat => cat.category),
      achievability: 'moderate',
      color: 'bg-accent'
    });
  }

  // Aggressive scenario - use surplus + optimizations
  if (analysis.surplus > 0) {
    const totalPotential = analysis.surplus + 
      analysis.categories.reduce((sum, cat) => sum + cat.optimizationPotential * 0.5, 0);
    
    scenarios.push({
      title: 'Maximum Potential',
      description: `Use surplus + optimize all categories`,
      monthlyExtra: Math.round(totalPotential * 4), // Weekly to monthly
      categories: ['All categories'],
      achievability: 'challenging',
      color: 'bg-primary'
    });
  } else {
    // If no surplus, create aggressive optimization scenario
    const totalOptimization = analysis.categories
      .reduce((sum, cat) => sum + cat.optimizationPotential * 0.7, 0);
    
    scenarios.push({
      title: 'Deep Optimization',
      description: 'Optimize all spending categories',
      monthlyExtra: Math.round(totalOptimization * 4),
      categories: analysis.categories.map(cat => cat.category),
      achievability: 'challenging', 
      color: 'bg-primary'
    });
  }

  // If we have less than 3 scenarios, add a side income scenario
  if (scenarios.length < 3) {
    const sidehustleAmount = Math.round(analysis.totalIncome * 0.3); // 30% of current income
    scenarios.push({
      title: 'Side Income',
      description: 'Add part-time income stream',
      monthlyExtra: sidehustleAmount,
      categories: ['Income'],
      achievability: 'moderate',
      color: 'bg-warning'
    });
  }

  return scenarios.slice(0, 3); // Return top 3 scenarios
}

export function getBudgetInsights(analysis: BudgetAnalysis): string[] {
  const insights: string[] = [];

  // Surplus/deficit insight
  if (analysis.surplus > 0) {
    insights.push(`You have $${Math.round(analysis.surplus * 4)}/month in unallocated income`);
  } else if (analysis.surplus < -10) {
    insights.push(`Your budget is over by $${Math.round(Math.abs(analysis.surplus) * 4)}/month`);
  }

  // Savings rate insight
  const savingsRate = (analysis.totalSavings / analysis.totalIncome) * 100;
  if (savingsRate < 10) {
    insights.push(`Your savings rate is ${savingsRate.toFixed(1)}% - aim for 20%+`);
  } else if (savingsRate > 25) {
    insights.push(`Great job! ${savingsRate.toFixed(1)}% savings rate is excellent`);
  }

  // Overspending insight
  const overspendingCategories = analysis.categories.filter(cat => cat.isOverspending);
  if (overspendingCategories.length > 0) {
    const totalOverspend = overspendingCategories.reduce((sum, cat) => sum + cat.variance, 0);
    insights.push(`You're overspending by $${Math.round(totalOverspend * 4)}/month in ${overspendingCategories.length} categories`);
  }

  // Optimization opportunity
  const totalOptimization = analysis.categories.reduce((sum, cat) => sum + cat.optimizationPotential, 0);
  if (totalOptimization > 25) {
    insights.push(`You could potentially save $${Math.round(totalOptimization * 4)}/month with smart optimizations`);
  }

  return insights.slice(0, 3); // Return top 3 insights
}