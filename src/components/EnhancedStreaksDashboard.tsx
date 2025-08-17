import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, Users, Building, Heart, TrendingUp, Calendar, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface StreakData {
  streak_type: 'self' | 'friends' | 'community' | 'sponsors';
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  is_active: boolean;
}

interface FriendActivity {
  id: string;
  name: string;
  streak: number;
  lastSave: string;
  avatar?: string;
}

interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  participants: number;
  deadline: string;
}

interface SponsorMatch {
  id: string;
  sponsor_name: string;
  match_percentage: number;
  matches_received: number;
  total_matched: number;
  is_active: boolean;
}

const EnhancedStreaksDashboard = () => {
  const [streaks, setStreaks] = useState<StreakData[]>([]);
  const [friends, setFriends] = useState<FriendActivity[]>([]);
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [sponsors, setSponsors] = useState<SponsorMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadAllStreakData();
    }
  }, [user]);

  const loadAllStreakData = async () => {
    if (!user) return;

    setIsLoading(true);
    await Promise.all([
      loadStreakTypes(),
      loadFriendActivities(),
      loadChallenges(),
      loadSponsorMatches()
    ]);
    setIsLoading(false);
  };

  const loadStreakTypes = async () => {
    if (!user) return;

    // Initialize default streak types if they don't exist
    const streakTypes = ['self', 'friends', 'community', 'sponsors'];
    
    for (const type of streakTypes) {
      await supabase
        .from('streak_types')
        .upsert({
          user_id: user.id,
          streak_type: type,
          current_streak: 0,
          longest_streak: 0
        });
    }

    const { data } = await supabase
      .from('streak_types')
      .select('*')
      .eq('user_id', user.id);

    if (data) {
      setStreaks(data as StreakData[]);
    }
  };

  const loadFriendActivities = async () => {
    // Mock friend data for now - in real app this would come from friend connections
    setFriends([
      { id: '1', name: 'Sarah M.', streak: 12, lastSave: '2 hours ago' },
      { id: '2', name: 'Mike R.', streak: 8, lastSave: '1 day ago' },
      { id: '3', name: 'Emma K.', streak: 15, lastSave: '3 hours ago' },
      { id: '4', name: 'Josh L.', streak: 5, lastSave: '2 days ago' }
    ]);
  };

  const loadChallenges = async () => {
    // Mock community challenge data
    setChallenges([
      {
        id: '1',
        title: 'January Savings Challenge',
        description: 'Save $500 this month with your community',
        progress: 67,
        target: 100,
        participants: 234,
        deadline: '2025-01-31'
      },
      {
        id: '2',
        title: 'No-Spend Weekend',
        description: 'Go the entire weekend without unnecessary purchases',
        progress: 45,
        target: 100,
        participants: 156,
        deadline: '2025-01-20'
      }
    ]);
  };

  const loadSponsorMatches = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('match_events')
      .select('*')
      .eq('recipient_user_id', user.id);

    // Group by sponsor
    const sponsorMap = new Map();
    data?.forEach(match => {
      const sponsorName = 'Anonymous Sponsor';
      if (!sponsorMap.has(sponsorName)) {
        sponsorMap.set(sponsorName, {
          id: match.sponsor_id,
          sponsor_name: sponsorName,
          match_percentage: 100, // Default
          matches_received: 0,
          total_matched: 0,
          is_active: true
        });
      }
      const sponsor = sponsorMap.get(sponsorName);
      sponsor.matches_received += 1;
      sponsor.total_matched += match.match_amount_cents;
    });

    setSponsors(Array.from(sponsorMap.values()));
  };

  const getStreakIcon = (type: string) => {
    switch (type) {
      case 'self': return Flame;
      case 'friends': return Users;
      case 'community': return Building;
      case 'sponsors': return Star;
      default: return TrendingUp;
    }
  };

  const getStreakColor = (type: string) => {
    switch (type) {
      case 'self': return 'text-orange-500';
      case 'friends': return 'text-blue-500';
      case 'community': return 'text-green-500';
      case 'sponsors': return 'text-purple-500';
      default: return 'text-primary';
    }
  };

  const formatStreakType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading streaks...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Enhanced Streaks Dashboard</h2>
        <p className="text-muted-foreground">Track your streaks across different dimensions</p>
      </div>

      {/* Streak Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {streaks.map((streak) => {
          const Icon = getStreakIcon(streak.streak_type);
          const colorClass = getStreakColor(streak.streak_type);
          
          return (
            <Card key={streak.streak_type} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${colorClass}`} />
                  {formatStreakType(streak.streak_type)} Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className={`text-2xl font-bold ${colorClass}`}>
                    {streak.current_streak}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Best: {streak.longest_streak} days
                  </p>
                  <Badge variant={streak.is_active ? "default" : "secondary"} className="text-xs">
                    {streak.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Friend Activities
              </CardTitle>
              <CardDescription>
                See how your friends are doing with their savings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium">{friend.name}</p>
                        <p className="text-sm text-muted-foreground">{friend.lastSave}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-500">{friend.streak}</p>
                      <p className="text-xs text-muted-foreground">day streak</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-green-500" />
                Community Challenges
              </CardTitle>
              <CardDescription>
                Join group savings challenges with the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {challenges.map((challenge) => (
                  <div key={challenge.id} className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{challenge.title}</h4>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {challenge.participants} participants
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            Due: {new Date(challenge.deadline).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-500">{challenge.progress}%</p>
                      </div>
                    </div>
                    <Progress value={challenge.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sponsors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-500" />
                Sponsor Matches
              </CardTitle>
              <CardDescription>
                Track matches you've received from sponsors
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sponsors.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No sponsor matches yet</p>
                  <p className="text-sm text-muted-foreground">Start saving to attract sponsor matches!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sponsors.map((sponsor) => (
                    <div key={sponsor.id} className="flex items-center justify-between p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <div>
                        <h4 className="font-semibold">{sponsor.sponsor_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {sponsor.matches_received} matches received
                        </p>
                        <Badge 
                          variant={sponsor.is_active ? "default" : "secondary"} 
                          className="mt-1 text-xs"
                        >
                          {sponsor.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-purple-500">
                          ${(sponsor.total_matched / 100).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">total matched</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedStreaksDashboard;