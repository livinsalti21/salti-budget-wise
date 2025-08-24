import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Flame, DollarSign, PieChart, Target, AlertCircle, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import BudgetProgress from "@/components/BudgetProgress";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    currentStreak: 0,
    weeklyTotal: 0,
    totalSaved: 0,
    futureValue: 0
  });

  const [budgetData, setBudgetData] = useState({
    hasBudget: false,
    weeklyIncome: 0,
    totalBudgeted: 0,
    totalSpent: 0,
    remaining: 0
  });

  useEffect(() => {
    if (user) {
      loadStats();
      loadBudgetData();
    }
  }, [user]);

  // Listen for budget updates
  useEffect(() => {
    const handleBudgetUpdate = () => {
      if (user) {
        loadBudgetData();
      }
    };

    window.addEventListener('budget-updated', handleBudgetUpdate);
    return () => window.removeEventListener('budget-updated', handleBudgetUpdate);
  }, [user]);

  const loadStats = async () => {
    try {
      // Get current streak
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('consecutive_days')
        .eq('user_id', user?.id)
        .single();

      // Get total saved (all time)
      const { data: totalSaveData } = await supabase
        .from('save_events')
        .select('amount_cents')
        .eq('user_id', user?.id);

      const totalSaved = totalSaveData?.reduce((sum, save) => sum + save.amount_cents, 0) || 0;

      // Get weekly total (current week saves)
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - (today.getDay() === 0 ? 7 : today.getDay()) + 1);
      startOfWeek.setHours(0, 0, 0, 0);

      const { data: weeklyData } = await supabase
        .from('save_events')
        .select('amount_cents')
        .eq('user_id', user?.id)
        .gte('created_at', startOfWeek.toISOString());

      const weeklyTotal = weeklyData?.reduce((sum, save) => sum + save.amount_cents, 0) || 0;

      // Future value calculation (8% annual return over 30 years, assuming weekly savings continue)
      const weeklyAmount = weeklyTotal || 0;
      const annualRate = 0.08;
      const years = 30;
      const weeksPerYear = 52;
      
      // Future value of annuity formula adjusted for weekly payments
      const futureValue = weeklyAmount * weeksPerYear * ((Math.pow(1 + annualRate, years) - 1) / annualRate);

      setStats({
        currentStreak: streakData?.consecutive_days || 0,
        weeklyTotal: weeklyTotal / 100,
        totalSaved: totalSaved / 100,
        futureValue: futureValue / 100
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadBudgetData = async () => {
    try {
      // Get start of current week (Monday)
      const today = new Date();
      const currentWeekStart = new Date(today);
      currentWeekStart.setDate(today.getDate() - (today.getDay() === 0 ? 7 : today.getDay()) + 1);
      const weekStartDate = currentWeekStart.toISOString().split('T')[0];

      // Check if user has current week's budget
      const { data: budgets } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user?.id)
        .eq('week_start_date', weekStartDate)
        .limit(1);

      if (budgets && budgets.length > 0) {
        const currentBudget = budgets[0];
        
        // Get budget items for current budget
        const { data: budgetItems } = await supabase
          .from('budget_items')
          .select('*')
          .eq('budget_id', currentBudget.id);

        const totalBudgeted = budgetItems?.reduce((sum, item) => sum + item.planned_cents, 0) || 0;
        const totalSpent = budgetItems?.reduce((sum, item) => sum + item.actual_cents, 0) || 0;

        setBudgetData({
          hasBudget: true,
          weeklyIncome: totalBudgeted / 100, // Convert from cents
          totalBudgeted: totalBudgeted / 100,
          totalSpent: totalSpent / 100,
          remaining: (totalBudgeted - totalSpent) / 100
        });
      } else {
        setBudgetData({
          hasBudget: false,
          weeklyIncome: 0,
          totalBudgeted: 0,
          totalSpent: 0,
          remaining: 0
        });
      }
    } catch (error) {
      console.error('Error loading budget data:', error);
    }
  };

  return (
    <div className="pb-20 safe-area-top">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur p-4 border-b">
        <h1 className="text-2xl font-bold text-primary">Livin Salti</h1>
        <p className="text-sm text-muted-foreground">Save n Stack • Live Your Way</p>
      </header>

      <main className="p-4 space-y-6 max-w-md mx-auto">
        {/* Three snapshot cards */}
        <section className="grid gap-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Streak</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {stats.currentStreak} {stats.currentStreak === 1 ? 'day' : 'days'}
              </div>
              <CardDescription>Keep it going! 🔥</CardDescription>
            </CardContent>
          </Card>

          <Card className="border-success/20 bg-success/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-success" />
                <CardTitle className="text-lg">Total Saved</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                ${stats.totalSaved.toLocaleString()}
              </div>
              <CardDescription>All time total</CardDescription>
            </CardContent>
          </Card>

          <Card className="border-accent/20 bg-accent/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                <CardTitle className="text-lg">30Y Projection</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                ${stats.futureValue.toLocaleString()}
              </div>
              <CardDescription>At 8% annual return</CardDescription>
            </CardContent>
          </Card>
        </section>

        {/* Budget Progress */}
        <BudgetProgress />

        {/* Quick Stats for This Week */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">This Week</h2>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span className="font-medium">Weekly Goal Progress</span>
                </div>
                <div className="text-xl font-bold text-primary">
                  ${stats.weeklyTotal.toFixed(2)}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Saved this week
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Budget Section */}
        {budgetData.hasBudget ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Weekly Budget</h2>
              <Link to="/budget">
                <Button variant="ghost" size="sm">View Details</Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-warning/20 bg-warning/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <PieChart className="h-4 w-4 text-warning" />
                    <span className="text-sm font-medium">Spent</span>
                  </div>
                  <div className="text-xl font-bold text-warning">
                    ${budgetData.totalSpent.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card className={`${budgetData.remaining >= 0 ? 'border-success/20 bg-success/5' : 'border-destructive/20 bg-destructive/5'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium">Remaining</span>
                  </div>
                  <div className={`text-xl font-bold ${budgetData.remaining >= 0 ? 'text-success' : 'text-destructive'}`}>
                    ${Math.abs(budgetData.remaining).toLocaleString()}
                  </div>
                  {budgetData.remaining < 0 && (
                    <Badge variant="destructive" className="text-xs mt-1">
                      Over Budget
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        ) : (
            <Card className="border-muted bg-muted/10">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold mb-2">No Weekly Budget Set</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create a weekly budget to track your spending and see insights here
              </p>
              <Link to="/budget">
                <Button variant="outline" size="sm">Create Weekly Budget</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Quick actions */}
        <section className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Link to="/save">
              <Button className="w-full h-12" size="lg">
                Quick Save
              </Button>
            </Link>
            <Link to="/rewards">
              <Button variant="outline" className="w-full h-12" size="lg">
                <Gift className="h-4 w-4 mr-1" />
                Rewards
              </Button>
            </Link>
          </div>
        </section>

        {/* Daily tip widget (placeholder for Phase 2) */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              💡 Skip coffee today? That's +$800 in 10 years
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}