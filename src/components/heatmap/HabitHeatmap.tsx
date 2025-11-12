import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, TrendingUp, Calendar, Trophy } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfYear, endOfDay, eachDayOfInterval, format, startOfWeek, differenceInDays } from 'date-fns';

interface DayData {
  date: string;
  count: number;
  amount: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface HabitHeatmapProps {
  userId?: string;
  userName?: string;
  compact?: boolean;
}

export default function HabitHeatmap({ userId, userName, compact = false }: HabitHeatmapProps) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  
  const [heatmapData, setHeatmapData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalDays: 0,
    totalSaves: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    if (!targetUserId) return;

    const fetchSavingActivity = async () => {
      try {
        const yearStart = startOfYear(new Date());
        const today = endOfDay(new Date());

        // Fetch all save events for the year
        const { data: saves, error } = await supabase
          .from('save_events')
          .select('created_at, amount_cents')
          .eq('user_id', targetUserId)
          .gte('created_at', yearStart.toISOString())
          .lte('created_at', today.toISOString())
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Generate all days in the year
        const allDays = eachDayOfInterval({ start: yearStart, end: today });
        
        // Create a map of date -> activity
        const activityMap = new Map<string, { count: number; amount: number }>();
        
        saves?.forEach((save) => {
          const dateKey = format(new Date(save.created_at), 'yyyy-MM-dd');
          const existing = activityMap.get(dateKey) || { count: 0, amount: 0 };
          activityMap.set(dateKey, {
            count: existing.count + 1,
            amount: existing.amount + save.amount_cents,
          });
        });

        // Calculate max saves per day for level scaling
        const maxSaves = Math.max(...Array.from(activityMap.values()).map(a => a.count), 1);

        // Build heatmap data
        const heatmap: DayData[] = allDays.map((date) => {
          const dateKey = format(date, 'yyyy-MM-dd');
          const activity = activityMap.get(dateKey) || { count: 0, amount: 0 };
          
          // Calculate level (0-4) based on activity
          let level: 0 | 1 | 2 | 3 | 4 = 0;
          if (activity.count > 0) {
            const ratio = activity.count / maxSaves;
            if (ratio >= 0.75) level = 4;
            else if (ratio >= 0.5) level = 3;
            else if (ratio >= 0.25) level = 2;
            else level = 1;
          }

          return {
            date: dateKey,
            count: activity.count,
            amount: activity.amount,
            level,
          };
        });

        setHeatmapData(heatmap);

        // Calculate stats
        const daysWithActivity = heatmap.filter(d => d.count > 0).length;
        const totalSaves = saves?.length || 0;
        const totalAmount = saves?.reduce((sum, s) => sum + s.amount_cents, 0) || 0;

        // Calculate streaks
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;

        for (let i = heatmap.length - 1; i >= 0; i--) {
          if (heatmap[i].count > 0) {
            tempStreak++;
            if (i === heatmap.length - 1 || currentStreak === 0) {
              currentStreak = tempStreak;
            }
            longestStreak = Math.max(longestStreak, tempStreak);
          } else {
            if (i === heatmap.length - 1) {
              currentStreak = 0;
            }
            tempStreak = 0;
          }
        }

        setStats({
          currentStreak,
          longestStreak,
          totalDays: daysWithActivity,
          totalSaves,
          totalAmount: totalAmount / 100,
        });
      } catch (error) {
        console.error('Error fetching saving activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavingActivity();
  }, [targetUserId]);

  const getLevelColor = (level: 0 | 1 | 2 | 3 | 4) => {
    switch (level) {
      case 0: return 'bg-muted/30';
      case 1: return 'bg-success/30';
      case 2: return 'bg-success/50';
      case 3: return 'bg-success/70';
      case 4: return 'bg-success';
      default: return 'bg-muted/30';
    }
  };

  // Group days by week
  const weeks: DayData[][] = [];
  let currentWeek: DayData[] = [];
  
  heatmapData.forEach((day, index) => {
    const dayOfWeek = new Date(day.date).getDay();
    
    // Start a new week on Sunday
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    
    currentWeek.push(day);
    
    // Push the last week
    if (index === heatmapData.length - 1 && currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
  });

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

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-4 text-center">
              <Flame className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-primary">{stats.currentStreak}</p>
              <p className="text-xs text-muted-foreground">Current Streak</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold text-accent">{stats.longestStreak}</p>
              <p className="text-xs text-muted-foreground">Longest Streak</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success/10 to-success/5">
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-success" />
              <p className="text-2xl font-bold text-success">{stats.totalDays}</p>
              <p className="text-xs text-muted-foreground">Active Days</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-accent/5">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-primary">{stats.totalSaves}</p>
              <p className="text-xs text-muted-foreground">Total Saves</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {userName ? `${userName}'s Savings Activity` : 'Your Savings Activity'}
              </CardTitle>
              {!compact && (
                <p className="text-sm text-muted-foreground mt-1">
                  {stats.totalSaves} saves • ${stats.totalAmount.toLocaleString()} saved this year
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`w-3 h-3 rounded-sm ${getLevelColor(level as 0 | 1 | 2 | 3 | 4)}`}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <TooltipProvider>
              <div className="inline-flex gap-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day) => (
                      <Tooltip key={day.date}>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-3 h-3 rounded-sm cursor-pointer hover:ring-2 hover:ring-primary transition-all ${getLevelColor(day.level)}`}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs">
                            <p className="font-semibold">{format(new Date(day.date), 'MMM d, yyyy')}</p>
                            <p>{day.count} {day.count === 1 ? 'save' : 'saves'}</p>
                            {day.amount > 0 && (
                              <p className="text-success">
                                ${(day.amount / 100).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                ))}
              </div>
            </TooltipProvider>
          </div>

          {!compact && (
            <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 <span className="font-semibold">Tip:</span> Consistency is key! Try to save something every day to build an unbreakable streak.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
