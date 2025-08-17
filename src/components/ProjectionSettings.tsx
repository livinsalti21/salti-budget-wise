import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Settings, TrendingUp, Calculator, Target, DollarSign, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProjectionSettings {
  expectedReturn: number;
  monthlyContribution: number;
  timeHorizon: number;
}

interface ProjectionData {
  year: number;
  value: number;
  contributions: number;
  growth: number;
}

interface ProjectionSettingsProps {
  currentSavings: number;
  onSettingsChange?: (settings: ProjectionSettings & { projectionData: ProjectionData[] }) => void;
}

export const ProjectionSettings: React.FC<ProjectionSettingsProps> = ({ 
  currentSavings, 
  onSettingsChange 
}) => {
  const [settings, setSettings] = useState<ProjectionSettings>({
    expectedReturn: 8,
    monthlyContribution: 200,
    timeHorizon: 20
  });
  const [projectionData, setProjectionData] = useState<ProjectionData[]>([]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('projectionSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading projection settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage and calculate projections when settings change
  useEffect(() => {
    localStorage.setItem('projectionSettings', JSON.stringify(settings));
    calculateProjections();
  }, [settings, currentSavings]);

  const calculateProjections = () => {
    const data: ProjectionData[] = [];
    let balance = currentSavings;
    const monthlyRate = settings.expectedReturn / 100 / 12;
    const monthlyContribCents = settings.monthlyContribution * 100;

    for (let year = 0; year <= settings.timeHorizon; year++) {
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
    
    if (onSettingsChange) {
      onSettingsChange({ ...settings, projectionData: data });
    }
  };

  const updateSetting = <K extends keyof ProjectionSettings>(
    key: K, 
    value: ProjectionSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const getInvestmentRecommendation = (rate: number) => {
    if (rate <= 4) return { type: 'High-Yield Savings', risk: 'Very Low', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
    if (rate <= 6) return { type: 'CDs & Bonds', risk: 'Low', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' };
    if (rate <= 8) return { type: 'Index Funds', risk: 'Moderate', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' };
    if (rate <= 10) return { type: 'Stock Market', risk: 'Moderate-High', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' };
    return { type: 'Growth Stocks', risk: 'High', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const presetScenarios = [
    { label: 'Conservative', rate: 5, color: 'bg-blue-500' },
    { label: 'Moderate', rate: 8, color: 'bg-green-500' },
    { label: 'Aggressive', rate: 12, color: 'bg-red-500' }
  ];

  const recommendation = getInvestmentRecommendation(settings.expectedReturn);
  const finalProjection = projectionData[projectionData.length - 1];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Your Wealth Projection Settings
          </CardTitle>
          <CardDescription>
            Customize your expected investment returns and see how your savings could grow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="monthly">Monthly Contribution ($)</Label>
              <Input
                id="monthly"
                type="number"
                value={settings.monthlyContribution}
                onChange={(e) => updateSetting('monthlyContribution', Number(e.target.value))}
                min="0"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="time">Time Horizon (Years)</Label>
              <Input
                id="time"
                type="number"
                value={settings.timeHorizon}
                onChange={(e) => updateSetting('timeHorizon', Number(e.target.value))}
                min="1"
                max="50"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="rate">Expected Annual Return: {settings.expectedReturn}%</Label>
              <Slider
                id="rate"
                min={1}
                max={15}
                step={0.5}
                value={[settings.expectedReturn]}
                onValueChange={(value) => updateSetting('expectedReturn', value[0])}
                className="mt-3"
              />
            </div>
          </div>

          {/* Preset Scenarios */}
          <div>
            <Label className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4" />
              Quick Scenarios
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {presetScenarios.map((scenario) => (
                <Button
                  key={scenario.label}
                  variant={settings.expectedReturn === scenario.rate ? "default" : "outline"}
                  onClick={() => updateSetting('expectedReturn', scenario.rate)}
                  className="justify-start"
                >
                  <div className={`w-3 h-3 rounded-full mr-2 ${scenario.color}`} />
                  {scenario.label} ({scenario.rate}%)
                </Button>
              ))}
            </div>
          </div>

          {/* Investment Recommendation */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Recommended Investment Type</span>
              </div>
              <Badge className={recommendation.color}>
                {recommendation.type} - {recommendation.risk} Risk
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Current Savings</div>
              <div className="text-lg font-bold text-primary">
                {formatCurrency(currentSavings / 100)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projection Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Your Wealth Growth Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
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
                  strokeWidth={3}
                  name="Total Value"
                />
                <Line 
                  type="monotone" 
                  dataKey="contributions" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Your Contributions"
                />
                <Line 
                  type="monotone" 
                  dataKey="growth" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={2}
                  name="Investment Growth"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {finalProjection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Your {settings.timeHorizon}-Year Wealth Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Final Value</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(finalProjection.value)}
                </p>
              </div>
              
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <p className="text-sm text-muted-foreground">You Contribute</p>
                <p className="text-xl font-semibold text-accent">
                  {formatCurrency(finalProjection.contributions)}
                </p>
              </div>
              
              <div className="text-center p-4 bg-success/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Market Growth</p>
                <p className="text-xl font-semibold text-success">
                  {formatCurrency(finalProjection.growth)}
                </p>
              </div>
              
              <div className="text-center p-4 bg-warning/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Wealth Multiplier</p>
                <p className="text-xl font-semibold text-warning">
                  {(finalProjection.value / finalProjection.contributions).toFixed(1)}x
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};