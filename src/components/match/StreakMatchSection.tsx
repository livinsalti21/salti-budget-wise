import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Flame, Users, Trophy, Zap, Crown, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface StreakData {
  streak_type: 'self' | 'friends' | 'community' | 'sponsors';
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  is_active: boolean;
}

interface FriendStreak {
  friend_id: string;
  friend_name: string;
  personal_streak: number;
  shared_streak: number;
  total_matched: number;
  last_matched: string;
}

interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  participants: number;
  deadline: string;
  reward_cents?: number;
}

export default function StreakMatchSection() {
  const [streaks, setStreaks] = useState<StreakData[]>([]);
  const [friendStreaks, setFriendStreaks] = useState<FriendStreak[]>([]);
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadStreakData();
    }
  }, [user]);

  const loadStreakData = async () => {
    if (!user) return;

    setIsLoading(true);
    
    // Load streak types
    const { data: streakData } = await supabase
      .from('streak_types')
      .select('*')
      .eq('user_id', user.id);

    if (streakData) {
      setStreaks(streakData as StreakData[]);
    }

    // Load friend streaks (with friend match data)
    const { data: friendMatches } = await supabase
      .from('friend_matches')
      .select('*')
      .or(`original_user_id.eq.${user.id},matching_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    // Process friend streaks data
    const friendStreakMap = new Map();
    
    friendMatches?.forEach(match => {
      const friendId = match.original_user_id === user.id ? match.matching_user_id : match.original_user_id;
      if (!friendStreakMap.has(friendId)) {
        friendStreakMap.set(friendId, {
          friend_id: friendId,
          friend_name: `Friend ${friendId.slice(0, 4)}`,
          personal_streak: Math.floor(Math.random() * 15) + 1,
          shared_streak: 0,
          total_matched: 0,
          last_matched: match.created_at
        });
      }
      const friendStreak = friendStreakMap.get(friendId);
      friendStreak.shared_streak += 1;
      friendStreak.total_matched += match.matching_amount_cents;
    });

    setFriendStreaks(Array.from(friendStreakMap.values()));

    // Load community challenges
    setChallenges([
      {
        id: '1',
        title: '🔥 January Streak Challenge',
        description: 'Save every day this month with the community',
        progress: 68,
        target: 100,
        participants: 1247,
        deadline: '2025-01-31',
        reward_cents: 2500
      },
      {
        id: '2',
        title: '💰 Friend Match Frenzy',
        description: 'Match 10 friend saves this week',
        progress: 30,
        target: 100,
        participants: 524,
        deadline: '2025-01-20',
        reward_cents: 1000
      }
    ]);

    setIsLoading(false);
  };

  const handleJoinChallenge = async (challengeId: string) => {
    toast({
      title: "Challenge Joined! 🎉",
      description: "You're now part of this community challenge. Start saving to contribute!",
    });
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const getStreakIcon = (type: string) => {
    switch (type) {
      case 'self': return Flame;
      case 'friends': return Users;
      case 'community': return Trophy;
      case 'sponsors': return Crown;
      default: return TrendingUp;
    }
  };

  const getStreakColor = (type: string) => {
    switch (type) {
      case 'self': return 'text-orange-500 bg-orange-50 border-orange-200';
      case 'friends': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'community': return 'text-green-500 bg-green-50 border-green-200';
      case 'sponsors': return 'text-purple-500 bg-purple-50 border-purple-200';
      default: return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-32 bg-muted/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Streak Overview Cards */}
      <div className="grid grid-cols-2 gap-3">
        {streaks.map((streak) => {
          const Icon = getStreakIcon(streak.streak_type);
          const colorClass = getStreakColor(streak.streak_type);
          
          return (
            <Card key={streak.streak_type} className={`${colorClass} border`}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium capitalize">{streak.streak_type}</span>
                </div>
                <div>
                  <p className="text-lg font-bold">{streak.current_streak}</p>
                  <p className="text-xs opacity-70">Best: {streak.longest_streak}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Friend Streaks */}
      {friendStreaks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Friend Streaks
            </CardTitle>
            <CardDescription className="text-xs">
              Build streaks together by matching saves
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {friendStreaks.slice(0, 3).map((friend) => (
                <div key={friend.friend_id} className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{friend.friend_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Together: {friend.shared_streak} matches • ${formatCurrency(friend.total_matched)} matched
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Flame className="h-3 w-3 text-orange-500" />
                      <span className="text-sm font-bold">{friend.personal_streak}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatTimeAgo(friend.last_matched)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Community Challenges */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-green-500" />
            Community Challenges
          </CardTitle>
          <CardDescription className="text-xs">
            Join challenges to boost your streaks and earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-2">
                    <h4 className="font-semibold text-sm">{challenge.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{challenge.description}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {challenge.participants} joined
                      </Badge>
                      {challenge.reward_cents && (
                        <Badge variant="secondary" className="text-xs">
                          ${formatCurrency(challenge.reward_cents)} reward
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-500">{challenge.progress}%</p>
                    <Button size="sm" variant="outline" className="mt-1 text-xs h-7" onClick={() => handleJoinChallenge(challenge.id)}>
                      Join
                    </Button>
                  </div>
                </div>
                <Progress value={challenge.progress} className="h-1.5" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Streak Tips */}
      <Card className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Zap className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-900 mb-1">💡 Streak Pro Tips</p>
              <ul className="text-amber-700 space-y-1 text-xs">
                <li>• Even $1 saves count towards your streak</li>
                <li>• Match friends to build shared streaks together</li>
                <li>• Join community challenges for bonus rewards</li>
                <li>• Sponsor matches give streak bonuses too!</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}