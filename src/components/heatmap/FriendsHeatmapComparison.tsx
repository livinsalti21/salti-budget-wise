import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import HabitHeatmap from './HabitHeatmap';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Friend {
  user_id: string;
  email: string;
  name: string;
  current_streak: number;
  total_saves: number;
  rank: number;
}

export default function FriendsHeatmapComparison() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchFriendsActivity = async () => {
      try {
        // Fetch friends from groups/matches
        const { data: groupMembers, error: groupError } = await supabase
          .from('group_members')
          .select(`
            user_id,
            groups:group_id (
              id
            )
          `)
          .neq('user_id', user.id);

        if (groupError) throw groupError;

        // Get unique friend user IDs
        const friendIds = [...new Set(groupMembers?.map(m => m.user_id) || [])];

        if (friendIds.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch profiles for friends
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, display_name')
          .in('id', friendIds);

        if (profileError) throw profileError;

        // Calculate stats for each friend
        const friendsWithStats = await Promise.all(
          (profiles || []).map(async (profile) => {
            // Get saves for the current year
            const yearStart = new Date(new Date().getFullYear(), 0, 1);
            const { data: saves } = await supabase
              .from('save_events')
              .select('created_at')
              .eq('user_id', profile.id)
              .gte('created_at', yearStart.toISOString())
              .order('created_at', { ascending: false });

            // Calculate current streak
            let currentStreak = 0;
            if (saves && saves.length > 0) {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              for (let i = 0; i < saves.length; i++) {
                const saveDate = new Date(saves[i].created_at);
                saveDate.setHours(0, 0, 0, 0);
                
                const daysDiff = Math.floor((today.getTime() - saveDate.getTime()) / (1000 * 60 * 60 * 24));
                
                if (daysDiff === currentStreak) {
                  currentStreak++;
                } else {
                  break;
                }
              }
            }

            return {
              user_id: profile.id,
              email: profile.email || '',
              name: profile.display_name || profile.email?.split('@')[0] || 'Friend',
              current_streak: currentStreak,
              total_saves: saves?.length || 0,
              rank: 0, // Will be calculated after sorting
            };
          })
        );

        // Sort by current streak (descending)
        friendsWithStats.sort((a, b) => b.current_streak - a.current_streak);
        
        // Assign ranks
        friendsWithStats.forEach((friend, index) => {
          friend.rank = index + 1;
        });

        setFriends(friendsWithStats);
      } catch (error) {
        console.error('Error fetching friends activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriendsActivity();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (friends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Friends Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">No friends yet</p>
            <p className="text-sm text-muted-foreground">
              Join groups or connect with friends to compare saving habits
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Friends Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {friends.map((friend) => (
              <div
                key={friend.user_id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer hover:bg-accent/5 ${
                  selectedFriend === friend.user_id ? 'bg-primary/5 border-primary/30' : 'border-border'
                }`}
                onClick={() => setSelectedFriend(selectedFriend === friend.user_id ? null : friend.user_id)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20">
                        {friend.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {friend.rank <= 3 && (
                      <div className="absolute -top-1 -right-1 bg-gradient-to-r from-accent to-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        {friend.rank}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{friend.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {friend.total_saves} saves this year
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-primary font-bold">
                      <TrendingUp className="h-4 w-4" />
                      <span>{friend.current_streak}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">day streak</p>
                  </div>
                  {friend.rank <= 3 && (
                    <Award className={`h-6 w-6 ${
                      friend.rank === 1 ? 'text-yellow-500' :
                      friend.rank === 2 ? 'text-gray-400' :
                      'text-amber-600'
                    }`} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedFriend && (
        <HabitHeatmap
          userId={selectedFriend}
          userName={friends.find(f => f.user_id === selectedFriend)?.name}
          compact={false}
        />
      )}
    </div>
  );
}
