import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Target, PiggyBank, Calendar, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TouchTarget } from '@/components/ui/mobile-helpers';

interface DashboardData {
  totalSaved: number;
  weeklyIncome: number;
  weeklyExpenses: number;
  savingsThisWeek: number;
  projectedNetWorth: number;
  savingStreak: number;
}

export default function MobileDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData>({
    totalSaved: 15000, // $150
    weeklyIncome: 87500, // $875
    weeklyExpenses: 70000, // $700
    savingsThisWeek: 1250, // $12.50
    projectedNetWorth: 133000, // $1330
    savingStreak: 7
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
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

  const handleRefreshClick = () => {
    loadDashboardData();
    setShouldRefresh(false);
    toast({
      title: "Refreshed",
      description: "Latest data loaded",
    });
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const getWeeklyBalance = () => data.weeklyIncome - data.weeklyExpenses;
  const isPositiveBalance = getWeeklyBalance() >= 0;

  return (
    <div className="space-y-4">
      {/* Compact Header with Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-lg">
            ✌🏽
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Livin Salti
            </h1>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground">
                {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        
        <TouchTarget asChild>
          <button
            onClick={handleRefreshClick}
            className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
          >
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </button>
        </TouchTarget>
      </div>

      {/* Hero Stats - 2x2 Grid for Mobile */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="text-center">
              <PiggyBank className="h-6 w-6 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground font-medium">Total Saved</p>
              <p className="text-lg font-bold text-primary">
                ${formatCurrency(data.totalSaved)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${isPositiveBalance ? 'from-success/10 to-success/5 border-success/20' : 'from-destructive/10 to-destructive/5 border-destructive/20'}`}>
          <CardContent className="p-4">
            <div className="text-center">
              {isPositiveBalance ? 
                <TrendingUp className="h-6 w-6 text-success mx-auto mb-1" /> :
                <TrendingDown className="h-6 w-6 text-destructive mx-auto mb-1" />
              }
              <p className="text-xs text-muted-foreground font-medium">Weekly Balance</p>
              <p className={`text-lg font-bold ${isPositiveBalance ? 'text-success' : 'text-destructive'}`}>
                ${formatCurrency(getWeeklyBalance())}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="p-4">
            <div className="text-center">
              <Calendar className="h-6 w-6 text-accent mx-auto mb-1" />
              <p className="text-xs text-muted-foreground font-medium">This Week</p>
              <p className="text-lg font-bold text-accent">
                ${formatCurrency(data.savingsThisWeek)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="p-4">
            <div className="text-center">
              <Target className="h-6 w-6 text-warning mx-auto mb-1" />
              <p className="text-xs text-muted-foreground font-medium">30Y Goal</p>
              <p className="text-sm font-bold text-warning">
                ${Math.round(data.projectedNetWorth / 100).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Streak Badge */}
      {data.savingStreak > 0 && (
        <div className="text-center">
          <Badge variant="default" className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground">
            🔥 {data.savingStreak} day streak!
          </Badge>
        </div>
      )}

      {/* Weekly Breakdown - Compact */}
      <Card className="bg-gradient-to-r from-muted/30 to-muted/10">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <DollarSign className="h-5 w-5 text-success mx-auto mb-1" />
              <p className="text-sm font-semibold text-success">
                ${formatCurrency(data.weeklyIncome)}
              </p>
              <p className="text-xs text-muted-foreground">Income</p>
            </div>
            
            <div>
              <TrendingDown className="h-5 w-5 text-destructive mx-auto mb-1" />
              <p className="text-sm font-semibold text-destructive">
                ${formatCurrency(data.weeklyExpenses)}
              </p>
              <p className="text-xs text-muted-foreground">Expenses</p>
            </div>
            
            <div>
              <Target className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-sm font-semibold text-primary">
                ${formatCurrency(data.savingsThisWeek)}
              </p>
              <p className="text-xs text-muted-foreground">Saved</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}