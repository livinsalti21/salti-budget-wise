export interface BudgetInput {
  monthlyIncome: number;
  expenses: {
    category: string;
    planned: number;
    actual?: number;
  }[];
}

export interface BudgetOutput {
  totalPlanned: number;
  totalActual: number;
  monthlyLeftover: number;
  suggestedSaveAmount: number;
  categories: {
    category: string;
    planned: number;
    actual: number;
    variance: number;
    varancePercentage: number;
  }[];
}

export function simulateBudget(input: BudgetInput): BudgetOutput {
  const totalPlanned = input.expenses.reduce((sum, exp) => sum + exp.planned, 0);
  const totalActual = input.expenses.reduce((sum, exp) => sum + (exp.actual || exp.planned), 0);
  
  const monthlyLeftover = input.monthlyIncome - totalActual;
  
  // Suggest saving 20% of leftover, or $25 minimum if leftover is low
  const suggestedSaveAmount = Math.max(
    Math.round(monthlyLeftover * 0.2),
    monthlyLeftover > 100 ? 25 : 10
  );

  const categories = input.expenses.map(exp => {
    const actual = exp.actual || exp.planned;
    const variance = actual - exp.planned;
    const variancePercentage = exp.planned > 0 ? (variance / exp.planned) * 100 : 0;
    
    return {
      category: exp.category,
      planned: exp.planned,
      actual,
      variance,
      varancePercentage: variancePercentage
    };
  });

  return {
    totalPlanned,
    totalActual,
    monthlyLeftover,
    suggestedSaveAmount,
    categories
  };
}

export function generateSampleBudget(): BudgetInput {
  return {
    monthlyIncome: 2500,
    expenses: [
      { category: 'Housing', planned: 800 },
      { category: 'Food', planned: 400 },
      { category: 'Transportation', planned: 200 },
      { category: 'Entertainment', planned: 150 },
      { category: 'Shopping', planned: 100 },
      { category: 'Subscriptions', planned: 50 },
    ]
  };
}