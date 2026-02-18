import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { PiggyBank, TrendingUp, Flame, RefreshCw, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import BudgetProgress from '@/components/BudgetProgress';
import { Link } from 'react-router-dom';
import { track, EVENTS } from '@/analytics/analytics';
import { ErrorStatusWidget } from '@/components/monitoring/ErrorStatusWidget';
import { useProfile } from '@/hooks/useProfile';
import { isAdmin } from '@/lib/permissions/roleCheck';

interface DashboardData {
  totalSaved: number;
  savingsThisWeek: number;
  projectedNetWorth: number;
  savingStreak: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdminUser, setIsAdminUser] = useState(false);
  
  const [data, setData] = useState<DashboardData>({
    totalSaved: 0,
    savingsThisWeek: 0,
    projectedNetWorth: 0,
    savingStreak: 0,
  });

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const { data: accountSummary, error: accountError } = await supabase
        .from("user_accounts")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (accountError && accountError.code !== "PGRST116") throw accountError;

      const projected40Years = accountSummary?.projected_40yr_value_cents || 0;

      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const { data: weekSaves } = await supabase
        .from("save_events")
        .select("amount_cents")
        .eq("user_id", user.id)
        .gte("created_at", weekStart.toISOString());

      const thisWeekSaves = (weekSaves || []).reduce(
        (sum, save) => sum + save.amount_cents,
        0
      );

      const { data: streakData, error: streakError } = await supabase
        .from("user_streaks")
        .select("consecutive_days")
        .eq("user_id", user.id)
        .maybeSingle();

      if (streakError && streakError.code !== "PGRST116") throw streakError;

      setData({
        totalSaved: accountSummary?.current_balance_cents || 0,
        savingStreak: streakData?.consecutive_days || 0,
        savingsThisWeek: thisWeekSaves,
        projectedNetWorth: projected40Years,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!user) return;
    loadDashboardData();
    isAdmin(user.id).then(setIsAdminUser);

    const accountChannel = supabase
      .channel('user-account-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_accounts',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updated = payload.new as any;
          setData(prev => ({
            ...prev,
            totalSaved: updated.current_balance_cents,
            projectedNetWorth: updated.projected_40yr_value_cents,
          }));

          track(EVENTS.wealth_projection_updated, {
            new_projected_value: updated.projected_40yr_value_cents / 100,
            current_balance: updated.current_balance_cents / 100,
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(accountChannel); };
  }, [user]);

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-sm">✌🏽</div>
          <h1 className="text-xl font-bold text-foreground">Livin Salti</h1>
        </div>
        <button onClick={loadDashboardData} className="p-2 rounded-full hover:bg-muted transition-colors">
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/save-history">
          <Card className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <PiggyBank className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Total Saved</span>
              </div>
              <p className="text-xl font-bold text-foreground">{formatCurrency(data.totalSaved)}</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/net-worth">
          <Card className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">40Y Projection</span>
              </div>
              <p className="text-xl font-bold text-foreground">
                ${Math.round(data.projectedNetWorth / 100).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/goals">
          <Card className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <PiggyBank className="h-4 w-4 text-accent" />
                <span className="text-xs text-muted-foreground">This Week</span>
              </div>
              <p className="text-xl font-bold text-foreground">{formatCurrency(data.savingsThisWeek)}</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/streaks">
          <Card className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-muted-foreground">Streak</span>
              </div>
              <p className="text-xl font-bold text-foreground">
                {data.savingStreak > 0 ? `${data.savingStreak} days` : 'Start today'}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Budget Progress */}
      <BudgetProgress />

      {/* Admin Only */}
      {isAdminUser && <ErrorStatusWidget />}
    </div>
  );
}
