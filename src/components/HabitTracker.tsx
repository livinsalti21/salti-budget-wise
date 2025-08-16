import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Flame, 
  Trophy, 
  Users, 
  Target,
  TrendingUp,
  Coffee,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  totalSaves: number;
  monthlyGoal: number;
  monthlyProgress: number;
  habitScore: number;
}

const HabitTracker = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<HabitStats>({
    currentStreak: 0,
    longestStreak: 0,
    totalSaves: 0,
    monthlyGoal: 50,
    monthlyProgress: 0,
    habitScore: 0
  });

  useEffect(() => {
    if (user) {
      fetchHabitData();
    }
  }, [user]);

  const fetchHabitData = async () => {
    if (!user) return;

    const { data: saves } = await supabase
      .from('saves')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (saves) {
      const totalSaves = saves.length;
      const monthlyProgress = calculateMonthlyProgress(saves);
      const currentStreak = calculateCurrentStreak(saves);
      const longestStreak = calculateLongestStreak(saves);
      const habitScore = Math.min(100, (currentStreak * 10) + (totalSaves * 2));

      setStats({
        currentStreak,
        longestStreak,
        totalSaves,
        monthlyGoal: 50,
        monthlyProgress,
        habitScore
      });
    }
  };

  const calculateMonthlyProgress = (saves: any[]) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthySaves = saves.filter(save => 
      new Date(save.created_at) >= startOfMonth
    );
    return monthySaves.length;
  };

  const calculateCurrentStreak = (saves: any[]) => {
    if (saves.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < saves.length; i++) {
      const saveDate = new Date(saves[i].created_at);
      saveDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (saveDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateLongestStreak = (saves: any[]) => {
    if (saves.length === 0) return 0;
    
    let longestStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < saves.length; i++) {
      const currentDate = new Date(saves[i].created_at);
      const previousDate = new Date(saves[i - 1].created_at);
      
      const dayDiff = Math.abs(currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (dayDiff <= 1) {
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }
    
    return Math.max(longestStreak, currentStreak);
  };

  const getStreakMessage = () => {
    if (stats.currentStreak === 0) return "Start your first save to begin building your habit!";
    if (stats.currentStreak === 1) return "Great start! Keep the momentum going.";
    if (stats.currentStreak < 7) return "Building momentum! You're on your way.";
    if (stats.currentStreak < 30) return "Strong habit forming! Keep it up.";
    return "Incredible dedication! You're a saving champion.";
  };

  return (
    <div className="space-y-6">
      {/* Habit Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-primary">{stats.currentStreak}</p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
              <Flame className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Habit Score</p>
                <p className="text-2xl font-bold text-accent">{stats.habitScore}</p>
                <p className="text-xs text-muted-foreground">/ 100</p>
              </div>
              <Trophy className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-success/20 bg-gradient-to-br from-success/5 to-success/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Goal</p>
                <p className="text-2xl font-bold text-success">{stats.monthlyProgress}</p>
                <p className="text-xs text-muted-foreground">/ {stats.monthlyGoal}</p>
              </div>
              <Target className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Best Streak</p>
                <p className="text-2xl font-bold text-warning">{stats.longestStreak}</p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
              <Calendar className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Habit Building Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Habit Building Progress
          </CardTitle>
          <CardDescription>
            {getStreakMessage()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Monthly Progress</span>
                <span>{stats.monthlyProgress} / {stats.monthlyGoal}</span>
              </div>
              <Progress value={(stats.monthlyProgress / stats.monthlyGoal) * 100} className="h-2" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
                <Coffee className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-semibold">Conscious Spending</p>
                <p className="text-sm text-muted-foreground">Every skip is a win</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-accent/5 to-accent/10 rounded-lg">
                <Users className="h-8 w-8 text-accent mx-auto mb-2" />
                <p className="font-semibold">Social Accountability</p>
                <p className="text-sm text-muted-foreground">Friends amplify success</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-success/5 to-success/10 rounded-lg">
                <Trophy className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="font-semibold">Compound Growth</p>
                <p className="text-sm text-muted-foreground">Small habits, big results</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Budget Setup Options
          </CardTitle>
          <CardDescription>
            Choose how you want to manage your budget and track progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <Upload className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Upload Your Spreadsheet</h3>
                  <p className="text-sm text-muted-foreground">Use your existing budget</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Upload Spreadsheet
              </Button>
            </div>

            <div className="p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <Target className="h-8 w-8 text-accent" />
                <div>
                  <h3 className="font-semibold">Livin Salti Template</h3>
                  <p className="text-sm text-muted-foreground">Auto-sync smart budgeting</p>
                </div>
              </div>
              <Button className="w-full">
                Get Template - $9.99
              </Button>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Pro Tip:</strong> Our template automatically calculates your savings projections 
              and integrates with your habit tracking for maximum motivation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HabitTracker;