import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Target, PiggyBank, Calendar, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import BudgetProgress from '@/components/BudgetProgress';

interface DashboardData {
  totalSaved: number;
  weeklyIncome: number;
  weeklyExpenses: number;
  savingsThisWeek: number;
  projectedNetWorth: number;
  savingStreak: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData>({
    totalSaved: 15000, // $150
    weeklyIncome: 87500, // $875 (3500/4 weeks)
    weeklyExpenses: 70000, // $700 (2800/4 weeks)
    savingsThisWeek: 1250, // $12.50
    projectedNetWorth: 133000, // $1330
    savingStreak: 7
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      checkForTemplateUpdates();
    }
  }, [user]);

  useEffect(() => {
    // Listen for template activity events
    const handleTemplateActivity = (event: any) => {
      setShouldRefresh(true);
      toast({
        title: "Dashboard Updated",
        description: `Updated due to ${event.detail.type} activity`,
      });
    };

    window.addEventListener('template-activity', handleTemplateActivity);
    return () => window.removeEventListener('template-activity', handleTemplateActivity);
  }, [toast]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Load real data from database
      const { data: saveEvents } = await supabase
        .from('save_events')
        .select('amount_cents, created_at')
        .eq('user_id', user.id);

      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('consecutive_days')
        .eq('user_id', user.id)
        .single();

      if (saveEvents) {
        const totalSaved = saveEvents.reduce((sum, save) => sum + save.amount_cents, 0);
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const savingsThisWeek = saveEvents
          .filter(save => new Date(save.created_at) >= weekAgo)
          .reduce((sum, save) => sum + save.amount_cents, 0);

        // Calculate 30-year projection at 7% annual return
        const projectedNetWorth = (totalSaved / 100) * Math.pow(1.07, 30);

        setData(prev => ({
          ...prev,
          totalSaved,
          savingsThisWeek,
          projectedNetWorth: Math.round(projectedNetWorth * 100),
          savingStreak: streakData?.consecutive_days || 0
        }));
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const checkForTemplateUpdates = async () => {
    if (!user) return;

    // Mock check for recent template activities
    // In a real implementation, this would check the template_purchases table
    const hasRecentActivity = Math.random() > 0.8; // Simulate occasional updates
    
    if (hasRecentActivity) {
      setShouldRefresh(true);
    }
  };

  const handleRefreshClick = () => {
    loadDashboardData();
    setShouldRefresh(false);
    toast({
      title: "Dashboard Refreshed",
      description: "Your latest data has been loaded",
    });
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const getBalanceColor = () => {
    const balance = data.weeklyIncome - data.weeklyExpenses;
    return balance >= 0 ? 'text-success' : 'text-destructive';
  };

  return (
    <div className="space-y-6">
      {/* Auto-update notification */}
      {shouldRefresh && (
        <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Dashboard Update Available</span>
              </div>
              <button
                onClick={handleRefreshClick}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Refresh Now
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last updated indicator */}
      {lastUpdated && (
        <div className="text-xs text-muted-foreground text-center">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}

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
                <p className="text-sm font-medium text-muted-foreground">Weekly Balance</p>
                <p className={`text-2xl font-bold ${getBalanceColor()}`}>
                  ${formatCurrency(data.weeklyIncome - data.weeklyExpenses)}
                </p>
              </div>
              {data.weeklyIncome - data.weeklyExpenses >= 0 ? 
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
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold text-accent">
                  ${formatCurrency(data.savingsThisWeek)}
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

      {/* Budget Progress */}
      <BudgetProgress />

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Summary</CardTitle>
          <CardDescription>Your financial overview for this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-lg">
              <DollarSign className="h-8 w-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-success">
                ${formatCurrency(data.weeklyIncome)}
              </div>
              <div className="text-sm text-muted-foreground">Weekly Income</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-lg">
              <TrendingDown className="h-8 w-8 text-destructive mx-auto mb-2" />
              <div className="text-2xl font-bold text-destructive">
                ${formatCurrency(data.weeklyExpenses)}
              </div>
              <div className="text-sm text-muted-foreground">Weekly Expenses</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
              <Target className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">
                ${formatCurrency(data.savingsThisWeek)}
              </div>
              <div className="text-sm text-muted-foreground">Saved This Week</div>
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

      {/* Welcome Message */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Welcome to Livin Salti! 🎉</h3>
            <p className="text-muted-foreground mb-4">
              Start your wealth-building journey by making your first save. Every small step counts!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-background/50 rounded-lg">
                <PiggyBank className="h-6 w-6 mx-auto mb-1 text-primary" />
                <div className="font-medium">Save & Stack</div>
                <div className="text-muted-foreground">Log your conscious spending choices</div>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <Target className="h-6 w-6 mx-auto mb-1 text-accent" />
                <div className="font-medium">See Your Future</div>
                <div className="text-muted-foreground">Watch small saves become big wealth</div>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <TrendingUp className="h-6 w-6 mx-auto mb-1 text-success" />
                <div className="font-medium">Build Habits</div>
                <div className="text-muted-foreground">Celebrate every financial win</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}