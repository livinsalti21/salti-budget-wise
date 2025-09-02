// Save-n-Stack Budget Fallback Engine
export type Money = number;
export type Line = { name: string; amount: Money; notes?: string };

export type ProfileType = "student" | "family";

export type FallbackInput = {
  profile: ProfileType;      // "student" or "family"
  income: Money;             // weekly income
  fixedExpenses: Line[];     // rent, childcare, phone, subscriptions, etc.
  debtMinimums: Line[];      // minimum payments only
  savingsTarget: Money;      // desired weekly savings
};

export type BudgetResult = {
  weeklyBudget: {
    incomeWeekly: Money;
    savingsTarget: Money;    // actual reserved after constraints
    categories: Line[];      // fixed + debts + variable buckets
  };
  tips: string[];
};

const round = (n: number) => Math.max(0, Math.round(n));
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * Save-n-Stack allocator:
 * 1) Pay fixed + debt minimums first (mustPay).
 * 2) Reserve savings next (respect profile floor/cap when possible).
 *    - Student: floor 5% income, cap 20%.
 *    - Family : floor 8% income, cap 25%.
 * 3) Split remainder by profile:
 *    - Student:  Groceries 35%, Transport 20%, Discretionary 35%, Buffer 10%
 *    - Family:   Groceries 40%, Transport 18%, Discretionary 27%, Buffer 15%
 * 4) Guards:
 *    - Groceries cap: 22% income (student), 28% (family). Overflow -> Buffer.
 *    - If Discretionary > 18% income, skim 60% of the excess to Savings (auto-boost).
 *    - If remainder < $20, send it all to Buffer.
 * 5) Max 3 tips.
 */
export function createFallbackBudget(input: FallbackInput): BudgetResult {
  const profile = input.profile === "family" ? "family" : "student";
  const income = Math.max(0, input.income || 0);
  const fixedTotal = round(input.fixedExpenses.reduce((a, x) => a + (x.amount || 0), 0));
  const debtTotal  = round(input.debtMinimums.reduce((a, x) => a + (x.amount || 0), 0));
  const mustPay = fixedTotal + debtTotal;

  const P = profile === "student"
    ? { split: { g: 0.35, t: 0.20, d: 0.35, b: 0.10 }, grocCap: 0.22, discCapBoost: 0.18, saveFloor: 0.05, saveCap: 0.20 }
    : { split: { g: 0.40, t: 0.18, d: 0.27, b: 0.15 }, grocCap: 0.28, discCapBoost: 0.18, saveFloor: 0.08, saveCap: 0.25 };

  const desiredSavings = round(input.savingsTarget || 0);
  const floorSavings = round(income * P.saveFloor);
  const capSavings   = round(income * P.saveCap);
  let provisionalSavings = clamp(desiredSavings, floorSavings, Math.max(capSavings, desiredSavings));

  let canSave = Math.max(0, Math.min(provisionalSavings, income - mustPay));
  let remainder = income - mustPay - canSave;

  let g = 0, t = 0, d = 0, b = 0;

  if (remainder <= 0) {
    remainder = 0;
  } else if (remainder < 20) {
    b = round(remainder);
  } else {
    g = round(remainder * P.split.g);
    t = round(remainder * P.split.t);
    d = round(remainder * P.split.d);
    b = round(remainder - (g + t + d));

    const gCapAbs = round(income * P.grocCap);
    if (g > gCapAbs) {
      const overflow = g - gCapAbs;
      g = gCapAbs;
      b += overflow;
    }

    const discCapAbs = round(income * P.discCapBoost);
    if (d > discCapAbs) {
      const skim = Math.floor((d - discCapAbs) * 0.6); // move 60% of excess to Savings
      if (skim > 0) {
        d -= skim;
        canSave += skim;
      }
    }

    const totalVars = g + t + d + b;
    const diff = round(remainder - totalVars);
    if (diff !== 0) b = round(b + diff);
  }

  const categories: Line[] = [];
  input.fixedExpenses.forEach(f => categories.push({ name: f.name, amount: round(f.amount) }));
  input.debtMinimums.forEach(dLine => categories.push({ name: dLine.name, amount: round(dLine.amount), notes: "Minimum payment" }));
  if (g > 0) categories.push({ name: "Groceries", amount: g });
  if (t > 0) categories.push({ name: "Transport", amount: t });
  if (d > 0) categories.push({ name: "Discretionary", amount: d });
  if (b > 0) categories.push({ name: "Buffer", amount: b, notes: "Unexpected small costs" });

  const tips: string[] = [];
  if (desiredSavings > canSave) tips.push("Savings trimmed to fit income. Increase income or reduce discretionary to hit your goal.");
  if (income < mustPay) tips.push("Fixed + debt exceed income. Consider negotiating bills, pausing subscriptions, or refinancing high-APR debt.");
  if (g > round(income * P.grocCap * 0.9)) tips.push("Groceries near cap. Use a meal plan or bulk staples to save.");
  if (d > 0 && canSave > 0) tips.push("Keep discretionary within plan so you don't dip into Savings or Buffer.");
  if (remainder < 20 && remainder >= 0) tips.push("Very tight week. Route extras to Buffer and avoid unplanned spend.");

  return {
    weeklyBudget: {
      incomeWeekly: round(income),
      savingsTarget: round(canSave),
      categories,
    },
    tips: tips.slice(0, 3),
  };
}