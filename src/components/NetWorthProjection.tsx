import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calculator, Target, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface LedgerEntry {
  id: string;
  user_id: string;
  transaction_type: 'SAVE' | 'MATCH_RECEIVED' | 'ADJUSTMENT';
  amount_cents: number;
  running_balance_cents: number;
  description?: string;
  reference_id?: string;
  future_value_40yr_cents: number;
  created_at: string;
}

interface NetWorthProjectionProps {
  currentSavings: number;
  ledgerHistory: LedgerEntry[];
}

const NetWorthProjection = ({ currentSavings, ledgerHistory }: NetWorthProjectionProps) => {
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [targetAmount, setTargetAmount] = useState(10000);
  const [interestRate, setInterestRate] = useState(8);
  const [timeHorizon, setTimeHorizon] = useState(40);

  // Calculate real monthly contribution from user's actual saves
  useEffect(() => {
    if (ledgerHistory && ledgerHistory.length > 0) {
      const saveEntries = ledgerHistory.filter(entry => entry.transaction_type === 'SAVE');
      
      if (saveEntries.length > 0) {
        // Calculate total saves in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentSaves = saveEntries.filter(entry => 
          new Date(entry.created_at) >= thirtyDaysAgo
        );
        
        if (recentSaves.length > 0) {
          const totalRecentSaves = recentSaves.reduce((sum, entry) => sum + entry.amount_cents, 0) / 100;
          setMonthlyContribution(Math.round(totalRecentSaves));
        } else {
          // Fallback: estimate monthly from all saves
          const totalSaves = saveEntries.reduce((sum, entry) => sum + entry.amount_cents, 0) / 100;
          const oldestSave = new Date(saveEntries[saveEntries.length - 1].created_at);
          const daysSinceStart = Math.max(1, (Date.now() - oldestSave.getTime()) / (1000 * 60 * 60 * 24));
          const estimatedMonthly = Math.round((totalSaves / daysSinceStart) * 30);
          setMonthlyContribution(Math.max(50, estimatedMonthly)); // Minimum $50
        }
      }
    }
  }, [ledgerHistory]);

  // Generate year-by-year chart data
  const generateChartData = useMemo(() => {
    const monthlyRate = interestRate / 100 / 12;
    const data = [];
    
    for (let year = 0; year <= timeHorizon; year++) {
      let balance = currentSavings;
      let totalContributions = 0;
      
      // Calculate month by month for this year
      for (let month = 1; month <= year * 12; month++) {
        balance += monthlyContribution;
        totalContributions += monthlyContribution;
        balance += balance * monthlyRate;
      }
      
      const growth = balance - currentSavings - totalContributions;
      
      data.push({
        year,
        totalValue: Math.round(balance),
        contributions: Math.round(currentSavings + totalContributions),
        growth: Math.round(growth)
      });
    }
    
    return data;
  }, [currentSavings, monthlyContribution, interestRate, timeHorizon]);

  // Real-time projection calculations with dynamic milestones
  const calculateProjections = () => {
    const monthlyRate = interestRate / 100 / 12;
    const currentSavingsValue = currentSavings;
    
    // Dynamic milestone years based on time horizon
    const quarterYear = Math.round(timeHorizon / 4);
    const halfYear = Math.round(timeHorizon / 2);
    
    const calculateFutureValue = (years: number) => {
      const months = years * 12;
      return currentSavingsValue * Math.pow(1 + interestRate / 100, years) + 
             monthlyContribution * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
    };

    return {
      oneYear: calculateFutureValue(1),
      quarter: calculateFutureValue(quarterYear),
      half: calculateFutureValue(halfYear),
      final: calculateFutureValue(timeHorizon),
      quarterYear,
      halfYear
    };
  };

  const projections = calculateProjections();

  // Calculate time to reach goal with compound interest
  const calculateMonthsToGoal = () => {
    if (targetAmount <= currentSavings) return -1; // Already achieved
    
    const monthlyRate = interestRate / 100 / 12;
    
    // If no interest, use simple division
    if (interestRate === 0 || monthlyRate === 0) {
      return Math.ceil((targetAmount - currentSavings) / monthlyContribution);
    }
    
    // Solve for n using logarithmic formula: FV = PV(1+r)^n + PMT[(1+r)^n - 1]/r
    const fv = targetAmount;
    const pv = currentSavings;
    const pmt = monthlyContribution;
    const r = monthlyRate;
    
    // Check if goal is mathematically reachable
    const numerator = (fv * r / pmt + 1);
    const denominator = (pv * r / pmt + 1);
    
    if (numerator <= denominator || pmt <= 0) {
      return Infinity; // Goal unreachable with current params
    }
    
    const months = Math.log(numerator / denominator) / Math.log(1 + r);
    
    return Math.ceil(months);
  };

  const monthsToGoal = calculateMonthsToGoal();
  const monthsWithoutInterest = targetAmount > currentSavings && monthlyContribution > 0
    ? Math.ceil((targetAmount - currentSavings) / monthlyContribution)
    : 0;
  const monthsSaved = monthsToGoal > 0 && monthsToGoal !== Infinity 
    ? monthsWithoutInterest - monthsToGoal 
    : 0;

  // Quick preset buttons for interest rates
  const ratePresets = [
    { label: 'Conservative', rate: 4, desc: 'Bonds & CDs' },
    { label: 'Moderate', rate: 8, desc: 'Index Funds' },
    { label: 'Aggressive', rate: 12, desc: 'Growth Stocks' }
  ];

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Your Future Wealth Calculator
        </CardTitle>
        <CardDescription>
          Real-time projections based on your saving patterns
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* Section 1: Input Controls - Horizontal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-muted/20 rounded-xl">
          <div className="space-y-2">
            <Label htmlFor="monthly-contribution" className="text-sm font-medium">
              Monthly Contribution
            </Label>
            <div className="text-2xl font-bold text-primary">${monthlyContribution}</div>
            <Slider 
              id="monthly-contribution"
              min={50} 
              max={2000} 
              step={25} 
              value={[monthlyContribution]} 
              onValueChange={(value) => setMonthlyContribution(value[0])}
              className="w-full" 
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$50</span>
              <span>$2,000</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time-horizon" className="text-sm font-medium">
              Time Horizon
            </Label>
            <div className="text-2xl font-bold text-primary">{timeHorizon} years</div>
            <Slider 
              id="time-horizon"
              min={1} 
              max={50} 
              step={1} 
              value={[timeHorizon]} 
              onValueChange={(value) => setTimeHorizon(value[0])}
              className="w-full" 
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1yr</span>
              <span>50yrs</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-amount" className="text-sm font-medium">
              Target Goal
            </Label>
            <Input 
              id="target-amount" 
              type="number" 
              value={targetAmount} 
              onChange={(e) => setTargetAmount(Number(e.target.value))} 
              className="text-xl font-bold h-12" 
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Annual Return: {interestRate}%
            </Label>
            <Slider 
              min={1} 
              max={15} 
              step={0.5} 
              value={[interestRate]} 
              onValueChange={(value) => setInterestRate(value[0])}
              className="w-full mt-5" 
            />
            <div className="flex gap-2 flex-wrap">
              {ratePresets.map((preset) => (
                <Button
                  key={preset.label}
                  variant={interestRate === preset.rate ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInterestRate(preset.rate)}
                  className="text-xs flex-1"
                >
                  {preset.rate}%
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Chart Visualization */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Compound Growth Over Time
            </CardTitle>
            <CardDescription>
              See how your wealth grows with contributions and compound interest
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={generateChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="year" 
                  label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                  className="text-xs"
                />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  className="text-xs"
                />
                <Tooltip 
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="totalValue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  name="Total Value"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="contributions" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Your Contributions"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="growth" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  name="Interest Growth"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Section 3: Projection Milestone Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center p-4 bg-primary/5 border-primary/20">
            <CardContent className="p-0 space-y-1">
              <p className="text-sm text-muted-foreground">1 Year</p>
              <p className="text-xl font-bold text-primary">${Math.round(projections.oneYear).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="text-center p-4 bg-success/5 border-success/20">
            <CardContent className="p-0 space-y-1">
              <p className="text-sm text-muted-foreground">{projections.quarterYear} Years</p>
              <p className="text-xl font-bold text-success">${Math.round(projections.quarter).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="text-center p-4 bg-accent/5 border-accent/20">
            <CardContent className="p-0 space-y-1">
              <p className="text-sm text-muted-foreground">{projections.halfYear} Years</p>
              <p className="text-xl font-bold text-accent">${Math.round(projections.half).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="text-center p-4 bg-warning/5 border-warning/20">
            <CardContent className="p-0 space-y-1">
              <p className="text-sm text-muted-foreground">{timeHorizon} Years</p>
              <p className="text-xl font-bold text-warning">${Math.round(projections.final).toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Section 4: Goal & Stats - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Time to Goal Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-success" />
                Time to Goal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {monthsToGoal === -1 ? (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">🎉</div>
                  <div className="text-xl font-bold text-success">Goal Already Achieved!</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    You've reached ${targetAmount.toLocaleString()}
                  </p>
                </div>
              ) : monthsToGoal === Infinity ? (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">⚠️</div>
                  <div className="text-lg font-bold text-destructive">Goal Unreachable</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Increase monthly contribution or adjust your timeline
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-success">{monthsToGoal}</div>
                    <div className="text-lg text-muted-foreground">months</div>
                    <div className="text-sm text-muted-foreground">
                      ({(monthsToGoal / 12).toFixed(1)} years)
                    </div>
                  </div>
                  
                  {interestRate > 0 && monthsToGoal < monthsWithoutInterest && (
                    <div className="p-4 bg-success/10 rounded-lg space-y-2 border border-success/20">
                      <div className="text-sm font-medium">Impact of Compound Interest:</div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Without interest:</span>
                          <span className="font-medium">{monthsWithoutInterest} months</span>
                        </div>
                        <div className="flex justify-between">
                          <span>With {interestRate}% returns:</span>
                          <span className="font-medium text-success">{monthsToGoal} months</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-success/20">
                        <div className="text-base font-bold text-success flex items-center gap-2">
                          <span>⚡</span>
                          <span>Saves you {monthsSaved} months!</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="h-5 w-5 text-primary" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">${currentSavings.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground mt-1">Starting Balance</div>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <div className="text-2xl font-bold text-accent">
                    ${Math.round(projections.final - currentSavings - (monthlyContribution * timeHorizon * 12)).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Total Growth</div>
                </div>
                <div className="text-center p-4 bg-success/10 rounded-lg">
                  <div className="text-2xl font-bold text-success">
                    {currentSavings > 0 ? ((projections.final / currentSavings - 1) * 100).toFixed(0) : '0'}%
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Total Return</div>
                </div>
                <div className="text-center p-4 bg-warning/10 rounded-lg">
                  <div className="text-2xl font-bold text-warning">
                    ${(monthlyContribution * timeHorizon * 12).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Your Contributions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Motivational Footer */}
        <div className="text-center p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg border border-accent/20">
          <p className="text-sm font-medium text-accent">
            💡 Every save compounds your future wealth. Small consistent actions create massive results!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetWorthProjection;