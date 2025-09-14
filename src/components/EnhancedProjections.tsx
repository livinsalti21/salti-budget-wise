import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calculator, Target, DollarSign, MessageCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import WhatIfSimulator from '@/components/ai/WhatIfSimulator';

interface ProjectionData {
  year: number;
  value: number;
  contributions: number;
  growth: number;
}

interface ScenarioProps {
  currentSavings: number;
  onUpdate?: (data: any) => void;
}

export const EnhancedProjections: React.FC<ScenarioProps> = ({ currentSavings, onUpdate }) => {
  const [monthlyContribution, setMonthlyContribution] = useState(200);
  const [interestRate, setInterestRate] = useState(8);
  const [timeHorizon, setTimeHorizon] = useState(20);
  const [projectionData, setProjectionData] = useState<ProjectionData[]>([]);
  const [scenarios, setScenarios] = useState({
    conservative: { rate: 5, label: 'Conservative (5%)' },
    moderate: { rate: 8, label: 'Moderate (8%)' },
    aggressive: { rate: 12, label: 'Aggressive (12%)' }
  });
  const [showWhatIf, setShowWhatIf] = useState(false);

  useEffect(() => {
    calculateProjections();
  }, [currentSavings, monthlyContribution, interestRate, timeHorizon]);

  const calculateProjections = () => {
    const data: ProjectionData[] = [];
    let balance = currentSavings;
    const monthlyRate = interestRate / 100 / 12;
    const monthlyContribCents = monthlyContribution * 100;

    for (let year = 0; year <= timeHorizon; year++) {
      const totalContributions = year * 12 * monthlyContribCents;
      const growth = balance - currentSavings - totalContributions;

      data.push({
        year,
        value: Math.round(balance / 100),
        contributions: Math.round((currentSavings + totalContributions) / 100),
        growth: Math.round(Math.max(0, growth) / 100)
      });

      // Calculate next year's balance
      for (let month = 0; month < 12; month++) {
        balance = balance + monthlyContribCents + (balance * monthlyRate);
      }
    }

    setProjectionData(data);
    
    if (onUpdate) {
      onUpdate({
        finalValue: data[data.length - 1]?.value || 0,
        totalContributions: data[data.length - 1]?.contributions || 0,
        totalGrowth: data[data.length - 1]?.growth || 0
      });
    }
  };

  const calculateScenarioValue = (rate: number) => {
    let balance = currentSavings;
    const monthlyRate = rate / 100 / 12;
    const monthlyContribCents = monthlyContribution * 100;

    for (let year = 0; year < timeHorizon; year++) {
      for (let month = 0; month < 12; month++) {
        balance = balance + monthlyContribCents + (balance * monthlyRate);
      }
    }

    return Math.round(balance / 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInvestmentRecommendation = (rate: number) => {
    if (rate <= 4) return { type: 'High-Yield Savings', risk: 'Very Low', color: 'bg-green-100 text-green-800' };
    if (rate <= 6) return { type: 'CDs & Bonds', risk: 'Low', color: 'bg-blue-100 text-blue-800' };
    if (rate <= 8) return { type: 'Index Funds', risk: 'Moderate', color: 'bg-yellow-100 text-yellow-800' };
    if (rate <= 10) return { type: 'Stock Market', risk: 'Moderate-High', color: 'bg-orange-100 text-orange-800' };
    return { type: 'Growth Stocks', risk: 'High', color: 'bg-red-100 text-red-800' };
  };

  const recommendation = getInvestmentRecommendation(interestRate);
  const finalProjection = projectionData[projectionData.length - 1];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Enhanced Future Wealth Projections
          </CardTitle>
          <CardDescription>
            Advanced compound interest calculator with multiple scenarios and investment recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="monthly">Monthly Contribution</Label>
              <Input
                id="monthly"
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="time">Time Horizon (Years)</Label>
              <Input
                id="time"
                type="number"
                value={timeHorizon}
                onChange={(e) => setTimeHorizon(Number(e.target.value))}
                min="1"
                max="50"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="rate">Expected Return: {interestRate}%</Label>
              <Slider
                id="rate"
                min={1}
                max={15}
                step={0.5}
                value={[interestRate]}
                onValueChange={(value) => setInterestRate(value[0])}
                className="mt-3"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Investment Type Recommendation</Label>
              <div className="mt-2">
                <Badge className={recommendation.color}>
                  {recommendation.type} - {recommendation.risk} Risk
                </Badge>
              </div>
            </div>
            
            <div>
              <Label>Current Savings</Label>
              <p className="text-2xl font-bold text-primary mt-1">
                {formatCurrency(currentSavings / 100)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Projection Chart
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                  <Tooltip 
                    formatter={(value, name) => [formatCurrency(Number(value)), name]}
                    labelFormatter={(value) => `Year ${value}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Total Value"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="contributions" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    name="Contributions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Scenario Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(scenarios).map(([key, scenario]) => {
                const value = calculateScenarioValue(scenario.rate);
                const isSelected = scenario.rate === interestRate;
                
                return (
                  <div 
                    key={key}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => setInterestRate(scenario.rate)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{scenario.label}</h4>
                        <p className="text-sm text-muted-foreground">
                          ${monthlyContribution}/month for {timeHorizon} years
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">
                          {formatCurrency(value)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {((value / (currentSavings / 100 + monthlyContribution * 12 * timeHorizon) - 1) * 100).toFixed(1)}% growth
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {finalProjection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Your {timeHorizon}-Year Projection Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-muted-foreground">Final Value</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(finalProjection.value)}
                </p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Contributed</p>
                <p className="text-xl font-semibold text-blue-600">
                  {formatCurrency(finalProjection.contributions)}
                </p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Investment Growth</p>
                <p className="text-xl font-semibold text-green-600">
                  {formatCurrency(finalProjection.growth)}
                </p>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Growth Multiplier</p>
                <p className="text-xl font-semibold text-orange-600">
                  {(finalProjection.value / finalProjection.contributions).toFixed(1)}x
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI What-If Simulator */}
      {!showWhatIf && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Want to optimize your savings plan?</h3>
              <p className="text-muted-foreground mb-4">
                Use our AI What-If Simulator to explore different scenarios and get personalized suggestions
              </p>
              <Button onClick={() => setShowWhatIf(true)} className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Run AI What-If Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showWhatIf && (
        <WhatIfSimulator 
          currentBalance={currentSavings} 
          onClose={() => setShowWhatIf(false)}
        />
      )}
    </div>
  );
};