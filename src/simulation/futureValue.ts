export interface FutureValueInput {
  principal: number;        // Initial amount
  monthlyContribution: number;
  annualRate: number;       // As decimal (0.08 for 8%)
  years: number;
}

export interface FutureValueOutput {
  finalAmount: number;
  totalContributions: number;
  totalGrowth: number;
  breakdown: {
    year: number;
    yearEndBalance: number;
    yearlyGrowth: number;
    yearlyContributions: number;
  }[];
}

export function calculateFutureValue(input: FutureValueInput): FutureValueOutput {
  const { principal, monthlyContribution, annualRate, years } = input;
  const monthlyRate = annualRate / 12;
  const totalMonths = years * 12;
  
  let balance = principal;
  const breakdown: FutureValueOutput['breakdown'] = [];
  
  for (let year = 1; year <= years; year++) {
    const startBalance = balance;
    let yearlyGrowth = 0;
    let yearlyContributions = 0;
    
    // Calculate month by month for this year
    for (let month = 1; month <= 12; month++) {
      // Add monthly contribution
      balance += monthlyContribution;
      yearlyContributions += monthlyContribution;
      
      // Apply monthly growth
      const monthlyGrowth = balance * monthlyRate;
      balance += monthlyGrowth;
      yearlyGrowth += monthlyGrowth;
    }
    
    breakdown.push({
      year,
      yearEndBalance: Math.round(balance * 100) / 100,
      yearlyGrowth: Math.round(yearlyGrowth * 100) / 100,
      yearlyContributions
    });
  }
  
  const totalContributions = principal + (monthlyContribution * totalMonths);
  const totalGrowth = balance - totalContributions;
  
  return {
    finalAmount: Math.round(balance * 100) / 100,
    totalContributions,
    totalGrowth: Math.round(totalGrowth * 100) / 100,
    breakdown
  };
}

export function quickProjection(amount: number, years: number, rate: number = 0.08): number {
  // Simple compound interest calculation for quick estimates
  return Math.round(amount * Math.pow(1 + rate, years) * 100) / 100;
}

export function calculateSavingsGoal(targetAmount: number, years: number, rate: number = 0.08): number {
  // Calculate required monthly payment to reach target
  const monthlyRate = rate / 12;
  const totalMonths = years * 12;
  
  if (monthlyRate === 0) {
    return targetAmount / totalMonths;
  }
  
  const monthlyPayment = targetAmount * monthlyRate / 
    (Math.pow(1 + monthlyRate, totalMonths) - 1);
    
  return Math.round(monthlyPayment * 100) / 100;
}

export const DEFAULT_SCENARIOS = [
  { name: 'Conservative', rate: 0.04 },
  { name: 'Moderate', rate: 0.07 },
  { name: 'Aggressive', rate: 0.10 },
] as const;

export function generateScenarios(principal: number, monthlyContribution: number, years: number) {
  return DEFAULT_SCENARIOS.map(scenario => ({
    ...scenario,
    result: calculateFutureValue({
      principal,
      monthlyContribution,
      annualRate: scenario.rate,
      years
    })
  }));
}