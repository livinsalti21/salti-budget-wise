import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, PiggyBank, TrendingUp, Users, Flame, History, Target, Calendar, Search, Filter, Sparkles, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  const [filteredSaves, setFilteredSaves] = useState<Save[]>([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [streak, setStreak] = useState(0);
  const [matches, setMatches] = useState(0);
  const [projectionRate, setProjectionRate] = useState(7);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [insights, setInsights] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSaves();
      fetchUserSettings();
      fetchMatches();
      setupRealtimeSubscription();
    }
  }, [user]);

  useEffect(() => {
    filterSaves();
  }, [allSaves, searchTerm, filterPeriod, filterCategory]);

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel('save-events-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'save_events',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newSave = {
            id: payload.new.id,
            amount_cents: payload.new.amount_cents,
            reason: payload.new.reason || payload.new.note || 'Manual Save',
            created_at: payload.new.created_at,
            future_value_cents: payload.new.future_value_cents,
            stacklet_id: payload.new.stacklet_id
          };
          
          setSaves(prev => [newSave, ...prev.slice(0, 9)]);
          setAllSaves(prev => [newSave, ...prev]);
          setTotalSaved(prev => prev + payload.new.amount_cents);
          setTotalSessions(prev => prev + 1);
          
          toast.success(`New save added: $${(payload.new.amount_cents / 100).toFixed(2)}! 🎉`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

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
      
      // Generate smart insights
      generateInsights(allSavesFormatted);
    }
  };

  const filterSaves = () => {
    let filtered = [...allSaves];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(save => 
        save.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Period filter
    if (filterPeriod !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filterPeriod) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(save => new Date(save.created_at) >= filterDate);
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(save => save.reason.toLowerCase().includes(filterCategory.toLowerCase()));
    }

    setFilteredSaves(filtered);
  };

  const generateInsights = (savesData: Save[]) => {
    const insights: string[] = [];
    
    if (savesData.length === 0) return;

    // Most common save reason
    const reasonCounts = savesData.reduce((acc, save) => {
      acc[save.reason] = (acc[save.reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topReason = Object.entries(reasonCounts).sort(([,a], [,b]) => b - a)[0];
    if (topReason) {
      insights.push(`Your top saving trigger: ${topReason[0]} (${topReason[1]} times)`);
    }

    // Average save amount
    const avgAmount = savesData.reduce((sum, save) => sum + save.amount_cents, 0) / savesData.length;
    insights.push(`Your average save: $${(avgAmount / 100).toFixed(2)}`);

    // Best saving day analysis
    const dayOfWeekCounts = savesData.reduce((acc, save) => {
      const dayOfWeek = new Date(save.created_at).getDay();
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
      acc[dayName] = (acc[dayName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const bestDay = Object.entries(dayOfWeekCounts).sort(([,a], [,b]) => b - a)[0];
    if (bestDay) {
      insights.push(`You save most on ${bestDay[0]}s`);
    }

    // Recent momentum
    const recentSaves = savesData.filter(save => {
      const saveDate = new Date(save.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return saveDate >= weekAgo;
    });
    
    if (recentSaves.length > 0) {
      insights.push(`${recentSaves.length} saves this week - great momentum! 🔥`);
    }

    setInsights(insights);
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
      {/* Smart Insights */}
      {insights.length > 0 && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Smart Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-center gap-2 animate-fade-in">
                  <Award className="h-3 w-3 text-primary flex-shrink-0" />
                  <p className="text-sm text-foreground">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Interactive Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search saves..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="coffee">Coffee</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
                <SelectItem value="manual">Manual Save</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(searchTerm || filterPeriod !== 'all' || filterCategory !== 'all') && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <span>Showing {filteredSaves.length} of {allSaves.length} saves</span>
              {filteredSaves.length > 0 && (
                <span className="text-success">
                  (${(filteredSaves.reduce((sum, save) => sum + save.amount_cents, 0) / 100).toFixed(2)} total)
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save History Tabs */}
      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recent">Recent Saves</TabsTrigger>
          <TabsTrigger value="filtered">Filtered Results ({filteredSaves.length})</TabsTrigger>
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
                  {saves.map((save, index) => (
                    <div 
                      key={save.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/30 transition-all duration-200 hover:shadow-sm animate-fade-in hover-scale"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">${(save.amount_cents / 100).toFixed(2)}</p>
                          <Badge variant="secondary" className="hover:bg-primary/10 transition-colors">
                            {save.reason}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{formatDate(save.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-success">
                          ${calculateFutureValue(save.amount_cents).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">in 10 years</p>
                        <div className="mt-1">
                          <Progress 
                            value={(save.amount_cents / Math.max(...saves.map(s => s.amount_cents))) * 100} 
                            className="h-1 w-16"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filtered" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Filtered Save History
              </CardTitle>
              <CardDescription>
                {filteredSaves.length} saves matching your filters
                {filteredSaves.length > 0 && (
                  <span className="ml-2 text-success">
                    (${(filteredSaves.reduce((sum, save) => sum + save.amount_cents, 0) / 100).toFixed(2)} total)
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {filteredSaves.length === 0 ? (
                <div className="text-center py-8">
                  <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm || filterPeriod !== 'all' || filterCategory !== 'all' 
                      ? 'No saves match your filters. Try adjusting them.'
                      : 'No saves yet. Start stacking!'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSaves.map((save, index) => (
                    <div 
                      key={save.id} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:border-primary/30 transition-all duration-200 hover:shadow-sm animate-fade-in hover-scale"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">${(save.amount_cents / 100).toFixed(2)}</p>
                          <Badge variant="outline" className="text-xs hover:bg-primary/10 transition-colors">
                            {save.reason}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatDate(save.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-success">
                          ${calculateFutureValue(save.amount_cents).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">10yr @ {projectionRate}%</p>
                        <div className="mt-1">
                          <Progress 
                            value={(save.amount_cents / Math.max(...filteredSaves.map(s => s.amount_cents), 1)) * 100} 
                            className="h-1 w-16"
                          />
                        </div>
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