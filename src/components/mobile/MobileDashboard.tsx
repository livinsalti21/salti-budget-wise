import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, TrendingDown, DollarSign, Target, PiggyBank, Calendar, RefreshCw, Flame, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TouchTarget } from '@/components/ui/mobile-helpers';
import { quickProjection } from '@/simulation/futureValue';

interface DashboardData {
  totalSaved: number;
  weeklyIncome: number;
  weeklyExpenses: number;
  savingsThisWeek: number;
  projectedNetWorth: number;
  savingStreak: number;
  projectedNetWorth35Years: number;
}

interface FriendStreak {
  user_id: string;
  display_name: string;
  consecutive_days: number;
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
    savingStreak: 7,
    projectedNetWorth35Years: 0
  });
  const [topFriends, setTopFriends] = useState<FriendStreak[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      loadTopFriends();
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
        const projectedNetWorth35Years = quickProjection(totalSaved / 100, 35, 0.08);

        setData(prev => ({
          ...prev,
          totalSaved,
          savingsThisWeek,
          projectedNetWorth: Math.round(projectedNetWorth * 100),
          projectedNetWorth35Years: Math.round(projectedNetWorth35Years * 100),
          savingStreak: streakData?.consecutive_days || 0
        }));
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadTopFriends = async () => {
    if (!user) return;

    try {
      // Get top 3 friend streaks - mock data for now
      // In a real app, this would query a friends table joined with user_streaks
      const { data: streaks } = await supabase
        .from('user_streaks')
        .select(`
          user_id,
          consecutive_days,
          profiles!user_streaks_user_id_fkey (display_name)
        `)
        .neq('user_id', user.id)
        .gt('consecutive_days', 0)
        .order('consecutive_days', { ascending: false })
        .limit(3);

      if (streaks) {
        const friendStreaks = streaks.map(streak => ({
          user_id: streak.user_id,
          display_name: (streak.profiles as any)?.display_name || 'Friend',
          consecutive_days: streak.consecutive_days
        }));
        setTopFriends(friendStreaks);
      }
    } catch (error) {
      console.error('Error loading friend streaks:', error);
    }
  };

  const handleRefreshClick = () => {
    loadDashboardData();
    loadTopFriends();
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
    <div className="space-y-3">
      {/* 35-Year Projection Header */}
      <Card className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border-primary/30">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Crown className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold text-primary">Your Future Wealth</h2>
          </div>
          <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ${Math.round(data.projectedNetWorth35Years / 100).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Your savings in 35 years at 8% growth
          </p>
        </CardContent>
      </Card>

      {/* Compact Header with Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-sm">
            ✌🏽
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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

      {/* Enhanced Streak Display */}
      {data.savingStreak > 0 && (
        <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="h-8 w-8 text-orange-500 animate-pulse" />
              <div>
                <p className="text-3xl font-bold text-orange-500">{data.savingStreak}</p>
                <p className="text-sm font-semibold text-orange-600">Day Streak!</p>
              </div>
              <Flame className="h-8 w-8 text-orange-500 animate-pulse" />
            </div>
            <p className="text-xs text-orange-700">Keep the momentum going! 🚀</p>
          </CardContent>
        </Card>
      )}

      {/* Hero Stats - 2x2 Grid for Mobile */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-3">
            <div className="text-center">
              <PiggyBank className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground font-medium">Total Saved</p>
              <p className="text-lg font-bold text-primary">
                ${formatCurrency(data.totalSaved)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${isPositiveBalance ? 'from-success/10 to-success/5 border-success/20' : 'from-destructive/10 to-destructive/5 border-destructive/20'}`}>
          <CardContent className="p-3">
            <div className="text-center">
              {isPositiveBalance ? 
                <TrendingUp className="h-5 w-5 text-success mx-auto mb-1" /> :
                <TrendingDown className="h-5 w-5 text-destructive mx-auto mb-1" />
              }
              <p className="text-xs text-muted-foreground font-medium">Weekly Balance</p>
              <p className={`text-lg font-bold ${isPositiveBalance ? 'text-success' : 'text-destructive'}`}>
                ${formatCurrency(getWeeklyBalance())}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="p-3">
            <div className="text-center">
              <Calendar className="h-5 w-5 text-accent mx-auto mb-1" />
              <p className="text-xs text-muted-foreground font-medium">This Week</p>
              <p className="text-lg font-bold text-accent">
                ${formatCurrency(data.savingsThisWeek)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="p-3">
            <div className="text-center">
              <Target className="h-5 w-5 text-warning mx-auto mb-1" />
              <p className="text-xs text-muted-foreground font-medium">30Y Goal</p>
              <p className="text-sm font-bold text-warning">
                ${Math.round(data.projectedNetWorth / 100).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top 3 Friends Streaks */}
      {topFriends.length > 0 && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300">Top Friend Streaks</h3>
              <TouchTarget asChild>
                <button className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  View All →
                </button>
              </TouchTarget>
            </div>
            <div className="space-y-2">
              {topFriends.map((friend, index) => (
                <div key={friend.user_id} className="flex items-center gap-2">
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400">#{index + 1}</div>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs">
                      {friend.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{friend.display_name}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                    <span className="text-xs font-bold text-orange-600">{friend.consecutive_days}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Breakdown - Compact */}
      <Card className="bg-gradient-to-r from-muted/30 to-muted/10">
        <CardContent className="p-3">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <DollarSign className="h-4 w-4 text-success mx-auto mb-1" />
              <p className="text-sm font-semibold text-success">
                ${formatCurrency(data.weeklyIncome)}
              </p>
              <p className="text-xs text-muted-foreground">Income</p>
            </div>
            
            <div>
              <TrendingDown className="h-4 w-4 text-destructive mx-auto mb-1" />
              <p className="text-sm font-semibold text-destructive">
                ${formatCurrency(data.weeklyExpenses)}
              </p>
              <p className="text-xs text-muted-foreground">Expenses</p>
            </div>
            
            <div>
              <Target className="h-4 w-4 text-primary mx-auto mb-1" />
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