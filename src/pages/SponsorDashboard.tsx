import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Users, TrendingUp, Plus, Calendar, Mail, LogOut, Heart, Gift } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
// import MobileSponsorDashboard from "@/components/sponsor/MobileSponsorDashboard";
import { SponsorOnboardingFlow } from "@/components/sponsor/SponsorOnboardingFlow";
import { SponsorImpactStory } from "@/components/sponsor/SponsorImpactStory";
import { SponsorGameification } from "@/components/sponsor/SponsorGameification";

interface SponsorData {
  id: string;
  email: string;
  name?: string;
  stripe_customer_id?: string;
  created_at: string;
}

interface MatchRule {
  id: string;
  sponsor_id: string;
  recipient_user_id: string;
  percent: number;
  cap_cents_weekly: number;
  asset_type: string;
  status: string;
  created_at: string;
}

interface MatchEvent {
  id: string;
  sponsor_id: string;
  recipient_user_id: string;
  original_amount_cents: number;
  match_amount_cents: number;
  charge_status: string;
  created_at: string;
  save_event_id: string;
}

interface ProjectionData {
  years: number;
  totalMatched: number;
  projectedValue: number;
  totalImpact: number;
}

export default function SponsorDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [sponsorData, setSponsorData] = useState<SponsorData | null>(null);
  const [matchRules, setMatchRules] = useState<MatchRule[]>([]);
  const [matchEvents, setMatchEvents] = useState<MatchEvent[]>([]);
  const [projectionData, setProjectionData] = useState<ProjectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [newSponsorship, setNewSponsorship] = useState({
    recipientEmail: "",
    matchPercentage: 50,
    weeklyCapCents: 2500,
    assetType: "CASH"
  });

  useEffect(() => {
    if (user) {
      loadSponsorData();
      checkOnboardingStatus();
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user?.email) return;
    
    try {
      const { data: sponsor } = await supabase
        .from('sponsors')
        .select('*')
        .eq('email', user.email)
        .single();
      
      if (!sponsor) {
        setShowOnboarding(true);
      } else {
        setHasCompletedOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const loadSponsorData = async () => {
    try {
      setLoading(true);
      
      if (!user?.email) {
        console.error('No user email found');
        return;
      }

      // Load sponsor data
      const { data: sponsor, error: sponsorError } = await supabase
        .from('sponsors')
        .select('*')
        .eq('email', user.email)
        .single();

      if (sponsorError) {
        console.error('Error loading sponsor:', sponsorError);
        return;
      }

      setSponsorData(sponsor);

      // Load match rules
      const { data: rules, error: rulesError } = await supabase
        .from('match_rules')
        .select('*')
        .eq('sponsor_id', sponsor.id);

      if (rulesError) {
        console.error('Error loading match rules:', rulesError);
        return;
      }

      setMatchRules(rules || []);

      // Load match events
      const { data: events, error: eventsError } = await supabase
        .from('match_events')
        .select('*')
        .eq('sponsor_id', sponsor.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (eventsError) {
        console.error('Error loading match events:', eventsError);
        return;
      }

      setMatchEvents(events || []);

      // Calculate projections
      if (events && events.length > 0) {
        const totalMatched = events.reduce((sum, event) => sum + event.match_amount_cents, 0);
        const monthlyAverage = totalMatched / Math.max(1, Math.ceil((Date.now() - new Date(events[events.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)));
        
        const projections = [1, 2, 3, 5, 10].map(years => ({
          years,
          totalMatched: monthlyAverage * 12 * years,
          projectedValue: monthlyAverage * 12 * years * Math.pow(1.08, years), // 8% annual return
          totalImpact: monthlyAverage * 12 * years * 2 // Conservative 2x impact multiplier
        }));
        
        setProjectionData(projections);
      }

    } catch (error: any) {
      console.error('Error loading sponsor data:', error);
      toast({
        title: "Error",
        description: "Failed to load sponsor data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSponsorship = async () => {
    if (!sponsorData) return;

    try {
      const { error } = await supabase
        .from('match_rules')
        .insert({
          sponsor_id: sponsorData.id,
          recipient_user_id: null, // Will be populated when recipient accepts
          percent: newSponsorship.matchPercentage,
          cap_cents_weekly: newSponsorship.weeklyCapCents,
          asset_type: newSponsorship.assetType,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Sponsorship Created",
        description: "Your sponsorship has been created successfully.",
      });

      setShowAddDialog(false);
      setNewSponsorship({
        recipientEmail: "",
        matchPercentage: 50,
        weeklyCapCents: 2500,
        assetType: "CASH"
      });
      
      loadSponsorData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleOnboardingComplete = async (onboardingData: any) => {
    if (!user?.email) return;

    try {
      // Update sponsor record with onboarding completion
      await supabase
        .from('sponsors')
        .update({ 
          email: user.email
        })
        .eq('email', user.email);

      setShowOnboarding(false);
      setHasCompletedOnboarding(true);
      loadSponsorData();

      toast({
        title: "Welcome to Sponsoring! 🎉",
        description: "Your sponsor journey begins now. Let's find you a sponsee!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/sponsor-auth');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const formatDollar = (cents: number) => {
    return `$${Math.round(cents / 100).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your sponsor dashboard...</p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-background">
        <SponsorOnboardingFlow 
          onComplete={handleOnboardingComplete}
          onSkip={() => {
            setShowOnboarding(false);
            setHasCompletedOnboarding(true);
          }}
        />
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Mobile Dashboard</h3>
            <p className="text-muted-foreground">
              Mobile sponsor dashboard coming soon!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Sponsor Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.email}
            </p>
          </div>
          <div className="flex gap-3">
            {hasCompletedOnboarding && (
              <Button variant="outline" onClick={() => setShowOnboarding(true)}>
                <Heart className="w-4 h-4 mr-2" />
                Replay Tutorial
              </Button>
            )}
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Add Sponsorship Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Sponsorship</DialogTitle>
              <DialogDescription>
                Set up matching rules for a new sponsee
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Recipient Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newSponsorship.recipientEmail}
                  onChange={(e) => setNewSponsorship(prev => ({ ...prev, recipientEmail: e.target.value }))}
                  placeholder="sponsee@example.com"
                />
              </div>
              <div>
                <Label htmlFor="percentage">Match Percentage</Label>
                <Select 
                  value={newSponsorship.matchPercentage.toString()}
                  onValueChange={(value) => setNewSponsorship(prev => ({ ...prev, matchPercentage: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25%</SelectItem>
                    <SelectItem value="50">50%</SelectItem>
                    <SelectItem value="75">75%</SelectItem>
                    <SelectItem value="100">100%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cap">Weekly Cap</Label>
                <Select 
                  value={newSponsorship.weeklyCapCents.toString()}
                  onValueChange={(value) => setNewSponsorship(prev => ({ ...prev, weeklyCapCents: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1000">$10</SelectItem>
                    <SelectItem value="2500">$25</SelectItem>
                    <SelectItem value="5000">$50</SelectItem>
                    <SelectItem value="10000">$100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="asset">Asset Type</Label>
                <Select 
                  value={newSponsorship.assetType}
                  onValueChange={(value) => setNewSponsorship(prev => ({ ...prev, assetType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="BTC">Bitcoin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddSponsorship} className="w-full">
                Create Sponsorship
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {matchRules.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">
                Ready to Make an Impact?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start your sponsorship journey and help someone build their financial future. 
                Your support can transform lives through the power of matched savings.
              </p>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button size="lg" className="text-lg px-8">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Sponsorship
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Enhanced Stats with Gamification */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Sponsorships</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{matchRules.length}</div>
                      <p className="text-xs text-muted-foreground">
                        People you're helping
                      </p>
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
                      <p className="text-xs text-muted-foreground">
                        Your contribution impact
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{matchEvents.length}</div>
                      <p className="text-xs text-muted-foreground">
                        Savings you've matched
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Gamification Panel */}
              <div className="lg:col-span-1">
                <SponsorGameification 
                  sponsorStats={{
                    totalMatched: matchEvents.reduce((sum, event) => sum + event.match_amount_cents, 0),
                    activeSponsorees: matchRules.length,
                    totalSavesMatched: matchEvents.length,
                    daysSinceFirstSponsorship: sponsorData ? Math.floor((Date.now() - new Date(sponsorData.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0,
                    longestSponsorshipDays: 30, // TODO: Calculate from data
                    averageMatchAmount: matchEvents.length > 0 ? matchEvents.reduce((sum, event) => sum + event.match_amount_cents, 0) / matchEvents.length : 0
                  }}
                />
              </div>
            </div>

            {/* Impact Projections */}
            {projectionData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Your Long-term Impact Projection
                  </CardTitle>
                  <CardDescription>
                    See how your sponsorship grows wealth over time through compound interest
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {projectionData.map((projection) => (
                      <div key={projection.years} className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {formatDollar(projection.projectedValue)}
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {projection.years} Year{projection.years > 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-green-600">
                          {formatDollar(projection.totalMatched)} matched
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Projections assume 8% annual growth and continued matching patterns
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Your Sponsorships */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Sponsorships</CardTitle>
                  <CardDescription>
                    Manage your active sponsorship relationships
                  </CardDescription>
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Sponsorship
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {matchRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>
                            {rule.status}
                          </Badge>
                          <span className="font-medium">
                            {rule.percent}% matching up to {formatCurrency(rule.cap_cents_weekly)}/week
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Asset: {rule.asset_type} • Created: {new Date(rule.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          Recipient ID: {rule.recipient_user_id || 'Pending'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Match Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Match Activity</CardTitle>
                <CardDescription>
                  Your latest sponsorship matches and their impact
                </CardDescription>
              </CardHeader>
              <CardContent>
                {matchEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No matches yet. Once your sponsees start saving, you'll see the activity here!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {matchEvents.slice(0, 10).map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">
                              Matched {formatCurrency(event.match_amount_cents)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Original save: {formatCurrency(event.original_amount_cents)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={event.charge_status === 'succeeded' ? 'default' : 'secondary'}>
                            {event.charge_status}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            {new Date(event.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}