import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Flame, Trophy, Medal, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardUser {
  user_id: string;
  display_name: string | null;
  consecutive_days: number;
  total_saves: number;
  rank: number;
}

export default function LeaderboardPage() {
  const [weeklyLeaders, setWeeklyLeaders] = useState<LeaderboardUser[]>([]);
  const [monthlyLeaders, setMonthlyLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboards();
  }, []);

  const loadLeaderboards = async () => {
    try {
      // Get users with their streaks and save counts
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select(`
          user_id,
          consecutive_days
        `)
        .gte('consecutive_days', 1)
        .order('consecutive_days', { ascending: false })
        .limit(50);

      if (streakData) {
        // Get profiles and save counts for each user
        const usersWithSaves = await Promise.all(
          streakData.map(async (user) => {
            // Get profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('id', user.user_id)
              .single();

            const { count } = await supabase
              .from('saves')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.user_id);

            return {
              user_id: user.user_id,
              display_name: profile?.display_name || null,
              consecutive_days: user.consecutive_days,
              total_saves: count || 0,
              rank: 0
            };
          })
        );

        // Sort by streak days and assign ranks
        const rankedUsers = usersWithSaves
          .sort((a, b) => b.consecutive_days - a.consecutive_days)
          .map((user, index) => ({ ...user, rank: index + 1 }));

        setWeeklyLeaders(rankedUsers.slice(0, 10));
        setMonthlyLeaders(rankedUsers.slice(0, 20));
      }
    } catch (error) {
      console.error('Error loading leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const LeaderboardCard = ({ title, users }: { title: string; users: LeaderboardUser[] }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {users.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No streaks yet. Be the first!
          </p>
        ) : (
          users.map((user) => (
            <div
              key={user.user_id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                user.rank <= 3 ? 'bg-gradient-to-r from-primary/5 to-accent/5' : 'bg-muted/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankIcon(user.rank)}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {user.display_name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {user.display_name || 'Anonymous'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user.total_saves} saves total
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-orange-50 text-orange-700">
                <Flame className="h-3 w-3 mr-1" />
                {user.consecutive_days} day{user.consecutive_days !== 1 ? 's' : ''}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="h-40" />
        </Card>
        <Card className="animate-pulse">
          <CardContent className="h-60" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">🏆 Leaderboard</h1>
        <p className="text-muted-foreground">Celebrate the longest streaks in our community</p>
      </div>

      <LeaderboardCard title="Top Streaks This Week" users={weeklyLeaders} />
      <LeaderboardCard title="All-Time Streak Champions" users={monthlyLeaders} />
    </div>
  );
}