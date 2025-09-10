import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, TrendingDown, DollarSign, Target, PiggyBank, Calendar, RefreshCw, Flame, Crown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TouchTarget } from '@/components/ui/mobile-helpers';
import { quickProjection } from '@/simulation/futureValue';
import BudgetProgress from '@/components/BudgetProgress';
import MobileMatchSection from './MobileMatchSection';
import { Link } from 'react-router-dom';
import { track, EVENTS } from '@/analytics/analytics';

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
      <Link to="/net-worth">
        <Card className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border-primary/30 hover:shadow-md transition-all duration-200 active:scale-[0.98]">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Crown className="h-5 w-5 text-primary" />
              <h2 className="text-sm font-semibold text-primary">Your Future Wealth</h2>
              <ChevronRight className="h-4 w-4 text-primary/60" />
            </div>
            <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ${Math.round(data.projectedNetWorth35Years / 100).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Your savings in 35 years at 8% growth
            </p>
          </CardContent>
        </Card>
      </Link>

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
        <Link to="/streaks">
          <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30 hover:shadow-md transition-all duration-200 active:scale-[0.98]">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Flame className="h-8 w-8 text-orange-500 animate-pulse" />
                <div>
                  <p className="text-3xl font-bold text-orange-500">{data.savingStreak}</p>
                  <p className="text-sm font-semibold text-orange-600">Day Streak!</p>
                </div>
                <Flame className="h-8 w-8 text-orange-500 animate-pulse" />
                <ChevronRight className="h-4 w-4 text-orange-500/60" />
              </div>
              <p className="text-xs text-orange-700">Keep the momentum going! 🚀</p>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Hero Stats - 2x2 Grid for Mobile */}
      <div className="grid grid-cols-2 gap-2">
        <Link to="/save-history">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-md transition-all duration-200 active:scale-[0.98]">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <PiggyBank className="h-5 w-5 text-primary" />
                  <ChevronRight className="h-3 w-3 text-primary/60" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">Total Saved</p>
                <p className="text-lg font-bold text-primary">
                  ${formatCurrency(data.totalSaved)}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/budget">
          <Card className={`bg-gradient-to-br ${isPositiveBalance ? 'from-success/10 to-success/5 border-success/20' : 'from-destructive/10 to-destructive/5 border-destructive/20'} hover:shadow-md transition-all duration-200 active:scale-[0.98]`}>
            <CardContent className="p-3">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {isPositiveBalance ? 
                    <TrendingUp className="h-5 w-5 text-success" /> :
                    <TrendingDown className="h-5 w-5 text-destructive" />
                  }
                  <ChevronRight className={`h-3 w-3 ${isPositiveBalance ? 'text-success/60' : 'text-destructive/60'}`} />
                </div>
                <p className="text-xs text-muted-foreground font-medium">Weekly Balance</p>
                <p className={`text-lg font-bold ${isPositiveBalance ? 'text-success' : 'text-destructive'}`}>
                  ${formatCurrency(getWeeklyBalance())}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/goals">
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 hover:shadow-md transition-all duration-200 active:scale-[0.98]">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Calendar className="h-5 w-5 text-accent" />
                  <ChevronRight className="h-3 w-3 text-accent/60" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">This Week</p>
                <p className="text-lg font-bold text-accent">
                  ${formatCurrency(data.savingsThisWeek)}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/net-worth">
          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20 hover:shadow-md transition-all duration-200 active:scale-[0.98]">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="h-5 w-5 text-warning" />
                  <ChevronRight className="h-3 w-3 text-warning/60" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">30Y Goal</p>
                <p className="text-sm font-bold text-warning">
                  ${Math.round(data.projectedNetWorth / 100).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Save Section */}
      <div className="mb-4">
        <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-green-600" />
                <h3 className="text-base font-bold text-green-700 dark:text-green-300">Quick Save</h3>
              </div>
              <Link 
                to="/app/save/choose" 
                className="text-sm text-green-600 dark:text-green-400 font-medium hover:text-green-700 dark:hover:text-green-300 transition-colors"
                onClick={() => track(EVENTS.save_started, { source: 'quick_save_custom' })}
              >
                Custom →
              </Link>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {[500, 1000, 2000].map((cents) => (
                <Link
                  key={cents}
                  to={`/app/save/confirm?amount_cents=${cents}&source=quick_save`}
                  onClick={() => track(EVENTS.save_started, { source: 'quick_save', amount: cents })}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100/80 dark:hover:bg-green-900/40 text-green-700 dark:text-green-300 font-semibold transition-all active:scale-95"
                  >
                    ${(cents / 100).toFixed(0)}
                  </Button>
                </Link>
              ))}
            </div>
            
            <p className="text-xs text-green-600/80 dark:text-green-400/80 text-center mt-2">
              💡 Tap to save instantly or customize amount
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress - Mobile Optimized */}
      <div className="mb-4">
        <BudgetProgress />
      </div>

      {/* Match Section */}
      <div className="mb-4">
        <MobileMatchSection />
      </div>

      {/* Enhanced Top 3 Friends Streaks - Prominent Section */}
      {topFriends.length > 0 ? (
        <Card className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-500" />
                <h3 className="text-base font-bold text-purple-700 dark:text-purple-300">Friend Streak Leaders</h3>
              </div>
              <TouchTarget asChild>
                <button className="text-sm text-purple-600 dark:text-purple-400 font-medium hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                  View All →
                </button>
              </TouchTarget>
            </div>
            
            <div className="space-y-4">
              {topFriends.map((friend, index) => {
                const isAhead = friend.consecutive_days > data.savingStreak;
                const streakDiff = Math.abs(friend.consecutive_days - data.savingStreak);
                
                return (
                  <div key={friend.user_id} className="bg-white/50 dark:bg-black/20 rounded-lg p-3 border border-white/30 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      {/* Rank Badge */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-700 border border-yellow-500/30' :
                        index === 1 ? 'bg-gray-400/20 text-gray-700 border border-gray-400/30' :
                        'bg-orange-500/20 text-orange-700 border border-orange-500/30'
                      }`}>
                        #{index + 1}
                      </div>
                      
                      {/* Avatar */}
                      <Avatar className="h-12 w-12 border-2 border-white/50">
                        <AvatarFallback className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-700 dark:text-purple-300 text-sm font-bold">
                          {friend.display_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Name and Streak */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{friend.display_name}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Flame className="h-4 w-4 text-orange-500" />
                            <span className="text-lg font-bold text-orange-600">{friend.consecutive_days} days</span>
                          </div>
                          {streakDiff > 0 && (
                            <Badge variant="outline" className={`text-xs ${
                              isAhead ? 'bg-red-500/10 text-red-700 border-red-500/30' : 'bg-green-500/10 text-green-700 border-green-500/30'
                            }`}>
                              {isAhead ? `+${streakDiff} ahead` : `-${streakDiff} behind`}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Cheer Button */}
                      <TouchTarget asChild>
                        <button className="px-3 py-1.5 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-full text-xs font-medium text-pink-700 dark:text-pink-300 hover:from-pink-500/30 hover:to-purple-500/30 transition-all">
                          🎉 Cheer
                        </button>
                      </TouchTarget>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Motivational Footer */}
            <div className="mt-4 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
              <p className="text-center text-sm text-muted-foreground">
                💪 Keep saving to climb the leaderboard!
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <CardContent className="p-6 text-center">
            <div className="mb-3">
              <Crown className="h-8 w-8 text-blue-500 mx-auto" />
            </div>
            <h3 className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-2">No Friend Streaks Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Invite friends to start competing and motivating each other!
            </p>
            <TouchTarget asChild>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all">
                Invite Friends
              </button>
            </TouchTarget>
          </CardContent>
        </Card>
      )}
    </div>
  );
}