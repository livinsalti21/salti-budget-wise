import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, TrendingUp, DollarSign, Calendar, Percent, Repeat } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { toast } from 'sonner';

interface ProjectionData {
  year: number;
  principal: number;
  interest: number;
  total: number;
}

export default function WhatIfCalculator() {
  const [monthlyAmount, setMonthlyAmount] = useState(100);
  const [startingAmount, setStartingAmount] = useState(0);
  const [annualRate, setAnnualRate] = useState(8);
  const [years, setYears] = useState(40);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly'>('monthly');

  const frequencies = {
    daily: { label: 'Daily', multiplier: 365 },
    weekly: { label: 'Weekly', multiplier: 52 },
    biweekly: { label: 'Bi-weekly', multiplier: 26 },
    monthly: { label: 'Monthly', multiplier: 12 },
  };

  const calculateProjection = (): ProjectionData[] => {
    const data: ProjectionData[] = [];
    const periodsPerYear = frequencies[frequency].multiplier;
    const periodAmount = monthlyAmount * (12 / periodsPerYear);
    const ratePerPeriod = annualRate / 100 / periodsPerYear;
    
    let principal = startingAmount;
    let total = startingAmount;

    // Add starting point
    data.push({ year: 0, principal, interest: 0, total });

    for (let year = 1; year <= years; year++) {
      for (let period = 1; period <= periodsPerYear; period++) {
        total = total * (1 + ratePerPeriod) + periodAmount;
        principal += periodAmount;
      }
      
      const interest = total - principal;
      data.push({ year, principal, interest, total });
    }

    return data;
  };

  const projectionData = calculateProjection();
  const finalProjection = projectionData[projectionData.length - 1];
  const totalContributions = finalProjection.principal;
  const totalInterest = finalProjection.interest;
  const finalValue = finalProjection.total;

  const handleShare = async () => {
    const shareText = `💰 What If Calculator Results\n\n` +
      `${frequencies[frequency].label} savings of $${monthlyAmount}\n` +
      `${annualRate}% annual return over ${years} years\n\n` +
      `📊 Final Value: $${finalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n` +
      `💵 Your Contributions: $${totalContributions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n` +
      `📈 Interest Earned: $${totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n` +
      `Try it yourself at Livin Salti!`;

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success('Results copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-3xl font-bold text-primary">
              ${finalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Final Value</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-success" />
            <p className="text-3xl font-bold text-success">
              ${totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Interest Earned</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="p-6 text-center">
            <Repeat className="h-8 w-8 mx-auto mb-2 text-accent" />
            <p className="text-3xl font-bold text-accent">
              {((totalInterest / totalContributions) * 100).toFixed(0)}%
            </p>
            <p className="text-sm text-muted-foreground mt-1">Return on Investment</p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Wealth Growth Projection
              </CardTitle>
              <CardDescription>Watch your wealth compound over time</CardDescription>
            </div>
            <Button onClick={handleShare} variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={projectionData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="year" 
                label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                labelFormatter={(label) => `Year ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="hsl(var(--primary))" 
                fill="url(#colorTotal)" 
                strokeWidth={2}
                name="Total Value"
              />
              <Area 
                type="monotone" 
                dataKey="principal" 
                stroke="hsl(var(--success))" 
                fill="url(#colorPrincipal)" 
                strokeWidth={2}
                name="Contributions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Adjust Your Scenario</CardTitle>
          <CardDescription>Move the sliders to see how different factors impact your wealth</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Saving Frequency */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Saving Frequency
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(Object.keys(frequencies) as Array<keyof typeof frequencies>).map((freq) => (
                <Button
                  key={freq}
                  variant={frequency === freq ? 'default' : 'outline'}
                  onClick={() => setFrequency(freq)}
                  className="w-full"
                >
                  {frequencies[freq].label}
                </Button>
              ))}
            </div>
          </div>

          {/* Amount per Period */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                {frequencies[frequency].label} Saving Amount
              </Label>
              <Badge variant="outline" className="text-lg font-bold">
                ${monthlyAmount}
              </Badge>
            </div>
            <Slider
              value={[monthlyAmount]}
              onValueChange={(value) => setMonthlyAmount(value[0])}
              min={10}
              max={1000}
              step={10}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$10</span>
              <span>$1,000</span>
            </div>
          </div>

          {/* Starting Amount */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-success" />
                Starting Amount
              </Label>
              <Badge variant="outline" className="text-lg font-bold">
                ${startingAmount.toLocaleString()}
              </Badge>
            </div>
            <Slider
              value={[startingAmount]}
              onValueChange={(value) => setStartingAmount(value[0])}
              min={0}
              max={10000}
              step={100}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$0</span>
              <span>$10,000</span>
            </div>
          </div>

          {/* Annual Return Rate */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-accent" />
                Annual Return Rate
              </Label>
              <Badge variant="outline" className="text-lg font-bold">
                {annualRate}%
              </Badge>
            </div>
            <Slider
              value={[annualRate]}
              onValueChange={(value) => setAnnualRate(value[0])}
              min={1}
              max={15}
              step={0.5}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1%</span>
              <span>15%</span>
            </div>
          </div>

          {/* Time Period */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Investment Period
              </Label>
              <Badge variant="outline" className="text-lg font-bold">
                {years} years
              </Badge>
            </div>
            <Slider
              value={[years]}
              onValueChange={(value) => setYears(value[0])}
              min={1}
              max={50}
              step={1}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 year</span>
              <span>50 years</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-6 space-y-3">
          <h3 className="font-semibold text-lg">💡 Key Insights</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              • Your <span className="font-semibold text-foreground">${monthlyAmount}</span> {frequency} savings 
              adds up to <span className="font-semibold text-success">${totalContributions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> in contributions
            </p>
            <p>
              • Compound interest generates an additional <span className="font-semibold text-primary">${totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> over {years} years
            </p>
            <p>
              • Every dollar you save today could be worth <span className="font-semibold text-accent">${(finalValue / totalContributions).toFixed(2)}</span> in {years} years
            </p>
            <p className="pt-2 text-xs">
              📊 These projections assume a consistent {annualRate}% annual return. Actual results may vary.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
