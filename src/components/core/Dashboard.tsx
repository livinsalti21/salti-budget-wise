import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Target, PiggyBank, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardData {
  totalSaved: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsThisMonth: number;
  projectedNetWorth: number;
  savingStreak: number;
}

interface ChartData {
  month: string;
  saved: number;
  projected: number;
}

interface SpendingData {
  category: string;
  amount: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    totalSaved: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savingsThisMonth: 0,
    projectedNetWorth: 0,
    savingStreak: 0
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [spendingData, setSpendingData] = useState<SpendingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load total saved from save_events
      const { data: saveEvents, error: saveError } = await supabase
        .from('save_events')
        .select('amount_cents, created_at')
        .eq('user_id', user.id);

      if (saveError) throw saveError;

      const totalSaved = saveEvents?.reduce((sum, event) => sum + event.amount_cents, 0) || 0;

      // Load current month's budget
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      const { data: budget, error: budgetError } = await supabase
        .from('budgets')
        .select(`
          *,
          budget_items(*)
        `)
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .single();

      let monthlyIncome = 0;
      let monthlyExpenses = 0;

      if (budget?.budget_items) {
        monthlyIncome = budget.budget_items
          .filter((item: any) => item.category === 'Income')
          .reduce((sum: number, item: any) => sum + item.planned_cents, 0);
        
        monthlyExpenses = budget.budget_items
          .filter((item: any) => item.category !== 'Income')
          .reduce((sum: number, item: any) => sum + item.planned_cents, 0);
      }

      // Calculate savings this month
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const savingsThisMonth = saveEvents?.filter(event => 
        new Date(event.created_at) >= monthStart
      ).reduce((sum, event) => sum + event.amount_cents, 0) || 0;

      // Calculate projected net worth (30 years at 8%)
      const projectedNetWorth = (totalSaved / 100) * Math.pow(1.08, 30);

      // Load user streak
      const { data: streak } = await supabase
        .from('user_streaks')
        .select('consecutive_days')
        .eq('user_id', user.id)
        .single();

      // Generate chart data for last 6 months
      const chartData = generateChartData(saveEvents || []);
      const spendingData = generateSpendingData(budget?.budget_items || []);

      setData({
        totalSaved,
        monthlyIncome,
        monthlyExpenses,
        savingsThisMonth,
        projectedNetWorth,
        savingStreak: streak?.consecutive_days || 0
      });

      setChartData(chartData);
      setSpendingData(spendingData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (saveEvents: any[]): ChartData[] => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      const monthSavings = saveEvents
        .filter(event => event.created_at.startsWith(monthKey))
        .reduce((sum, event) => sum + event.amount_cents, 0) / 100;

      const projected = monthSavings * Math.pow(1.08, 30);

      months.push({
        month: monthName,
        saved: monthSavings,
        projected: projected
      });
    }
    
    return months;
  };

  const generateSpendingData = (budgetItems: any[]): SpendingData[] => {
    const categoryTotals = budgetItems
      .filter(item => item.category !== 'Income')
      .reduce((acc: Record<string, number>, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.planned_cents / 100;
        return acc;
      }, {});

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount
    }));
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const getBalanceColor = () => {
    const balance = data.monthlyIncome - data.monthlyExpenses;
    return balance >= 0 ? 'text-success' : 'text-destructive';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-secondary rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Saved</p>
                <p className="text-2xl font-bold text-primary">
                  ${formatCurrency(data.totalSaved)}
                </p>
              </div>
              <PiggyBank className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Balance</p>
                <p className={`text-2xl font-bold ${getBalanceColor()}`}>
                  ${formatCurrency(data.monthlyIncome - data.monthlyExpenses)}
                </p>
              </div>
              {data.monthlyIncome - data.monthlyExpenses >= 0 ? 
                <TrendingUp className="h-8 w-8 text-success" /> :
                <TrendingDown className="h-8 w-8 text-destructive" />
              }
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-accent">
                  ${formatCurrency(data.savingsThisMonth)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">30Y Projection</p>
                <p className="text-2xl font-bold text-warning">
                  ${Math.round(data.projectedNetWorth).toLocaleString()}
                </p>
              </div>
              <Target className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Savings Projection Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Savings Growth</CardTitle>
            <CardDescription>Your savings journey over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `$${value.toFixed(2)}`,
                    name === 'saved' ? 'Saved' : '30Y Projection'
                  ]}
                />
                <Line type="monotone" dataKey="saved" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="projected" stroke="hsl(var(--success))" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Spending Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Spending Breakdown</CardTitle>
            <CardDescription>Your monthly budget by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={spendingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
                <Bar dataKey="amount" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
          <CardDescription>Your financial overview for this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-lg">
              <DollarSign className="h-8 w-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-success">
                ${formatCurrency(data.monthlyIncome)}
              </div>
              <div className="text-sm text-muted-foreground">Monthly Income</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-lg">
              <TrendingDown className="h-8 w-8 text-destructive mx-auto mb-2" />
              <div className="text-2xl font-bold text-destructive">
                ${formatCurrency(data.monthlyExpenses)}
              </div>
              <div className="text-sm text-muted-foreground">Monthly Expenses</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
              <Target className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">
                ${formatCurrency(data.savingsThisMonth)}
              </div>
              <div className="text-sm text-muted-foreground">Saved This Month</div>
            </div>
          </div>
          
          {data.savingStreak > 0 && (
            <div className="mt-6 text-center">
              <Badge variant="default" className="text-lg px-4 py-2">
                🔥 {data.savingStreak} day saving streak!
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}