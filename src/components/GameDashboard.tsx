import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Target, 
  Users, 
  Flame, 
  Crown, 
  Star,
  Coffee,
  Coins,
  Award,
  TrendingUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress?: number;
  target?: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  type: "individual" | "group";
  endDate: string;
  reward: string;
}

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  total_saved: number;
  streak: number;
}

export default function GameDashboard() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState({
    totalSaved: 0,
    streak: 0,
    level: 1,
    xp: 0,
    rank: 0
  });

  useEffect(() => {
    if (user) {
      loadGameData();
    }
  }, [user]);

  const loadGameData = async () => {
    await Promise.all([
      loadBadges(),
      loadChallenges(), 
      loadLeaderboard(),
      loadUserStats()
    ]);
  };

  const loadBadges = async () => {
    // Mock badge data - in real app, fetch from database
    const mockBadges: Badge[] = [
      {
        id: "first-save",
        name: "First Save",
        description: "Made your first save",
        icon: "star",
        earned: true
      },
      {
        id: "streak-master",
        name: "Streak Master",
        description: "Maintain a 7-day save streak",
        icon: "flame",
        earned: false,
        progress: userStats.streak,
        target: 7
      },
      {
        id: "century-club",
        name: "Century Club",
        description: "Save $100 or more",
        icon: "coins",
        earned: userStats.totalSaved >= 10000, // $100 in cents
        progress: Math.min(userStats.totalSaved, 10000),
        target: 10000
      },
      {
        id: "social-butterfly",
        name: "Social Butterfly",
        description: "Get 5 friends to match your saves",
        icon: "users",
        earned: false,
        progress: 2,
        target: 5
      }
    ];
    setBadges(mockBadges);
  };

  const loadChallenges = async () => {
    // Mock challenge data
    const mockChallenges: Challenge[] = [
      {
        id: "weekly-saver",
        title: "Weekly Saver",
        description: "Save $25 this week",
        target: 2500,
        progress: userStats.totalSaved % 2500,
        type: "individual",
        endDate: "2024-01-21",
        reward: "Saver Badge + 100 XP"
      },
      {
        id: "group-challenge",
        title: "Team Stack Challenge",
        description: "Your group saves $500 together",
        target: 50000,
        progress: 32000,
        type: "group",
        endDate: "2024-01-28",
        reward: "Group Champion Badge"
      }
    ];
    setChallenges(mockChallenges);
  };

  const loadLeaderboard = async () => {
    try {
      // Get saves with user profiles for leaderboard
      const { data: saves } = await supabase
        .from('saves')
        .select(`
          amount_cents,
          user_id,
          profiles:user_id (display_name)
        `);

      if (saves) {
        // Calculate totals per user
        const userTotals = saves.reduce((acc: any, save: any) => {
          const userId = save.user_id;
          if (!acc[userId]) {
            acc[userId] = {
              user_id: userId,
              display_name: save.profiles?.display_name || 'Anonymous',
              total_saved: 0,
              streak: Math.floor(Math.random() * 20) + 1 // Mock streak data
            };
          }
          acc[userId].total_saved += save.amount_cents;
          return acc;
        }, {});

        // Convert to array and sort
        const leaderboardData = Object.values(userTotals)
          .sort((a: any, b: any) => b.total_saved - a.total_saved)
          .slice(0, 10)
          .map((entry: any, index: number) => ({
            ...entry,
            rank: index + 1
          }));

        setLeaderboard(leaderboardData as LeaderboardEntry[]);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      const { data: saves } = await supabase
        .from('saves')
        .select('amount_cents')
        .eq('user_id', user?.id);

      if (saves) {
        const totalSaved = saves.reduce((sum, save) => sum + save.amount_cents, 0);
        const streak = Math.floor(Math.random() * 15) + 1; // Mock streak
        const xp = Math.floor(totalSaved / 100); // 1 XP per dollar saved
        const level = Math.floor(xp / 1000) + 1; // Level up every 1000 XP

        setUserStats({
          totalSaved,
          streak,
          level,
          xp,
          rank: Math.floor(Math.random() * 100) + 1
        });
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const getBadgeIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      star: Star,
      flame: Flame,
      coins: Coins,
      users: Users,
      trophy: Trophy,
      award: Award
    };
    return icons[iconName] || Star;
  };

  return (
    <div className="space-y-6">
      {/* User Level & XP */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Level {userStats.level} Saver
              </CardTitle>
              <CardDescription>
                Rank #{userStats.rank} • {userStats.xp} XP
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {userStats.streak} 🔥
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {userStats.level + 1}</span>
              <span>{userStats.xp % 1000}/1000 XP</span>
            </div>
            <Progress value={(userStats.xp % 1000) / 10} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="challenges" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="challenges" className="space-y-4">
          {challenges.map((challenge) => (
            <Card key={challenge.id} className={`border-l-4 ${
              challenge.type === 'group' ? 'border-l-accent' : 'border-l-primary'
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      {challenge.title}
                    </CardTitle>
                    <CardDescription>{challenge.description}</CardDescription>
                  </div>
                  <Badge variant={challenge.type === 'group' ? 'default' : 'secondary'}>
                    {challenge.type === 'group' ? 'Group' : 'Solo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>${(challenge.progress / 100).toFixed(2)} / ${(challenge.target / 100).toFixed(2)}</span>
                  </div>
                  <Progress value={(challenge.progress / challenge.target) * 100} />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Ends {new Date(challenge.endDate).toLocaleDateString()}
                    </span>
                    <span className="text-sm font-medium text-primary">
                      Reward: {challenge.reward}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {badges.map((badge) => {
              const IconComponent = getBadgeIcon(badge.icon);
              return (
                <Card key={badge.id} className={`${
                  badge.earned ? 'bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20' : 'opacity-60'
                }`}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        badge.earned ? 'bg-gradient-to-br from-primary to-accent text-white' : 'bg-muted'
                      }`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{badge.name}</CardTitle>
                        <CardDescription>{badge.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  {!badge.earned && badge.progress !== undefined && badge.target && (
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{badge.progress}/{badge.target}</span>
                        </div>
                        <Progress value={(badge.progress / badge.target) * 100} />
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Top Savers This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div key={entry.user_id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        entry.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                        entry.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                        entry.rank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {entry.rank}
                      </div>
                      <div>
                        <div className="font-medium">{entry.display_name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Flame className="h-3 w-3" />
                          {entry.streak} day streak
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">
                        ${(entry.total_saved / 100).toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">saved</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}