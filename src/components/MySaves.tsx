import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PiggyBank, TrendingUp, Users, Flame, Target, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Save {
  id: string;
  amount_cents: number;
  reason: string;
  created_at: string;
}

interface SaveStats {
  totalSaved: number;
  saveStreak: number;
  matchesReceived: number;
  matchesGiven: number;
  savingsGoal: number;
  monthlyProgress: number;
}

const MySaves = () => {
  const { user } = useAuth();
  const [saves, setSaves] = useState<Save[]>([]);
  const [stats, setStats] = useState<SaveStats>({
    totalSaved: 0,
    saveStreak: 0,
    matchesReceived: 0,
    matchesGiven: 0,
    savingsGoal: 100000, // $1000 goal
    monthlyProgress: 0
  });

  useEffect(() => {
    if (user) {
      fetchSavesData();
      fetchMatchesData();
    }
  }, [user]);

  const fetchSavesData = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('saves')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setSaves(data);
      const total = data.reduce((sum, save) => sum + save.amount_cents, 0);
      
      // Calculate monthly progress (current month saves)
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyTotal = data
        .filter(save => new Date(save.created_at) >= startOfMonth)
        .reduce((sum, save) => sum + save.amount_cents, 0);
      
      setStats(prev => ({
        ...prev,
        totalSaved: total,
        saveStreak: calculateStreak(data),
        monthlyProgress: monthlyTotal
      }));
    }
  };

  const fetchMatchesData = async () => {
    if (!user) return;

    // Fetch matches given (where user matched others)
    const { data: matchesGiven } = await supabase
      .from('save_matches')
      .select('*')
      .eq('matcher_user_id', user.id);

    // Fetch matches received (where others matched user's saves)
    const { data: savesData } = await supabase
      .from('saves')
      .select(`
        *,
        save_matches!inner(*)
      `)
      .eq('user_id', user.id);

    const matchesReceived = savesData?.reduce((sum, save) => sum + (save.save_matches?.length || 0), 0) || 0;

    setStats(prev => ({
      ...prev,
      matchesReceived,
      matchesGiven: matchesGiven?.length || 0
    }));
  };

  const calculateStreak = (saves: Save[]) => {
    if (saves.length === 0) return 0;
    
    // Simple streak calculation - consecutive days with saves
    const sortedSaves = saves.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);
    
    for (const save of sortedSaves) {
      const saveDate = new Date(save.created_at);
      if (isSameDay(saveDate, currentDate) || isYesterday(saveDate, currentDate)) {
        streak++;
        currentDate = new Date(saveDate);
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isYesterday = (date1: Date, date2: Date) => {
    const yesterday = new Date(date2);
    yesterday.setDate(yesterday.getDate() - 1);
    return isSameDay(date1, yesterday);
  };

  const calculateFutureValue = (principal: number, years: number, rate: number = 0.08) => {
    return principal * Math.pow(1 + rate, years);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const getBudgetStatus = () => {
    const percentage = (stats.monthlyProgress / stats.savingsGoal) * 100;
    if (percentage >= 100) return { status: 'Goal Reached!', color: 'text-success', bgColor: 'bg-success/10' };
    if (percentage >= 80) return { status: 'Almost There!', color: 'text-warning', bgColor: 'bg-warning/10' };
    if (percentage >= 50) return { status: 'On Track', color: 'text-primary', bgColor: 'bg-primary/10' };
    return { status: 'Keep Going', color: 'text-muted-foreground', bgColor: 'bg-muted' };
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PiggyBank className="h-4 w-4" />
              Total Saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">${(stats.totalSaved / 100).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">
              Future value (10yr): ${calculateFutureValue(stats.totalSaved / 100, 10).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Save Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-warning">{stats.saveStreak}</p>
            <p className="text-xs text-muted-foreground">consecutive days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <div>
                <p className="text-lg font-bold text-primary">{stats.matchesReceived}</p>
                <p className="text-xs text-muted-foreground">received</p>
              </div>
              <div>
                <p className="text-lg font-bold text-accent">{stats.matchesGiven}</p>
                <p className="text-xs text-muted-foreground">given</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Monthly Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">${(stats.monthlyProgress / 100).toFixed(2)}</span>
                <span className="text-sm">${(stats.savingsGoal / 100).toFixed(2)}</span>
              </div>
              <Progress value={(stats.monthlyProgress / stats.savingsGoal) * 100} className="h-2" />
              <Badge className={`${getBudgetStatus().bgColor} ${getBudgetStatus().color} text-xs`}>
                {getBudgetStatus().status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="saves" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="saves">Recent Saves</TabsTrigger>
          <TabsTrigger value="projections">Future Projections</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="saves" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Saves</CardTitle>
              <CardDescription>Your latest Save & Stack activities</CardDescription>
            </CardHeader>
            <CardContent>
              {saves.length === 0 ? (
                <div className="text-center py-8">
                  <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No saves yet. Start stacking!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {saves.slice(0, 10).map((save) => (
                    <div key={save.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">${(save.amount_cents / 100).toFixed(2)}</p>
                          <Badge variant="secondary">{save.reason}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{formatDate(save.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-success">
                          ${calculateFutureValue(save.amount_cents / 100, 10).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">in 10 years</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Future Value Projections</CardTitle>
              <CardDescription>See how your current savings will grow over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[1, 5, 10, 20, 30].map((years) => (
                  <Card key={years} className="border-primary/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{years} Year{years > 1 ? 's' : ''}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-primary">
                        ${calculateFutureValue(stats.totalSaved / 100, years).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        +${(calculateFutureValue(stats.totalSaved / 100, years) - (stats.totalSaved / 100)).toFixed(2)} growth
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  *Projections based on 8% annual compound interest. Actual returns may vary.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Saving Frequency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>This Week</span>
                    <span className="font-medium">{saves.filter(s => {
                      const saveDate = new Date(s.created_at);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return saveDate >= weekAgo;
                    }).length} saves</span>
                  </div>
                  <div className="flex justify-between">
                    <span>This Month</span>
                    <span className="font-medium">{saves.filter(s => {
                      const saveDate = new Date(s.created_at);
                      const now = new Date();
                      return saveDate.getMonth() === now.getMonth() && saveDate.getFullYear() === now.getFullYear();
                    }).length} saves</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average per Week</span>
                    <span className="font-medium">{(saves.length / 4).toFixed(1)} saves</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Saving Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Average Save</span>
                    <span className="font-medium">
                      ${saves.length > 0 ? (stats.totalSaved / saves.length / 100).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Largest Save</span>
                    <span className="font-medium">
                      ${saves.length > 0 ? (Math.max(...saves.map(s => s.amount_cents)) / 100).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Most Common Reason</span>
                    <span className="font-medium">
                      {saves.length > 0 ? (() => {
                        const reasonCounts = saves.reduce((acc, save) => {
                          acc[save.reason] = (acc[save.reason] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);
                        return Object.entries(reasonCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
                      })() : 'None'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MySaves;