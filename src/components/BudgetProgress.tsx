import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  Target,
  DollarSign,
  PieChart,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentWeekStart, getCurrentWeekEnd, formatCurrency } from '@/lib/budgetUtils';

interface BudgetProgressData {
  weeklyIncome: number;
  totalBudgeted: number;
  actualSpent: number;
  remainingBudget: number;
  daysIntoWeek: number;
  daysLeftInWeek: number;
  expectedSpendByNow: number;
  status: 'on-track' | 'behind' | 'over-budget' | 'no-budget';
  weeklyGoal: number;
  currentSavings: number;
}

export default function BudgetProgress() {
  const { user } = useAuth();
  const [budgetData, setBudgetData] = useState<BudgetProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBudgetProgress();
    }
  }, [user]);

  // Listen for budget updates
  useEffect(() => {
    const handleBudgetUpdate = () => {
      if (user) {
        loadBudgetProgress();
      }
    };

    window.addEventListener('budget-updated', handleBudgetUpdate);
    return () => window.removeEventListener('budget-updated', handleBudgetUpdate);
  }, [user]);

  const loadBudgetProgress = async () => {
    try {
      setIsLoading(true);
      const weekStart = getCurrentWeekStart();
      
      // Get current week's budget
      const { data: budgets } = await supabase
        .from('budgets')
        .select('id')
        .eq('user_id', user?.id)
        .eq('week_start_date', weekStart)
        .limit(1);

      if (!budgets || budgets.length === 0) {
        setBudgetData({
          weeklyIncome: 0,
          totalBudgeted: 0,
          actualSpent: 0,
          remainingBudget: 0,
          daysIntoWeek: 0,
          daysLeftInWeek: 7,
          expectedSpendByNow: 0,
          status: 'no-budget',
          weeklyGoal: 0,
          currentSavings: 0
        });
        return;
      }

      const currentBudget = budgets[0];

      // Get budget items
      const { data: budgetItems } = await supabase
        .from('budget_items')
        .select('*')
        .eq('budget_id', currentBudget.id);

      // Get current week's saves
      const { data: saveEvents } = await supabase
        .from('save_events')
        .select('amount_cents')
        .eq('user_id', user?.id)
        .gte('created_at', weekStart + 'T00:00:00.000Z')
        .lte('created_at', getCurrentWeekEnd() + 'T23:59:59.999Z');

      // Calculate metrics
      const totalBudgeted = budgetItems?.reduce((sum, item) => sum + item.planned_cents, 0) || 0;
      const actualSpent = budgetItems?.reduce((sum, item) => sum + item.actual_cents, 0) || 0;
      const currentSavings = saveEvents?.reduce((sum, save) => sum + save.amount_cents, 0) || 0;

      // Calculate time-based metrics
      const today = new Date();
      const weekStartDate = new Date(weekStart);
      const msIntoWeek = today.getTime() - weekStartDate.getTime();
      const daysIntoWeek = Math.floor(msIntoWeek / (1000 * 60 * 60 * 24));
      const daysLeftInWeek = Math.max(0, 7 - daysIntoWeek);
      
      // Expected spending by now (linear distribution)
      const weekProgress = daysIntoWeek / 7;
      const expectedSpendByNow = totalBudgeted * weekProgress;

      // Determine status
      let status: BudgetProgressData['status'] = 'on-track';
      if (actualSpent > totalBudgeted) {
        status = 'over-budget';
      } else if (actualSpent > expectedSpendByNow * 1.2) {
        status = 'behind';
      }

      setBudgetData({
        weeklyIncome: totalBudgeted / 100,
        totalBudgeted: totalBudgeted / 100,
        actualSpent: actualSpent / 100,
        remainingBudget: (totalBudgeted - actualSpent) / 100,
        daysIntoWeek,
        daysLeftInWeek,
        expectedSpendByNow: expectedSpendByNow / 100,
        status,
        weeklyGoal: totalBudgeted * 0.2 / 100, // Assume 20% savings goal
        currentSavings: currentSavings / 100
      });

    } catch (error) {
      console.error('Error loading budget progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4">
          <div className="h-16 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!budgetData || budgetData.status === 'no-budget') {
    return (
      <Card className="border-muted bg-muted/10">
        <CardContent className="p-4 text-center">
          <AlertTriangle className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium mb-1">No Weekly Budget</p>
          <p className="text-xs text-muted-foreground mb-3">
            Create a budget to track your progress
          </p>
          <Link to="/budget">
            <Button size="sm" variant="outline">
              Create Budget
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = () => {
    switch (budgetData.status) {
      case 'on-track': return 'success';
      case 'behind': return 'warning';
      case 'over-budget': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = () => {
    switch (budgetData.status) {
      case 'on-track': return <CheckCircle className="h-4 w-4" />;
      case 'behind': return <TrendingUp className="h-4 w-4" />;
      case 'over-budget': return <AlertTriangle className="h-4 w-4" />;
      default: return <PieChart className="h-4 w-4" />;
    }
  };

  const getStatusMessage = () => {
    switch (budgetData.status) {
      case 'on-track': return "You're on track! Keep it up.";
      case 'behind': return `Spending faster than planned. ${budgetData.daysLeftInWeek} days left.`;
      case 'over-budget': return `Over budget by $${Math.abs(budgetData.remainingBudget).toFixed(2)}`;
      default: return 'Budget status unknown';
    }
  };

  const spendingProgress = Math.min(100, (budgetData.actualSpent / budgetData.totalBudgeted) * 100);
  const timeProgress = (budgetData.daysIntoWeek / 7) * 100;

  return (
    <Card className={`border-${getStatusColor()}/20 bg-${getStatusColor()}/5`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Budget Progress
          </CardTitle>
          <Badge variant={getStatusColor() as any} className="text-xs">
            {getStatusIcon()}
            {budgetData.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Spent: ${budgetData.actualSpent.toFixed(2)}</span>
            <span>Budget: ${budgetData.totalBudgeted.toFixed(2)}</span>
          </div>
          <Progress value={spendingProgress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{spendingProgress.toFixed(0)}% spent</span>
            <span>Day {budgetData.daysIntoWeek}/7</span>
          </div>
        </div>

        {/* Status Message */}
        <div className="flex items-start gap-2">
          {budgetData.status === 'on-track' ? (
            <Zap className="h-4 w-4 text-success mt-0.5" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium">{getStatusMessage()}</p>
            {budgetData.remainingBudget > 0 && (
              <p className="text-xs text-muted-foreground">
                ${budgetData.remainingBudget.toFixed(2)} remaining for {budgetData.daysLeftInWeek} days
              </p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              ${budgetData.currentSavings.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">Week Savings</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-muted-foreground">
              ${(budgetData.remainingBudget / Math.max(1, budgetData.daysLeftInWeek)).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">Daily Budget</div>
          </div>
        </div>

        {/* Action Button */}
        <Link to="/budget" className="block">
          <Button variant="outline" size="sm" className="w-full">
            View Full Budget
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}