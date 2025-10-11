import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame, AlertCircle, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import StreakCalendar from '@/components/streaks/StreakCalendar';
import MilestoneTimeline from '@/components/streaks/MilestoneTimeline';
import StreakImpactCard from '@/components/streaks/StreakImpactCard';
import { StreaksExplainer } from '@/components/onboarding/StreaksExplainer';

const EnhancedStreaksDashboard = () => {
  const { user } = useAuth();
  const { stats } = useProfile();
  const navigate = useNavigate();
  const [showExplainer, setShowExplainer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [graceStatus, setGraceStatus] = useState<'safe' | 'at_risk' | 'broken'>('safe');

  useEffect(() => {
    if (user) {
      checkStreakStatus();
      
      // Show explainer for new users or those with no streak
      const hasSeenStreakExplainer = localStorage.getItem('hasSeenStreakExplainer');
      if (!hasSeenStreakExplainer || stats.currentStreak === 0) {
        setShowExplainer(true);
      }
    }
  }, [user, stats.currentStreak]);

  const checkStreakStatus = async () => {
    if (!user) return;

    // Check if user saved today or yesterday
    const { data: recentSaves } = await supabase
      .from('save_events')
      .select('created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (recentSaves && recentSaves.length > 0) {
      const lastSave = new Date(recentSaves[0].created_at);
      const now = new Date();
      const hoursSinceLastSave = (now.getTime() - lastSave.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastSave <= 24) {
        setGraceStatus('safe');
      } else if (hoursSinceLastSave <= 48) {
        setGraceStatus('at_risk');
      } else {
        setGraceStatus('broken');
      }
    } else {
      setGraceStatus('broken');
    }

    setIsLoading(false);
  };

  const getStreakStatusMessage = () => {
    if (graceStatus === 'safe') {
      return {
        message: "You're on track! Your streak is safe for today.",
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-950',
        borderColor: 'border-green-200 dark:border-green-800'
      };
    } else if (graceStatus === 'at_risk') {
      return {
        message: "⚠️ Grace period! Save now to keep your streak alive.",
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-950',
        borderColor: 'border-orange-200 dark:border-orange-800'
      };
    } else {
      return {
        message: "Start fresh! Make a save today to begin a new streak.",
        color: 'text-muted-foreground',
        bgColor: 'bg-muted/50',
        borderColor: 'border-border'
      };
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading your streak journey...</div>;
  }

  const statusInfo = getStreakStatusMessage();

  return (
    <div className="space-y-6">
      {/* Streaks Explainer */}
      {showExplainer && (
        <StreaksExplainer
          variant="full"
          onDismiss={() => {
            setShowExplainer(false);
            localStorage.setItem('hasSeenStreakExplainer', 'true');
          }}
        />
      )}

      {/* Hero Section - Current Streak */}
      <Card className={`${statusInfo.bgColor} border-2 ${statusInfo.borderColor}`}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Flame className={`h-8 w-8 ${stats.currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                  <p className="text-5xl font-bold">
                    {stats.currentStreak}
                    <span className="text-xl ml-2">
                      {stats.currentStreak === 1 ? 'day' : 'days'}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4">
                <Badge variant="outline" className="text-sm">
                  Best: {stats.longestStreak} days
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  {stats.totalSavesCount} total saves
                </Badge>
              </div>

              <p className={`text-sm font-medium mt-4 ${statusInfo.color}`}>
                {statusInfo.message}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => navigate('/save')}
                size="lg"
                className="gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Save Now
              </Button>
              {graceStatus === 'at_risk' && (
                <Button 
                  variant="outline"
                  size="sm"
                  className="gap-2 text-orange-600 border-orange-200"
                >
                  <AlertCircle className="h-4 w-4" />
                  Grace Period
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saving Pattern Tips */}
      {stats.lastSaveDate && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CalendarIcon className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold mb-1">💡 Your Saving Pattern</p>
                <p className="text-sm text-muted-foreground">
                  Last save: {new Date(stats.lastSaveDate).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </p>
                {stats.currentStreak >= 7 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    You've been consistent for over a week! Set a daily reminder to maintain momentum.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Impact Section */}
      <StreakImpactCard currentStreak={stats.currentStreak} />

      {/* Calendar Heatmap */}
      <StreakCalendar />

      {/* Milestone Timeline */}
      <MilestoneTimeline 
        currentStreak={stats.currentStreak} 
        longestStreak={stats.longestStreak}
      />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Keep Your Momentum Going</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => navigate('/save')} className="flex-1 min-w-[200px]">
            Make Today's Save
          </Button>
          <Button onClick={() => navigate('/net-worth')} variant="outline" className="flex-1 min-w-[200px]">
            View Wealth Growth
          </Button>
          <Button onClick={() => navigate('/save-history')} variant="outline" className="flex-1 min-w-[200px]">
            View Save History
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedStreaksDashboard;
