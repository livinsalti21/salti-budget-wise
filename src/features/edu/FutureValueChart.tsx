import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { TrendingUp, Calculator, DollarSign } from 'lucide-react';
import { calculateFutureValue, generateScenarios } from '@/simulation/futureValue';

interface FutureValueChartProps {
  currentSavings?: number;
  weeklyAmount?: number;
}

export default function FutureValueChart({ 
  currentSavings = 0, 
  weeklyAmount = 10 
}: FutureValueChartProps) {
  const [amount, setAmount] = useState(weeklyAmount);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(8);

  const result = calculateFutureValue({
    principal: currentSavings / 100, // Convert from cents
    monthlyContribution: (amount * 52) / 12, // Weekly to monthly
    annualRate: rate / 100,
    years
  });

  const scenarios = generateScenarios(
    currentSavings / 100,
    (amount * 52) / 12,
    years
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const quickExample = calculateFutureValue({
    principal: 0,
    monthlyContribution: 5,
    annualRate: 0.08,
    years: 30
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-success" />
          Future Value Calculator
        </CardTitle>
        <CardDescription>See how your saves could grow over time</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Quick Example Callout */}
        <div className="p-4 bg-gradient-to-r from-success/10 to-success/5 rounded-lg border border-success/20">
          <div className="text-center space-y-2">
            <Calculator className="h-6 w-6 text-success mx-auto" />
            <div className="font-medium">Example Impact</div>
            <div className="text-sm text-muted-foreground">
              $5/week for a year ≈ <strong>{formatCurrency(quickExample.finalAmount)}</strong> in 30 years @ 8%
            </div>
            <div className="text-xs text-muted-foreground">
              Small steps stack big! 📈
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Weekly Save Amount: ${amount}</Label>
            <Slider
              value={[amount]}
              onValueChange={(value) => setAmount(value[0])}
              max={100}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Time Period: {years} years</Label>
            <Slider
              value={[years]}
              onValueChange={(value) => setYears(value[0])}
              max={40}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Expected Return: {rate}% annually</Label>
            <Slider
              value={[rate]}
              onValueChange={(value) => setRate(value[0])}
              max={12}
              min={2}
              step={0.5}
              className="w-full"
            />
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
            <DollarSign className="h-5 w-5 text-primary mx-auto mb-1" />
            <div className="text-lg font-bold text-primary">
              {formatCurrency(result.totalContributions)}
            </div>
            <div className="text-xs text-muted-foreground">You Put In</div>
          </div>

          <div className="text-center p-3 bg-gradient-to-br from-success/10 to-success/5 rounded-lg">
            <TrendingUp className="h-5 w-5 text-success mx-auto mb-1" />
            <div className="text-lg font-bold text-success">
              {formatCurrency(result.totalGrowth)}
            </div>
            <div className="text-xs text-muted-foreground">Growth</div>
          </div>

          <div className="text-center p-3 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg">
            <div className="text-xl">🎉</div>
            <div className="text-lg font-bold text-accent">
              {formatCurrency(result.finalAmount)}
            </div>
            <div className="text-xs text-muted-foreground">Final Amount</div>
          </div>
        </div>

        {/* Scenarios */}
        <div className="space-y-3">
          <h4 className="font-medium">Different Growth Scenarios</h4>
          <div className="space-y-2">
            {scenarios.map((scenario, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                <div>
                  <div className="font-medium">{scenario.name}</div>
                  <div className="text-sm text-muted-foreground">{scenario.rate * 100}% annual return</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatCurrency(scenario.result.finalAmount)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            💡 Projections are estimates. Past performance doesn't guarantee future results.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}