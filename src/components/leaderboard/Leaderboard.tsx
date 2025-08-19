import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Award, TrendingUp, Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  saves_count: number;
  total_saved_cents: number;
  current_streak: number | null;
}

export default function Leaderboard() {
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [monthlyLeaderboard, setMonthlyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboards();
  }, []);

  const loadLeaderboards = async () => {
    try {
      // Load weekly leaderboard using the view we created
      const { data: weekly, error: weeklyError } = await supabase
        .from('leaderboard_weekly')
        .select('*')
        .limit(10);

      if (weeklyError) throw weeklyError;

      // Load monthly leaderboard - get saves and profiles separately
      const { data: monthly, error: monthlyError } = await supabase
        .from('saves')
        .select('user_id, amount_cents')
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      if (monthlyError) throw monthlyError;

      // Process monthly data and get profiles
      const monthlyStats = new Map();
      monthly?.forEach(save => {
        const userId = save.user_id;
        const existing = monthlyStats.get(userId) || {
          user_id: userId,
          display_name: null,
          saves_count: 0,
          total_saved_cents: 0,
          current_streak: 0
        };
        
        existing.saves_count += 1;
        existing.total_saved_cents += save.amount_cents;
        monthlyStats.set(userId, existing);
      });

      // Get display names for monthly stats
      const userIds = Array.from(monthlyStats.keys());
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', userIds);

        profiles?.forEach(profile => {
          const stats = monthlyStats.get(profile.id);
          if (stats) {
            stats.display_name = profile.display_name;
          }
        });
      }

      const monthlyArray = Array.from(monthlyStats.values())
        .sort((a, b) => b.total_saved_cents - a.total_saved_cents)
        .slice(0, 10);

      setWeeklyLeaderboard(weekly || []);
      setMonthlyLeaderboard(monthlyArray);
    } catch (error) {
      console.error('Error loading leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const renderLeaderboard = (entries: LeaderboardEntry[]) => (
    <div className="space-y-3">
      {entries.map((entry, index) => {
        const rank = index + 1;
        return (
          <Card key={entry.user_id} className={`transition-colors ${rank <= 3 ? 'bg-gradient-to-r from-primary/5 to-accent/5' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8">
                    {getRankIcon(rank)}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {entry.display_name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {entry.display_name || 'Anonymous User'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      {entry.saves_count} saves
                      {entry.current_streak && entry.current_streak > 0 && (
                        <>
                          <Flame className="h-3 w-3 text-orange-500" />
                          {entry.current_streak} day streak
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-lg font-bold">
                  {formatCurrency(entry.total_saved_cents)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-16" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Leaderboards</h2>
        <p className="text-muted-foreground">See who's stacking the most</p>
      </div>

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="weekly">This Week</TabsTrigger>
          <TabsTrigger value="monthly">This Month</TabsTrigger>
        </TabsList>
        
        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Weekly Champions
              </CardTitle>
              <CardDescription>
                Top savers this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              {weeklyLeaderboard.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No saves this week yet. Be the first!
                </p>
              ) : (
                renderLeaderboard(weeklyLeaderboard)
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Medal className="h-5 w-5" />
                Monthly Champions
              </CardTitle>
              <CardDescription>
                Top savers this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyLeaderboard.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No saves this month yet. Start stacking!
                </p>
              ) : (
                renderLeaderboard(monthlyLeaderboard)
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}