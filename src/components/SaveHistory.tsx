import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, PiggyBank, TrendingUp, Users, Flame, History, Target, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Save {
  id: string;
  amount_cents: number;
  reason: string;
  created_at: string;
  future_value_cents?: number;
  stacklet_id?: string;
}

const SaveHistory = () => {
  const [saves, setSaves] = useState<Save[]>([]);
  const [allSaves, setAllSaves] = useState<Save[]>([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [streak, setStreak] = useState(0);
  const [matches, setMatches] = useState(0);
  const [projectionRate, setProjectionRate] = useState(7);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSaves();
      fetchUserSettings();
      fetchMatches();
    }
  }, [user]);

  const fetchSaves = async () => {
    if (!user) return;

    // Fetch recent saves for display
    const { data: recentSaves, error } = await supabase
      .from('save_events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch all saves for totals
    const { data: allSavesData } = await supabase
      .from('save_events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (recentSaves) {
      setSaves(recentSaves.map(save => ({
        id: save.id,
        amount_cents: save.amount_cents,
        reason: save.reason || save.note || 'Manual Save',
        created_at: save.created_at,
        future_value_cents: save.future_value_cents,
        stacklet_id: save.stacklet_id
      })));
    }

    if (allSavesData) {
      const allSavesFormatted = allSavesData.map(save => ({
        id: save.id,
        amount_cents: save.amount_cents,
        reason: save.reason || save.note || 'Manual Save',
        created_at: save.created_at,
        future_value_cents: save.future_value_cents,
        stacklet_id: save.stacklet_id
      }));
      
      setAllSaves(allSavesFormatted);
      const total = allSavesData.reduce((sum, save) => sum + save.amount_cents, 0);
      setTotalSaved(total);
      setTotalSessions(allSavesData.length);
      
      // Calculate streak based on consecutive days
      const streakDays = calculateStreak(allSavesData);
      setStreak(streakDays);
    }
  };

  const fetchUserSettings = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_settings')
      .select('projection_rate_percent')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setProjectionRate(Number(data.projection_rate_percent));
    }
  };

  const fetchMatches = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('match_events')
      .select('*')
      .eq('recipient_user_id', user.id);

    if (data) {
      setMatches(data.length);
    }
  };

  const calculateStreak = (savesData: any[]) => {
    if (!savesData.length) return 0;

    const today = new Date();
    let streak = 0;
    const savesByDate = new Map();

    // Group saves by date
    savesData.forEach(save => {
      const date = new Date(save.created_at).toDateString();
      savesByDate.set(date, true);
    });

    // Count consecutive days from today backwards
    let currentDate = new Date(today);
    while (savesByDate.has(currentDate.toDateString())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
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

  const calculateFutureValue = (amount: number, years: number = 10) => {
    const principal = amount / 100;
    const annualRate = projectionRate / 100;
    return principal * Math.pow(1 + annualRate, years);
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
            <p className="text-2xl font-bold text-success">${(totalSaved / 100).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">
              10yr @ {projectionRate}%: ${calculateFutureValue(totalSaved).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Save Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{totalSessions}</p>
            <p className="text-xs text-muted-foreground">Total saves completed</p>
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
            <p className="text-2xl font-bold text-warning">{streak}</p>
            <p className="text-xs text-muted-foreground">Consecutive days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Matches Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-accent">{matches}</p>
            <p className="text-xs text-muted-foreground">From sponsors & friends</p>
          </CardContent>
        </Card>
      </div>

      {/* Save History Tabs */}
      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recent">Recent Saves</TabsTrigger>
          <TabsTrigger value="all">All History</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Saves
              </CardTitle>
              <CardDescription>
                Your latest Save & Stack activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {saves.length === 0 ? (
                <div className="text-center py-8">
                  <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No saves yet. Start stacking!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {saves.map((save) => (
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
                          ${calculateFutureValue(save.amount_cents).toFixed(2)}
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

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Complete Save History
              </CardTitle>
              <CardDescription>
                Every save you've ever made ({allSaves.length} total)
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {allSaves.length === 0 ? (
                <div className="text-center py-8">
                  <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No saves yet. Start stacking!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allSaves.map((save) => (
                    <div key={save.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">${(save.amount_cents / 100).toFixed(2)}</p>
                          <Badge variant="outline" className="text-xs">{save.reason}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatDate(save.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-success">
                          ${calculateFutureValue(save.amount_cents).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">10yr @ {projectionRate}%</p>
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
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Future Value Projections
              </CardTitle>
              <CardDescription>
                See how your total savings will grow over time at {projectionRate}% annual return
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 5, 10, 20].map((years) => (
                  <div key={years} className="text-center p-4 bg-secondary/20 rounded-lg">
                    <p className="text-2xl font-bold text-success">
                      ${calculateFutureValue(totalSaved, years).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">In {years} year{years > 1 ? 's' : ''}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      +${(calculateFutureValue(totalSaved, years) - (totalSaved / 100)).toFixed(2)} growth
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SaveHistory;