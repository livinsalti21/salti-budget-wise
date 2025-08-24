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
import { Heart, Plus, DollarSign, TrendingUp, Users, LogOut, Gift, Calculator, User, Sparkles, Target, Star, Activity, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MobileSafeArea } from '@/components/ui/mobile-safe-area';
import { TouchTarget } from '@/components/ui/mobile-helpers';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [dataLoading, setDataLoading] = useState(true);
  const [projections, setProjections] = useState<ProjectionData[]>([]);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    loadSponsorData();
  }, []);

  useEffect(() => {
    if (matchEvents.length > 0) {
      calculateProjections();
    }
  }, [matchEvents, newMatchPercent]);

  const loadSponsorData = async () => {
    setDataLoading(true);
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
      } else {
        toast({
          title: "Welcome!",
          description: "Set up your first sponsorship to get started",
        });
      }
    } catch (error) {
      console.error('Error loading sponsor data:', error);
      toast({
        title: "Error",
        description: "Failed to load sponsor data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDataLoading(false);
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

  if (dataLoading) {
    return (
      <MobileSafeArea className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container mx-auto px-4 py-6 space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-muted/30 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-muted/30 rounded-lg"></div>
              ))}
            </div>
            <div className="h-40 bg-muted/30 rounded-lg"></div>
          </div>
        </div>
      </MobileSafeArea>
    );
  }

  return (
    <MobileSafeArea className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Sponsor Dashboard
                </h1>
                <p className="text-muted-foreground flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {sponsor?.email}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={showAddSponsorshipDialog} onOpenChange={setShowAddSponsorshipDialog}>
                <DialogTrigger asChild>
                  <TouchTarget>
                    <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg">
                      <Plus className="h-4 w-4 mr-2" />
                      {isMobile ? "Add" : "Add Sponsorship"}
                    </Button>
                  </TouchTarget>
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
              <TouchTarget>
                <Button variant="outline" onClick={handleSignOut} className="border-2">
                  <LogOut className="h-4 w-4 mr-2" />
                  {isMobile ? "Exit" : "Sign Out"}
                </Button>
              </TouchTarget>
            </div>
          </div>
          
          {/* Welcome Message */}
          {matchRules.length === 0 && (
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/20 rounded-full">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">Welcome to Your Sponsor Dashboard!</h3>
                    <p className="text-muted-foreground mb-4">
                      Start making a difference by sponsoring someone's savings journey. Every dollar you match helps build their financial future.
                    </p>
                    <TouchTarget>
                      <Button 
                        onClick={() => setShowAddSponsorshipDialog(true)}
                        className="bg-gradient-to-r from-primary to-accent text-white"
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Create Your First Sponsorship
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </TouchTarget>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/20 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {matchRules.filter(rule => rule.status === 'active').length}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Active Sponsorships</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/20 rounded-full">
                  <DollarSign className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent">
                    {formatCurrency(matchEvents.reduce((sum, event) => sum + event.match_amount_cents, 0))}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Total Matched</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20 hover:shadow-lg transition-all duration-300 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/20 rounded-full">
                  <Activity className="h-6 w-6 text-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-success">{matchEvents.length}</div>
                  <p className="text-sm font-medium text-muted-foreground">Total Matches</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Impact Projections */}
        {projections.length > 0 && (
          <Card className="bg-gradient-to-br from-background via-secondary/10 to-background border-2 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Calculator className="h-6 w-6 text-primary" />
                Your Long-Term Impact
              </CardTitle>
              <CardDescription className="text-base">
                See how much wealth you're helping create over time (assuming 8% annual returns)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {projections.map(({ years, totalMatched, projectedValue, totalImpact }) => (
                  <Card key={years} className="text-center bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                    <CardContent className="p-4">
                      <div className="text-lg font-bold text-primary mb-3">
                        {years} Year{years > 1 ? 's' : ''}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground">You match</div>
                          <div className="font-semibold">{formatDollar(totalMatched)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Grows to</div>
                          <div className="font-semibold text-success">{formatDollar(projectedValue)}</div>
                        </div>
                        <div className="pt-1 border-t">
                          <div className="text-xs text-muted-foreground">Your impact</div>
                          <div className="font-bold text-primary">{formatDollar(totalImpact)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Sponsorships */}
        <Card className="border-2 border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Heart className="h-6 w-6 text-red-500" />
              Your Sponsorships
            </CardTitle>
            <CardDescription className="text-base">
              People you're helping build their financial future
            </CardDescription>
          </CardHeader>
          <CardContent>
            {matchRules.length > 0 ? (
              <div className="space-y-4">
                {matchRules.map((rule) => (
                  <Card key={rule.id} className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <p className="font-semibold">User {rule.recipient_user_id.slice(-8)}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-primary/20 text-primary border-primary/30">
                              {rule.percent}% match
                            </Badge>
                            <Badge variant="outline" className="border-accent/50">
                              Cap: ${rule.cap_cents_weekly / 100}/week
                            </Badge>
                            <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>
                              <Star className="h-3 w-3 mr-1" />
                              {rule.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Asset Type</p>
                          <p className="font-semibold text-lg">{rule.asset_type}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Sponsorships Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Start making a real difference in someone's financial journey. Every sponsorship helps build wealth and creates lasting impact.
                </p>
                <TouchTarget>
                  <Button 
                    onClick={() => setShowAddSponsorshipDialog(true)}
                    className="bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                    size="lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Sponsorship
                  </Button>
                </TouchTarget>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Match Activity */}
        <Card className="border-2 border-accent/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Activity className="h-6 w-6 text-accent" />
              Recent Match Activity
            </CardTitle>
            <CardDescription className="text-base">
              Your recent matching contributions making a difference
            </CardDescription>
          </CardHeader>
          <CardContent>
            {matchEvents.length > 0 ? (
              <div className="space-y-3">
                {matchEvents.slice(0, 8).map((event) => (
                  <Card key={event.id} className="bg-gradient-to-r from-accent/5 to-success/5 border-accent/20">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-semibold">
                            Matched {formatCurrency(event.match_amount_cents)} on {formatCurrency(event.original_amount_cents)} save
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Gift className="h-3 w-3" />
                            {new Date(event.created_at).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <Badge 
                          variant={event.charge_status === 'succeeded' ? 'default' : 'secondary'}
                          className={event.charge_status === 'succeeded' ? 'bg-success/20 text-success border-success/30' : ''}
                        >
                          {event.charge_status === 'succeeded' ? '✓ ' : ''}
                          {event.charge_status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {matchEvents.length > 8 && (
                  <div className="text-center pt-4">
                    <p className="text-sm text-muted-foreground">
                      And {matchEvents.length - 8} more matches...
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Activity Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Match activity will appear here once your sponsored users start saving. Every save they make is a step toward their financial goals!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MobileSafeArea>
  );
};

export default SponsorDashboard;