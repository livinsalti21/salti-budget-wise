import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flame, Calendar, Award, TrendingUp, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserStreak {
  consecutive_days: number;
  longest_streak: number;
  last_action_date: string | null;
  is_active: boolean;
}

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  earned_at?: string;
}

const StreaksAndBadges = () => {
  const [userStreak, setUserStreak] = useState<UserStreak | null>(null);
  const [earnedBadges, setEarnedBadges] = useState<BadgeData[]>([]);
  const [availableBadges, setAvailableBadges] = useState<BadgeData[]>([]);
  const [userStats, setUserStats] = useState({
    total_saves: 0,
    total_amount: 0,
    stacklets_created: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const loadStreakData = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading streak:', error);
    } else {
      setUserStreak(data);
    }
  };

  const loadBadgesData = async () => {
    if (!user) return;

    // Load earned badges
    const { data: earnedData, error: earnedError } = await supabase
      .from('user_badges')
      .select(`
        badge_id,
        earned_at,
        badges (*)
      `)
      .eq('user_id', user.id);

    if (earnedError) {
      console.error('Error loading earned badges:', earnedError);
    } else {
      const earned = (earnedData || []).map(item => ({
        ...item.badges,
        earned_at: item.earned_at
      })) as BadgeData[];
      setEarnedBadges(earned);
    }

    // Load all available badges
    const { data: allBadges, error: allError } = await supabase
      .from('badges')
      .select('*')
      .order('requirement_value');

    if (allError) {
      console.error('Error loading badges:', allError);
    } else {
      const earnedIds = new Set((earnedData || []).map(item => item.badge_id));
      const available = (allBadges || []).filter(badge => !earnedIds.has(badge.id));
      setAvailableBadges(available as BadgeData[]);
    }
  };

  const loadUserStats = async () => {
    if (!user) return;

    // Get save count and total amount
    const { data: saveStats } = await supabase
      .from('save_events')
      .select('amount_cents')
      .eq('user_id', user.id);

    // Get stacklets count
    const { data: stackletStats } = await supabase
      .from('stacklets')
      .select('id')
      .eq('user_id', user.id);

    setUserStats({
      total_saves: saveStats?.length || 0,
      total_amount: (saveStats || []).reduce((sum, save) => sum + save.amount_cents, 0),
      stacklets_created: stackletStats?.length || 0
    });
  };

  useEffect(() => {
    Promise.all([
      loadStreakData(),
      loadBadgesData(),
      loadUserStats()
    ]);
  }, [user]);

  const handleNoSpendDay = async () => {
    if (!user) return;
    
    setIsLoading(true);

    const { error } = await supabase
      .from('daily_actions')
      .insert({
        user_id: user.id,
        action_date: new Date().toISOString().split('T')[0],
        action_type: 'no_spend'
      });

    if (error && error.code !== '23505') { // Ignore duplicate key error
      toast({
        title: "Error marking no-spend day",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "No-spend day marked! 🎉",
        description: "Your streak continues! Keep up the great work.",
      });
      
      // Refresh streak data
      loadStreakData();
    }
    
    setIsLoading(false);
  };

  const getBadgeProgress = (badge: BadgeData) => {
    let current = 0;
    const target = badge.requirement_value;

    switch (badge.requirement_type) {
      case 'first_save':
      case 'total_saves':
        current = userStats.total_saves;
        break;
      case 'total_amount':
        current = userStats.total_amount;
        break;
      case 'stacklets_created':
        current = userStats.stacklets_created;
        break;
      case 'streak_days':
        current = userStreak?.consecutive_days || 0;
        break;
    }

    return Math.min((current / target) * 100, 100);
  };

  const formatAmount = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const getProgressLabel = (badge: BadgeData) => {
    let current = 0;
    const target = badge.requirement_value;

    switch (badge.requirement_type) {
      case 'first_save':
      case 'total_saves':
        current = userStats.total_saves;
        return `${current}/${target} saves`;
      case 'total_amount':
        current = userStats.total_amount;
        return `$${formatAmount(current)}/$${formatAmount(target)}`;
      case 'stacklets_created':
        current = userStats.stacklets_created;
        return `${current}/${target} stacklets`;
      case 'streak_days':
        current = userStreak?.consecutive_days || 0;
        return `${current}/${target} days`;
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Streaks & Badges</h2>
        <p className="text-muted-foreground">Track your progress and celebrate your achievements</p>
      </div>

      {/* Current Streak */}
      <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Your Streak
          </CardTitle>
          <CardDescription>
            Keep your saving momentum going strong
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500 mb-1">
                {userStreak?.consecutive_days || 0}
              </div>
              <p className="text-sm text-muted-foreground">Current Streak</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {userStreak?.longest_streak || 0}
              </div>
              <p className="text-sm text-muted-foreground">Longest Streak</p>
            </div>
            
            <div className="text-center">
              <Button 
                onClick={handleNoSpendDay}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {isLoading ? 'Marking...' : 'Mark No-Spend Day'}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                Didn't buy anything today? Keep your streak alive!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Earned Badges ({earnedBadges.length})
            </CardTitle>
            <CardDescription>
              Your achievements and milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {earnedBadges.map((badge) => (
                <div key={badge.id} className="text-center p-3 bg-gradient-to-b from-yellow-500/10 to-yellow-600/10 rounded-lg border border-yellow-500/20">
                  <div className="text-2xl mb-2">{badge.icon}</div>
                  <h4 className="font-semibold text-sm">{badge.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                  {badge.earned_at && (
                    <p className="text-xs text-yellow-600 mt-1">
                      {new Date(badge.earned_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Badges */}
      {availableBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Next Achievements
            </CardTitle>
            <CardDescription>
              Badges you can earn next
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableBadges.slice(0, 6).map((badge) => {
                const progress = getBadgeProgress(badge);
                const progressLabel = getProgressLabel(badge);
                
                return (
                  <div key={badge.id} className="flex items-center gap-4 p-4 bg-secondary/20 rounded-lg">
                    <div className="text-2xl">{badge.icon}</div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{badge.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {progressLabel}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{userStats.total_saves}</div>
              <p className="text-sm text-muted-foreground">Total Saves</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">${formatAmount(userStats.total_amount)}</div>
              <p className="text-sm text-muted-foreground">Total Saved</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">{userStats.stacklets_created}</div>
              <p className="text-sm text-muted-foreground">Stacklets Created</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreaksAndBadges;