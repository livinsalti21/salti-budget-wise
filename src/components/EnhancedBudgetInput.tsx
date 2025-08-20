import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, TrendingUp, Target, Calendar, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const EnhancedBudgetInput = () => {
  const [monthlyIncome, setMonthlyIncome] = useState<string>('');
  const [monthlyGoal, setMonthlyGoal] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadBudgetData();
    }
  }, [user]);

  const loadBudgetData = async () => {
    if (!user) return;

    // Load existing budget for current month
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
    
    const { data } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .single();

    if (data) {
      // Load budget items to get income and goal
      const { data: items } = await supabase
        .from('budget_items')
        .select('*')
        .eq('budget_id', data.id);

      if (items) {
        const income = items.find(item => item.category === 'Income');
        const savingsGoal = items.find(item => item.category === 'Savings Goal');
        
        if (income) setMonthlyIncome((income.planned_cents / 100).toString());
        if (savingsGoal) setMonthlyGoal((savingsGoal.planned_cents / 100).toString());
      }
    }
  };

  const handleSaveBudget = async () => {
    if (!user || !monthlyIncome) {
      toast({
        title: "Missing Information",
        description: "Please enter your monthly income",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      const incomeCents = Math.round(parseFloat(monthlyIncome) * 100);
      const goalCents = monthlyGoal ? Math.round(parseFloat(monthlyGoal) * 100) : 0;

      // Create or update budget
      const { data: budget, error: budgetError } = await supabase
        .from('budgets')
        .upsert({
          user_id: user.id,
          month: currentMonth,
          title: `Budget for ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
        })
        .select()
        .single();

      if (budgetError) throw budgetError;

      // Create or update budget items
      const budgetItems = [
        {
          budget_id: budget.id,
          category: 'Income',
          planned_cents: incomeCents,
          actual_cents: 0
        }
      ];

      if (goalCents > 0) {
        budgetItems.push({
          budget_id: budget.id,
          category: 'Savings Goal',
          planned_cents: goalCents,
          actual_cents: 0
        });
      }

      const { error: itemsError } = await supabase
        .from('budget_items')
        .upsert(budgetItems, { onConflict: 'budget_id,category' });

      if (itemsError) throw itemsError;

      toast({
        title: "Budget Saved",
        description: "Your monthly budget has been updated successfully"
      });

      // Trigger a refresh of parent components by dispatching a custom event
      window.dispatchEvent(new CustomEvent('budget-updated'));

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save budget",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSavingsRate = () => {
    const income = parseFloat(monthlyIncome || '0');
    const goal = parseFloat(monthlyGoal || '0');
    
    if (income > 0 && goal > 0) {
      return ((goal / income) * 100).toFixed(1);
    }
    return 0;
  };

  const getRecommendedSavings = () => {
    const income = parseFloat(monthlyIncome || '0');
    return {
      conservative: (income * 0.10).toFixed(2),
      moderate: (income * 0.20).toFixed(2),
      aggressive: (income * 0.30).toFixed(2)
    };
  };

  const recommendations = getRecommendedSavings();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Monthly Budget Setup</h2>
        <p className="text-muted-foreground">Set your income and savings goals to track your progress</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Monthly Budget
            </CardTitle>
            <CardDescription>
              Enter your monthly financial information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="income">Monthly Income</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="income"
                  type="number"
                  step="0.01"
                  min="0"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  placeholder="Enter any amount"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your total monthly take-home income
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Monthly Savings Goal (Optional)</Label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="goal"
                  type="number"
                  step="0.01"
                  min="0"
                  value={monthlyGoal}
                  onChange={(e) => setMonthlyGoal(e.target.value)}
                  placeholder="Set your savings target"
                  className="pl-10"
                />
              </div>
              {monthlyIncome && monthlyGoal && (
                <p className="text-xs text-success">
                  Savings rate: {calculateSavingsRate()}% of income
                </p>
              )}
            </div>

            <Button onClick={handleSaveBudget} disabled={isLoading} className="w-full">
              {isLoading ? 'Saving...' : 'Save Budget'}
            </Button>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Savings Recommendations
            </CardTitle>
            <CardDescription>
              Based on your income, here are suggested savings amounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {parseFloat(monthlyIncome || '0') > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-300">Conservative</p>
                    <p className="text-sm text-muted-foreground">10% of income</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-700 dark:text-green-300">${recommendations.conservative}</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setMonthlyGoal(recommendations.conservative)}
                      className="text-xs mt-1"
                    >
                      Use This
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div>
                    <p className="font-medium text-blue-700 dark:text-blue-300">Moderate</p>
                    <p className="text-sm text-muted-foreground">20% of income</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-700 dark:text-blue-300">${recommendations.moderate}</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setMonthlyGoal(recommendations.moderate)}
                      className="text-xs mt-1"
                    >
                      Use This
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <div>
                    <p className="font-medium text-purple-700 dark:text-purple-300">Aggressive</p>
                    <p className="text-sm text-muted-foreground">30% of income</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-700 dark:text-purple-300">${recommendations.aggressive}</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setMonthlyGoal(recommendations.aggressive)}
                      className="text-xs mt-1"
                    >
                      Use This
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Enter your income to see personalized recommendations</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedBudgetInput;