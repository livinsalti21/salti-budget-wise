import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Flame, 
  BarChart3, 
  Activity, 
  Target,
  ArrowUp,
  ArrowDown,
  Plus,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TouchTarget } from '@/components/ui/mobile-helpers';
import { useIsMobile } from '@/hooks/use-mobile';

interface Sponsee {
  id: string;
  recipient_user_id: string;
  total_matched_cents: number;
  current_streak: number;
  display_name: string | null;
  saves_count: number;
  match_percentage: number;
  weekly_cap_cents: number;
  growth_this_week: number;
  projected_1yr_cents: number;
}

interface GrowthMetric {
  period: string;
  matched_cents: number;
  projected_value_cents: number;
  growth_percentage: number;
}

interface ActivityEvent {
  id: string;
  type: 'match' | 'save';
  amount_cents: number;
  sponsee_name: string;
  created_at: string;
}

export default function MobileSponsorDashboard() {
  const [sponsees, setSponsees] = useState<Sponsee[]>([]);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetric[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityEvent[]>([]);
  const [stats, setStats] = useState({
    total_sponsored: 0,
    active_sponsees: 0,
    total_matches: 0,
    growth_this_month: 0,
    projected_yearly_impact: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user) {
      loadSponsorData();
    }
  }, [user]);

  const loadSponsorData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get sponsor ID
      const { data: sponsor } = await supabase
        .from('sponsors')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!sponsor) return;

      // Calculate/update growth metrics first
      await supabase.rpc('calculate_sponsor_growth_metrics', {
        target_sponsor_id: sponsor.id
      });

      await Promise.all([
        loadSponseeData(sponsor.id),
        loadGrowthMetrics(sponsor.id),
        loadRecentActivity(sponsor.id),
        loadStats(sponsor.id)
      ]);
    } catch (error) {
      console.error('Error loading sponsor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSponseeData = async (sponsorId: string) => {
    try {
      // Get match rules with detailed sponsor data
      const { data: matchRules } = await supabase
        .from('match_rules')
        .select(`
          id,
          recipient_user_id,
          percent,
          cap_cents_weekly,
          status
        `)
        .eq('sponsor_id', sponsorId)
        .eq('status', 'active');

      if (matchRules) {
        const sponseesData = await Promise.all(
          matchRules.map(async (rule) => {
            // Get profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('id', rule.recipient_user_id)
              .single();

            // Get total matched and recent growth
            const { data: matchEvents } = await supabase
              .from('match_events')
              .select('match_amount_cents, created_at')
              .eq('match_rule_id', rule.id)
              .eq('charge_status', 'succeeded');

            const totalMatched = matchEvents?.reduce((sum, event) => sum + event.match_amount_cents, 0) || 0;
            
            // Calculate growth this week
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const weeklyEvents = matchEvents?.filter(event => 
              new Date(event.created_at) >= weekAgo
            ) || [];
            const weeklyGrowth = weeklyEvents.reduce((sum, event) => sum + event.match_amount_cents, 0);

            // Get current streak
            const { data: streakData } = await supabase
              .from('user_streaks')
              .select('consecutive_days')
              .eq('user_id', rule.recipient_user_id)
              .single();

            // Get saves count
            const { count: savesCount } = await supabase
              .from('save_events')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', rule.recipient_user_id);

            // Calculate 1-year projection with 8% growth
            const projected1yr = Math.round(totalMatched * Math.pow(1.08, 1));

            return {
              id: rule.id,
              recipient_user_id: rule.recipient_user_id,
              total_matched_cents: totalMatched,
              current_streak: streakData?.consecutive_days || 0,
              display_name: profile?.display_name || null,
              saves_count: savesCount || 0,
              match_percentage: rule.percent,
              weekly_cap_cents: rule.cap_cents_weekly,
              growth_this_week: weeklyGrowth,
              projected_1yr_cents: projected1yr
            };
          })
        );

        setSponsees(sponseesData);
      }
    } catch (error) {
      console.error('Error loading sponsee data:', error);
    }
  };

  const loadGrowthMetrics = async (sponsorId: string) => {
    try {
      const { data: growthData } = await supabase
        .from('sponsor_growth_tracking')
        .select('*')
        .eq('sponsor_id', sponsorId)
        .order('period_end', { ascending: false })
        .limit(12); // Last 12 periods

      if (growthData) {
        const metrics: GrowthMetric[] = growthData.map(item => ({
          period: new Date(item.period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          matched_cents: item.total_matched_cents,
          projected_value_cents: Number(item.projected_value_cents),
          growth_percentage: ((Number(item.projected_value_cents) - item.total_matched_cents) / item.total_matched_cents * 100) || 0
        }));
        
        setGrowthMetrics(metrics.reverse()); // Show chronologically
      }
    } catch (error) {
      console.error('Error loading growth metrics:', error);
    }
  };

  const loadRecentActivity = async (sponsorId: string) => {
    try {
      const { data: matchEvents } = await supabase
        .from('match_events')
        .select(`
          id,
          match_amount_cents,
          created_at,
          recipient_user_id
        `)
        .eq('sponsor_id', sponsorId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (matchEvents) {
        const activities: ActivityEvent[] = await Promise.all(
          matchEvents.map(async (event) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('id', event.recipient_user_id)
              .single();

            return {
              id: event.id,
              type: 'match' as const,
              amount_cents: event.match_amount_cents,
              sponsee_name: profile?.display_name || 'Anonymous',
              created_at: event.created_at
            };
          })
        );

        setRecentActivity(activities);
      }
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  const loadStats = async (sponsorId: string) => {
    try {
      const { data: snapshot } = await supabase
        .from('sponsor_metrics_snapshots')
        .select('*')
        .eq('sponsor_id', sponsorId)
        .order('snapshot_date', { ascending: false })
        .limit(1)
        .single();

      if (snapshot) {
        setStats({
          total_sponsored: Number(snapshot.total_matched_cents),
          active_sponsees: snapshot.active_sponsees,
          total_matches: snapshot.total_saves_matched,
          growth_this_month: 0, // Calculate from growth tracking
          projected_yearly_impact: Number(snapshot.compound_growth_projection_1yr)
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSponsorData();
    setRefreshing(false);
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatLargeCurrency = (cents: number) => {
    const dollars = cents / 100;
    if (dollars >= 1000000) return `$${(dollars / 1000000).toFixed(1)}M`;
    if (dollars >= 1000) return `$${(dollars / 1000).toFixed(1)}K`;
    return `$${dollars.toFixed(0)}`;
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-muted/30 rounded-lg"></div>
          <div className="h-12 bg-muted/30 rounded-lg"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-muted/30 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-primary/20 px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Sponsor Hub</h1>
              <p className="text-sm text-muted-foreground">Growing futures together</p>
            </div>
          </div>
          <TouchTarget>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-background/50 backdrop-blur-sm"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </TouchTarget>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white/80 backdrop-blur-sm border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold text-primary">
                    {formatLargeCurrency(stats.total_sponsored)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Matched</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <Users className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-lg font-bold text-accent">{stats.active_sponsees}</p>
                  <p className="text-xs text-muted-foreground">Active Sponsees</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="flex-1">
        <TabsList className="grid w-full grid-cols-4 mx-4 mt-4 bg-muted/50">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="sponsees" className="text-xs">Sponsees</TabsTrigger>
          <TabsTrigger value="growth" className="text-xs">Growth</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="px-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Impact Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-lg border border-success/20">
                  <div className="text-2xl font-bold text-success mb-1">
                    {formatLargeCurrency(stats.projected_yearly_impact)}
                  </div>
                  <div className="text-xs text-muted-foreground">1-Year Growth</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg border border-orange-500/20">
                  <div className="text-2xl font-bold text-orange-600 mb-1">{stats.total_matches}</div>
                  <div className="text-xs text-muted-foreground">Total Saves</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Monthly Goal Progress</span>
                  <span className="text-sm text-muted-foreground">75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {sponsees.length === 0 && (
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 text-primary mx-auto mb-3 opacity-70" />
                <h3 className="font-semibold mb-2">Start Your Impact Journey</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your first sponsee to begin building wealth together
                </p>
                <TouchTarget>
                  <Button className="bg-gradient-to-r from-primary to-accent text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Sponsee
                  </Button>
                </TouchTarget>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Sponsees Tab */}
        <TabsContent value="sponsees" className="px-4 space-y-4">
          {sponsees.map((sponsee) => (
            <Card key={sponsee.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {sponsee.display_name?.charAt(0)?.toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {sponsee.display_name || 'Anonymous'}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {sponsee.match_percentage}% match
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Flame className="h-3 w-3 mr-1 text-orange-500" />
                          {sponsee.current_streak}d
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(sponsee.total_matched_cents)}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Matched</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-accent">
                      {formatCurrency(sponsee.growth_this_week)}
                    </p>
                    <p className="text-xs text-muted-foreground">This Week</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-success">
                      {formatCurrency(sponsee.projected_1yr_cents)}
                    </p>
                    <p className="text-xs text-muted-foreground">1-Yr Project</p>
                  </div>
                </div>

                <TouchTarget className="mt-3">
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </TouchTarget>
              </CardContent>
            </Card>
          ))}

          {sponsees.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No Sponsees Yet</h3>
              <p className="text-muted-foreground mb-4">Start sponsoring someone's savings journey</p>
              <TouchTarget>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Sponsee
                </Button>
              </TouchTarget>
            </div>
          )}
        </TabsContent>

        {/* Growth Tab */}
        <TabsContent value="growth" className="px-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Compound Growth Tracking
              </CardTitle>
              <CardDescription className="text-sm">
                Watch your impact grow over time with compound returns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {growthMetrics.length > 0 ? (
                <div className="space-y-3">
                  {growthMetrics.slice(-6).map((metric, index) => (
                    <div key={metric.period} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-8 rounded-full ${
                          metric.growth_percentage > 0 ? 'bg-success' : 'bg-muted'
                        }`} />
                        <div>
                          <p className="font-medium">{metric.period}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(metric.matched_cents)} → {formatCurrency(metric.projected_value_cents)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center gap-1 ${
                          metric.growth_percentage > 0 ? 'text-success' : 'text-muted-foreground'
                        }`}>
                          {metric.growth_percentage > 0 ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )}
                          <span className="text-sm font-medium">
                            {metric.growth_percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">Growth data will appear as you sponsor saves</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="px-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                      <div className="w-2 h-8 bg-primary rounded-full" />
                      <div className="flex-1">
                        <p className="font-medium">Matched {activity.sponsee_name}'s save</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(activity.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          {formatCurrency(activity.amount_cents)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}