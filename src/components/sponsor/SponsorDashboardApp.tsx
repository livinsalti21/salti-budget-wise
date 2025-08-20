import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, Users, DollarSign, TrendingUp, Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Sponsee {
  id: string;
  recipient_user_id: string;
  total_matched_cents: number;
  current_streak: number;
  display_name: string | null;
  saves_count: number;
}

export default function SponsorDashboardApp() {
  const [sponsees, setSponsees] = useState<Sponsee[]>([]);
  const [stats, setStats] = useState({
    total_sponsored: 0,
    active_sponsees: 0,
    total_matches: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadSponsorData();
    }
  }, [user]);

  const loadSponsorData = async () => {
    if (!user) return;

    try {
      // Get sponsor ID from sponsors table
      const { data: sponsor } = await supabase
        .from('sponsors')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!sponsor) return;

      // Get match rules and events for this sponsor
      const { data: matchRules } = await supabase
        .from('match_rules')
        .select(`
          id,
          recipient_user_id
        `)
        .eq('sponsor_id', sponsor.id)
        .eq('status', 'active');

      if (matchRules) {
        // Get match events and streak data for each sponsee
        const sponseesData = await Promise.all(
          matchRules.map(async (rule) => {
            // Get profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('id', rule.recipient_user_id)
              .single();

            // Get total matched amount
            const { data: matchEvents } = await supabase
              .from('match_events')
              .select('match_amount_cents')
              .eq('match_rule_id', rule.id)
              .eq('charge_status', 'succeeded');

            const totalMatched = matchEvents?.reduce((sum, event) => sum + event.match_amount_cents, 0) || 0;

            // Get current streak
            const { data: streakData } = await supabase
              .from('user_streaks')
              .select('consecutive_days')
              .eq('user_id', rule.recipient_user_id)
              .single();

            // Get saves count
            const { count: savesCount } = await supabase
              .from('saves')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', rule.recipient_user_id);

            return {
              id: rule.id,
              recipient_user_id: rule.recipient_user_id,
              total_matched_cents: totalMatched,
              current_streak: streakData?.consecutive_days || 0,
              display_name: profile?.display_name || null,
              saves_count: savesCount || 0
            };
          })
        );

        setSponsees(sponseesData);

        // Calculate overall stats
        const totalSponsored = sponseesData.reduce((sum, s) => sum + s.total_matched_cents, 0);
        const activeSponsees = sponseesData.filter(s => s.current_streak > 0).length;
        const totalMatches = sponseesData.reduce((sum, s) => sum + s.saves_count, 0);

        setStats({
          total_sponsored: totalSponsored,
          active_sponsees: activeSponsees,
          total_matches: totalMatches
        });
      }
    } catch (error) {
      console.error('Error loading sponsor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Card className="animate-pulse">
          <CardContent className="h-32" />
        </Card>
        <Card className="animate-pulse">
          <CardContent className="h-40" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">💝 Sponsor Dashboard</h1>
        <p className="text-muted-foreground">Your impact on the Save n Stack community</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.total_sponsored)}</p>
                <p className="text-sm text-muted-foreground">Total Sponsored</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-full">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active_sponsees}</p>
                <p className="text-sm text-muted-foreground">Active Sponsees</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-full">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total_matches}</p>
                <p className="text-sm text-muted-foreground">Total Saves Matched</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sponsees List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Your Sponsees
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sponsees.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No sponsees yet</p>
              <Button variant="outline">
                Find Sponsees
              </Button>
            </div>
          ) : (
            sponsees.map((sponsee) => (
              <div
                key={sponsee.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {sponsee.display_name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {sponsee.display_name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {sponsee.saves_count} saves • {formatCurrency(sponsee.total_matched_cents)} matched
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-orange-50 text-orange-700">
                    <Flame className="h-3 w-3 mr-1" />
                    {sponsee.current_streak} day{sponsee.current_streak !== 1 ? 's' : ''}
                  </Badge>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}