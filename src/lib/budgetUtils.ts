export interface BudgetInput {
  incomes: Array<{
    amount: number;
    cadence: string;
    source?: string;
  }>;
  fixed_expenses: Array<{
    name: string;
    amount: number;
    cadence: string;
  }>;
  variable_preferences: {
    save_rate: number;
    splits: Record<string, number>;
  };
  goals: Array<{
    name: string;
    target_amount: number;
    due_date: string;
  }>;
}

export interface WeeklyBudgetResult {
  weekly: {
    income: number;
    fixed: number;
    sinking: number;
    remainder: number;
    save_n_stack: number;
    variable_total: number;
    allocations: Array<{
      type: string;
      name: string;
      weekly_amount: number;
    }>;
  };
  tips: string[];
  status: 'healthy' | 'warning' | 'critical';
}

export type UserPlan = 'free' | 'pro' | 'family';

// Normalize different cadences to weekly amounts
export function normToWeekly(amount: number, cadence: string): number {
  const c = cadence.toLowerCase();
  if (c === 'weekly') return amount;
  if (c === 'biweekly') return amount / 2;
  if (c === 'semimonthly') return (amount * 2) / 4.345; // 2 payments per month
  if (c === 'monthly') return amount / 4.345; // ~4.345 weeks per month
  if (c === 'annual') return amount / 52;
  return amount; // fallback
}

// Calculate weeks until a target date
function weeksUntil(dateStr: string): number {
  const now = new Date();
  const end = new Date(dateStr);
  const ms = Math.max(0, end.getTime() - now.getTime());
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24 * 7)));
}

// Free plan limits
export const FREE_LIMITS = {
  incomes: 1,
  fixed_expenses: 4,
  goals: 1
};

// Check if user exceeds free plan limits
export function checkFreeLimits(inputs: BudgetInput): { ok: boolean; reason?: string } {
  if (inputs.incomes.length > FREE_LIMITS.incomes) {
    return { ok: false, reason: 'INCOME_LIMIT' };
  }
  if (inputs.fixed_expenses.length > FREE_LIMITS.fixed_expenses) {
    return { ok: false, reason: 'BILL_LIMIT' };
  }
  if (inputs.goals.length > FREE_LIMITS.goals) {
    return { ok: false, reason: 'GOAL_LIMIT' };
  }
  return { ok: true };
}

// Main budget computation function
export function computeWeeklyBudget(
  inputs: BudgetInput,
  userPlan: UserPlan,
  defaultSplits?: { save_rate: number; splits: Record<string, number> }
): WeeklyBudgetResult {
  // Calculate weekly totals
  const weeklyIncome = inputs.incomes.reduce((sum, income) => 
    sum + normToWeekly(income.amount, income.cadence), 0
  );
  
  const weeklyFixed = inputs.fixed_expenses.reduce((sum, expense) => 
    sum + normToWeekly(expense.amount, expense.cadence), 0
  );
  
  const weeklySinking = inputs.goals.reduce((sum, goal) => 
    sum + (goal.target_amount / weeksUntil(goal.due_date)), 0
  );

  const remainder = Math.max(0, weeklyIncome - weeklyFixed - weeklySinking);

  // Determine save rate (Free users locked to 20%)
  let saveRate = 0.20; // Default for free users
  if (userPlan !== 'free') {
    saveRate = inputs.variable_preferences?.save_rate || defaultSplits?.save_rate || 0.20;
  }

  const save_n_stack = remainder * saveRate;
  const variable_total = remainder - save_n_stack;

  // Determine category splits (Free users use defaults)
  let splits: Record<string, number> = {
    groceries: 0.4,
    gas: 0.2,
    eating_out: 0.2,
    fun: 0.15,
    misc: 0.05
  };

  if (userPlan !== 'free' && inputs.variable_preferences?.splits) {
    splits = { ...splits, ...inputs.variable_preferences.splits };
  } else if (defaultSplits?.splits) {
    splits = { ...splits, ...defaultSplits.splits };
  }

  // Calculate allocations
  const totalSplitPct = Object.values(splits).reduce((a, b) => a + b, 0) || 1;
  const allocations = Object.entries(splits).map(([name, pct]) => ({
    type: 'variable',
    name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    weekly_amount: Number((variable_total * (pct / totalSplitPct)).toFixed(2))
  }));

  // Generate tips and determine status
  const tips: string[] = [];
  let status: 'healthy' | 'warning' | 'critical' = 'healthy';

  if (remainder <= 0) {
    tips.push('⚠️ Your fixed expenses exceed your income. Consider reducing bills or increasing income.');
    status = 'critical';
  } else if (remainder < weeklyIncome * 0.2) {
    tips.push('⚠️ Very tight budget. Look for ways to reduce fixed expenses.');
    status = 'warning';
  } else if (save_n_stack < weeklyIncome * 0.15) {
    tips.push('💡 Try to save at least 15% of your income for financial security.');
    status = 'warning';
  } else {
    tips.push('✅ Great job! You have a healthy budget with good savings.');
  }

  // Add Pro-specific tips
  if (userPlan !== 'free' && variable_total > 100) {
    const trimAmount = Math.min(20, Math.round(variable_total * 0.05));
    tips.push(`💡 Consider reducing eating out by $${trimAmount}/week to boost your savings.`);
  }

  return {
    weekly: {
      income: Number(weeklyIncome.toFixed(2)),
      fixed: Number(weeklyFixed.toFixed(2)),
      sinking: Number(weeklySinking.toFixed(2)),
      remainder: Number(remainder.toFixed(2)),
      save_n_stack: Number(save_n_stack.toFixed(2)),
      variable_total: Number(variable_total.toFixed(2)),
      allocations
    },
    tips,
    status
  };
}

// Get current week start date (Monday)
export function getCurrentWeekStart(): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const weekStart = new Date(today);
  // Set to Monday (day 1)
  weekStart.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  return weekStart.toISOString().split('T')[0];
}

// Get current week end date (Sunday)
export function getCurrentWeekEnd(): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const weekEnd = new Date(today);
  // Set to Sunday (day 0 next week)
  weekEnd.setDate(today.getDate() + (dayOfWeek === 0 ? 0 : 7 - dayOfWeek));
  return weekEnd.toISOString().split('T')[0];
}

// Format currency
export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}