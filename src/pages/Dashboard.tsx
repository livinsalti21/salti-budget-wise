import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Flame, DollarSign, PieChart, Target, AlertCircle, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    currentStreak: 0,
    monthlyTotal: 0,
    futureValue: 0
  });

  const [budgetData, setBudgetData] = useState({
    hasBudget: false,
    monthlyIncome: 0,
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

      // Get monthly total (current month saves)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: saveData } = await supabase
        .from('save_events')
        .select('amount_cents')
        .eq('user_id', user?.id)
        .gte('created_at', startOfMonth.toISOString());

      const monthlyTotal = saveData?.reduce((sum, save) => sum + save.amount_cents, 0) || 0;

      // Simple future value calculation (8% annual return over 30 years)
      const monthlyAmount = monthlyTotal;
      const annualRate = 0.08;
      const years = 30;
      const futureValue = monthlyAmount * ((Math.pow(1 + annualRate, years) - 1) / annualRate) * 12;

      setStats({
        currentStreak: streakData?.consecutive_days || 0,
        monthlyTotal: monthlyTotal / 100,
        futureValue: futureValue / 100
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadBudgetData = async () => {
    try {
      // Check if user has any budget data
      const { data: budgets } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
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
          monthlyIncome: totalBudgeted / 100, // Convert from cents
          totalBudgeted: totalBudgeted / 100,
          totalSpent: totalSpent / 100,
          remaining: (totalBudgeted - totalSpent) / 100
        });
      } else {
        setBudgetData({
          hasBudget: false,
          monthlyIncome: 0,
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
                <CardTitle className="text-lg">Monthly Savings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                ${stats.monthlyTotal.toFixed(2)}
              </div>
              <CardDescription>This month's total</CardDescription>
            </CardContent>
          </Card>

          <Card className="border-accent/20 bg-accent/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                <CardTitle className="text-lg">Future Net Worth</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                ${stats.futureValue.toLocaleString()}
              </div>
              <CardDescription>30-year projection (8% return)</CardDescription>
            </CardContent>
          </Card>
        </section>

        {/* Budget Section */}
        {budgetData.hasBudget ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Monthly Budget</h2>
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
              <h3 className="font-semibold mb-2">No Budget Set</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create a budget to track your spending and see insights here
              </p>
              <Link to="/budget">
                <Button variant="outline" size="sm">Create Budget</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Quick actions */}
        <section className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Link to="/save">
              <Button className="w-full h-12" size="lg">
                Quick Save
              </Button>
            </Link>
            <Link to="/budget">
              <Button variant="outline" className="w-full h-12" size="lg">
                Budget
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