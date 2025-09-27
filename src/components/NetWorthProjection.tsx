import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calculator, Target, DollarSign } from 'lucide-react';

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

  // Real-time projection calculations
  const calculateProjections = () => {
    const monthlyRate = interestRate / 100 / 12;
    const currentSavingsValue = currentSavings;
    
    // Calculate future values with compound interest
    const weeklyValue = currentSavingsValue + (monthlyContribution / 4);
    const monthlyValue = currentSavingsValue + monthlyContribution;
    const yearlyValue = currentSavingsValue * Math.pow(1 + interestRate / 100, 1) + 
                       monthlyContribution * (Math.pow(1 + monthlyRate, 12) - 1) / monthlyRate;
    const fiveYearValue = currentSavingsValue * Math.pow(1 + interestRate / 100, 5) + 
                         monthlyContribution * (Math.pow(1 + monthlyRate, 60) - 1) / monthlyRate;

    return {
      weekly: weeklyValue,
      monthly: monthlyValue,
      yearly: yearlyValue,
      fiveYear: fiveYearValue
    };
  };

  const projections = calculateProjections();

  // Calculate time to reach goal
  const calculateMonthsToGoal = () => {
    if (targetAmount <= currentSavings) return 0;
    return Math.ceil((targetAmount - currentSavings) / monthlyContribution);
  };

  const monthsToGoal = calculateMonthsToGoal();

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
      
      <CardContent className="space-y-6">
        {/* Compact Controls Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left: Controls */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="monthly-contribution">Monthly Contribution: ${monthlyContribution}</Label>
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
                <span>Based on your saves</span>
                <span>$2,000</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-amount">Target Goal</Label>
              <Input 
                id="target-amount" 
                type="number" 
                value={targetAmount} 
                onChange={(e) => setTargetAmount(Number(e.target.value))} 
                className="text-lg font-medium" 
              />
            </div>

            <div className="space-y-3">
              <Label>Expected Annual Return: {interestRate}%</Label>
              <Slider 
                min={1} 
                max={15} 
                step={0.5} 
                value={[interestRate]} 
                onValueChange={(value) => setInterestRate(value[0])}
                className="w-full" 
              />
              
              {/* Quick Presets */}
              <div className="flex gap-2">
                {ratePresets.map((preset) => (
                  <Button
                    key={preset.label}
                    variant={interestRate === preset.rate ? "default" : "outline"}
                    size="sm"
                    onClick={() => setInterestRate(preset.rate)}
                    className="text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Projections */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg bg-success/10 border border-success/20">
                <p className="text-xs text-muted-foreground mb-1">Weekly</p>
                <p className="text-lg font-bold text-success">${projections.weekly.toFixed(0)}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">Monthly</p>
                <p className="text-lg font-bold text-primary">${projections.monthly.toFixed(0)}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-xs text-muted-foreground mb-1">1 Year</p>
                <p className="text-lg font-bold text-accent">${projections.yearly.toLocaleString()}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-xs text-muted-foreground mb-1">5 Years</p>
                <p className="text-lg font-bold text-warning">${projections.fiveYear.toFixed(0)}</p>
              </div>
            </div>

            {/* Goal Progress */}
            <div className="p-4 rounded-lg border bg-gradient-to-r from-success/5 to-success/10">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-success" />
                <span className="font-medium">Time to Goal</span>
              </div>
              <p className="text-sm text-muted-foreground">
                You'll reach your ${targetAmount.toLocaleString()} goal in{' '}
                <span className="font-bold text-success">
                  {monthsToGoal} months
                </span>
                {monthsToGoal > 12 && (
                  <span className="text-muted-foreground"> ({Math.round(monthsToGoal/12 * 10)/10} years)</span>
                )}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex justify-between text-sm p-3 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="font-bold text-primary">${currentSavings.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Current</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-accent">${(projections.fiveYear - currentSavings).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Growth (5yr)</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-success">{((projections.fiveYear / currentSavings - 1) * 100).toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground">Return</div>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="text-center p-3 bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg border border-accent/20">
          <p className="text-sm font-medium text-accent">
            💡 Every save compounds your future wealth. Keep building!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetWorthProjection;