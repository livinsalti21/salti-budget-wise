import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, Plus, DollarSign, TrendingUp, Users, LogOut, Gift, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SponsorData {
  id: string;
  email: string;
  stripe_customer_id: string | null;
}

interface MatchRule {
  id: string;
  percent: number;
  cap_cents_weekly: number;
  asset_type: string;
  status: string;
  created_at: string;
  recipient_user_id: string;
}

interface MatchEvent {
  id: string;
  original_amount_cents: number;
  match_amount_cents: number;
  charge_status: string;
  created_at: string;
  recipient_user_id: string;
}

interface ProjectionData {
  years: number;
  totalMatched: number;
  projectedValue: number;
  totalImpact: number;
}

const SponsorDashboard = () => {
  const [sponsor, setSponsor] = useState<SponsorData | null>(null);
  const [matchRules, setMatchRules] = useState<MatchRule[]>([]);
  const [matchEvents, setMatchEvents] = useState<MatchEvent[]>([]);
  const [showAddSponsorshipDialog, setShowAddSponsorshipDialog] = useState(false);
  const [newRecipientEmail, setNewRecipientEmail] = useState('');
  const [newMatchPercent, setNewMatchPercent] = useState([25]);
  const [newWeeklyCap, setNewWeeklyCap] = useState('25');
  const [selectedAssetType, setSelectedAssetType] = useState<'CASH' | 'BTC'>('CASH');
  const [isLoading, setIsLoading] = useState(false);
  const [projections, setProjections] = useState<ProjectionData[]>([]);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadSponsorData();
  }, []);

  useEffect(() => {
    if (matchEvents.length > 0) {
      calculateProjections();
    }
  }, [matchEvents, newMatchPercent]);

  const loadSponsorData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/sponsor-auth');
        return;
      }

      // Get sponsor data
      const { data: sponsorData } = await supabase
        .from('sponsors')
        .select('*')
        .eq('email', user.email)
        .single();

      if (sponsorData) {
        setSponsor(sponsorData);

        // Get match rules
        const { data: rulesData } = await supabase
          .from('match_rules')
          .select('*')
          .eq('sponsor_id', sponsorData.id);

        setMatchRules(rulesData || []);

        // Get match events
        const { data: eventsData } = await supabase
          .from('match_events')
          .select('*')
          .eq('sponsor_id', sponsorData.id)
          .order('created_at', { ascending: false });

        setMatchEvents(eventsData || []);
      }
    } catch (error) {
      console.error('Error loading sponsor data:', error);
      toast({
        title: "Error",
        description: "Failed to load sponsor data",
        variant: "destructive"
      });
    }
  };

  const calculateProjections = () => {
    const timeframes = [1, 5, 10, 20, 30, 40];
    const annualReturn = 0.08; // 8% annual return assumption
    
    // Calculate total matched amount per year based on current activity
    const totalMatchedCents = matchEvents.reduce((sum, event) => sum + event.match_amount_cents, 0);
    const totalMatchedDollars = totalMatchedCents / 100;
    
    // Estimate annual matching based on recent activity
    const recentEvents = matchEvents.filter(event => {
      const eventDate = new Date(event.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return eventDate >= thirtyDaysAgo;
    });
    
    const recentMatchTotal = recentEvents.reduce((sum, event) => sum + event.match_amount_cents, 0) / 100;
    const estimatedAnnualMatching = recentMatchTotal * 12; // Extrapolate monthly to yearly
    
    const projectionData = timeframes.map(years => {
      const totalMatched = estimatedAnnualMatching * years;
      const futureValue = totalMatched * Math.pow(1 + annualReturn, years);
      const totalImpact = futureValue - totalMatched;
      
      return {
        years,
        totalMatched,
        projectedValue: futureValue,
        totalImpact
      };
    });
    
    setProjections(projectionData);
  };

  const handleAddSponsorship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsor) return;

    setIsLoading(true);
    try {
      // In a real app, you'd look up the user by email
      // For now, we'll create a mock recipient user ID
      const mockRecipientId = 'mock-user-id-' + newRecipientEmail.replace('@', '-').replace('.', '-');

      const { error } = await supabase
        .from('match_rules')
        .insert({
          sponsor_id: sponsor.id,
          recipient_user_id: mockRecipientId,
          percent: newMatchPercent[0],
          cap_cents_weekly: parseInt(newWeeklyCap) * 100,
          asset_type: selectedAssetType,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Sponsorship Added!",
        description: `You're now matching ${newMatchPercent[0]}% of ${newRecipientEmail}'s saves up to $${newWeeklyCap}/week`
      });

      setShowAddSponsorshipDialog(false);
      setNewRecipientEmail('');
      setNewMatchPercent([25]);
      setNewWeeklyCap('25');
      loadSponsorData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add sponsorship",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/sponsor-auth');
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDollar = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 md:px-6 py-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
              <span className="text-lg">✌🏽</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Sponsor Dashboard
              </h1>
              <p className="text-muted-foreground">{sponsor?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={showAddSponsorshipDialog} onOpenChange={setShowAddSponsorshipDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sponsorship
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Sponsorship</DialogTitle>
                  <DialogDescription>
                    Start matching someone's savings to help them build wealth
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddSponsorship} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipientEmail">Recipient Email</Label>
                    <Input
                      id="recipientEmail"
                      type="email"
                      placeholder="their@email.com"
                      value={newRecipientEmail}
                      onChange={(e) => setNewRecipientEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Match Percentage: {newMatchPercent[0]}%</Label>
                    <Slider
                      value={newMatchPercent}
                      onValueChange={setNewMatchPercent}
                      max={100}
                      min={1}
                      step={1}
                    />
                    <p className="text-sm text-muted-foreground">
                      You'll match {newMatchPercent[0]}% of every dollar they save
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weeklyCap">Weekly Cap ($)</Label>
                    <Input
                      id="weeklyCap"
                      type="number"
                      placeholder="25"
                      value={newWeeklyCap}
                      onChange={(e) => setNewWeeklyCap(e.target.value)}
                      min="1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Asset Type</Label>
                    <Select value={selectedAssetType} onValueChange={(value: 'CASH' | 'BTC') => setSelectedAssetType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="BTC">Bitcoin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Adding...' : 'Add Sponsorship'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sponsorships</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{matchRules.filter(rule => rule.status === 'active').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Matched</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(matchEvents.reduce((sum, event) => sum + event.match_amount_cents, 0))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Matches</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{matchEvents.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Impact Projections */}
        {projections.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Your Long-Term Impact
              </CardTitle>
              <CardDescription>
                See how much wealth you're helping create over time (assuming 8% annual returns)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {projections.map(({ years, totalMatched, projectedValue, totalImpact }) => (
                  <div key={years} className="text-center p-4 border rounded-lg">
                    <div className="text-lg font-bold text-primary">{years} Year{years > 1 ? 's' : ''}</div>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="text-muted-foreground">You match:</span>
                        <div className="font-medium">{formatDollar(totalMatched)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Grows to:</span>
                        <div className="font-medium text-green-600">{formatDollar(projectedValue)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Your impact:</span>
                        <div className="font-bold text-primary">{formatDollar(totalImpact)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Sponsorships */}
        <Card>
          <CardHeader>
            <CardTitle>Your Sponsorships</CardTitle>
            <CardDescription>People you're helping save money</CardDescription>
          </CardHeader>
          <CardContent>
            {matchRules.length > 0 ? (
              <div className="space-y-4">
                {matchRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">User {rule.recipient_user_id.slice(-8)}</p>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{rule.percent}% match</Badge>
                        <Badge variant="outline">Cap: ${rule.cap_cents_weekly / 100}/week</Badge>
                        <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>
                          {rule.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Asset Type</p>
                      <p className="font-medium">{rule.asset_type}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Sponsorships Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start helping someone save money today
                </p>
                <Button onClick={() => setShowAddSponsorshipDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Sponsorship
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Match Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Match Activity</CardTitle>
            <CardDescription>Your recent matching contributions</CardDescription>
          </CardHeader>
          <CardContent>
            {matchEvents.length > 0 ? (
              <div className="space-y-4">
                {matchEvents.slice(0, 10).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">
                        Matched {formatCurrency(event.match_amount_cents)} on {formatCurrency(event.original_amount_cents)} save
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={event.charge_status === 'succeeded' ? 'default' : 'secondary'}>
                      {event.charge_status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Activity Yet</h3>
                <p className="text-muted-foreground">
                  Match activity will appear here once your sponsees start saving
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SponsorDashboard;