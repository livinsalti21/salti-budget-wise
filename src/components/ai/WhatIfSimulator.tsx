import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, Zap, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WhatIfSimulatorProps {
  currentBalance?: number;
  onClose?: () => void;
}

export default function WhatIfSimulator({ currentBalance = 0, onClose }: WhatIfSimulatorProps) {
  const [categorySpend, setCategorySpend] = useState(400);
  const [cutPercentage, setCutPercentage] = useState(15);
  const [timeHorizon, setTimeHorizon] = useState(12);
  const [targetAmount, setTargetAmount] = useState(1000);
  const [annualRate, setAnnualRate] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestion, setAISuggestion] = useState<string>('');

  const { user } = useAuth();
  const { toast } = useToast();

  const calculateProjection = () => {
    const monthlySavings = (categorySpend * cutPercentage) / 100;
    const monthlyRate = annualRate / 100 / 12;
    let balance = currentBalance / 100;
    let months = 0;

    while (balance < targetAmount && months < 600) {
      balance = balance * (1 + monthlyRate) + monthlySavings;
      months++;
    }

    return {
      monthlySavings,
      monthsToGoal: months,
      finalValue: balance,
      dateToReach: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000)
    };
  };

  const getAISuggestion = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-support', {
        body: {
          message: `Give me a specific actionable suggestion for cutting ${cutPercentage}% from a $${categorySpend}/month category. Be brief and practical.`,
          sessionId: null
        }
      });

      if (error) throw error;
      
      // Simple extraction of response content
      if (data && typeof data === 'string') {
        setAISuggestion(data);
      }
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      toast({
        title: "Couldn't get AI suggestion",
        description: "Try adjusting the numbers manually",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (categorySpend && cutPercentage) {
      const timer = setTimeout(() => {
        getAISuggestion();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [categorySpend, cutPercentage]);

  const projection = calculateProjection();

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            AI What-If Simulator
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
        <CardDescription>
          See how cutting expenses impacts your savings goals with AI-powered suggestions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Monthly Category Spend ($)</Label>
            <Input
              id="category"
              type="number"
              value={categorySpend}
              onChange={(e) => setCategorySpend(Number(e.target.value))}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              e.g., Eating out, subscriptions, shopping
            </p>
          </div>

          <div>
            <Label htmlFor="cut">Cut by (%)</Label>
            <Input
              id="cut"
              type="number"
              value={cutPercentage}
              onChange={(e) => setCutPercentage(Number(e.target.value))}
              min="1"
              max="100"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="target">Target Amount ($)</Label>
            <Input
              id="target"
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="rate">Expected Return (%)</Label>
            <Input
              id="rate"
              type="number"
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value))}
              min="0"
              max="20"
              step="0.5"
              className="mt-1"
            />
          </div>
        </div>

        {/* AI Suggestion */}
        {aiSuggestion && (
          <Card className="bg-muted/30 border-muted">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <MessageCircle className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">AI Suggestion</p>
                  <p className="text-sm text-muted-foreground mt-1">{aiSuggestion}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-primary">
              ${projection.monthlySavings.toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground">Monthly Savings</p>
          </div>

          <div className="text-center p-4 bg-accent/10 rounded-lg">
            <Zap className="h-6 w-6 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-accent">
              {projection.monthsToGoal}
            </p>
            <p className="text-xs text-muted-foreground">Months to Goal</p>
          </div>

          <div className="text-center p-4 bg-success/10 rounded-lg">
            <Badge variant="secondary" className="mb-2">
              {projection.dateToReach.toLocaleDateString()}
            </Badge>
            <p className="text-sm font-medium">Target Date</p>
          </div>
        </div>

        {/* Quick Analysis */}
        <div className="bg-muted/20 p-4 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Quick Analysis</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>• Cutting ${categorySpend} × {cutPercentage}% = ${projection.monthlySavings.toFixed(0)}/month saved</p>
            <p>• With {annualRate}% returns, you'll reach ${targetAmount} in {projection.monthsToGoal} months</p>
            <p>• That's {(projection.monthsToGoal / 12).toFixed(1)} years of consistent saving</p>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={getAISuggestion} 
          disabled={isLoading} 
          className="w-full"
          variant="outline"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          {isLoading ? 'Getting AI Suggestion...' : 'Get New AI Suggestion'}
        </Button>
      </CardContent>
    </Card>
  );
}