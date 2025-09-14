import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Heart, Plus, DollarSign, Gift, Users, HelpCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FeatureTooltip } from '@/components/ui/FeatureTooltip';
import { MatchHero } from '@/components/match/MatchHero';
import { MatchOnboarding } from '@/components/match/MatchOnboarding';

interface MatchRule {
  id: string;
  percent: number;
  cap_cents_weekly: number;
  asset_type: 'CASH' | 'BTC';
  status: 'active' | 'paused';
  sponsors: {
    email: string;
    stripe_customer_id: string | null;
  };
}

interface MatchEvent {
  id: string;
  original_amount_cents: number;
  match_amount_cents: number;
  charge_status: string;
  created_at: string;
  sponsors: {
    email: string;
  };
}

const MobileMatchSection = () => {
  const [matchRules, setMatchRules] = useState<MatchRule[]>([]);
  const [recentMatches, setRecentMatches] = useState<MatchEvent[]>([]);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const loadMatchData = async () => {
    if (!user) return;

    // Load match rules
    const { data: rulesData, error: rulesError } = await supabase
      .from('match_rules')
      .select(`*, sponsors (email, stripe_customer_id)`)
      .eq('recipient_user_id', user.id);

    if (!rulesError) {
      setMatchRules((rulesData || []) as MatchRule[]);
    }

    // Load recent match events (limit to 2 for mobile)
    const { data: eventsData, error: eventsError } = await supabase
      .from('match_events')
      .select(`*, sponsors (email)`)
      .eq('recipient_user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(2);

    if (!eventsError) {
      setRecentMatches((eventsData || []) as MatchEvent[]);
    }
  };

  useEffect(() => {
    loadMatchData();
  }, [user]);

  useEffect(() => {
    // Check if user has seen match onboarding or has existing rules
    if (matchRules.length === 0) {
      const hasSeenOnboarding = localStorage.getItem('match-onboarding-seen');
      if (!hasSeenOnboarding) {
        setIsFirstTime(true);
      }
    } else {
      setIsFirstTime(false);
    }
  }, [matchRules]);

  const handleInviteSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inviteEmail.trim()) return;
    
    setIsLoading(true);
    
    // Create invite with exciting messaging
    toast({
      title: "Magic invitation sent! ✨📧",
      description: `${inviteEmail} will receive an invite to double your savings impact!`,
    });
    
    setInviteEmail('');
    setShowInviteDialog(false);
    setIsLoading(false);
    
    // Mark onboarding as seen
    localStorage.setItem('match-onboarding-seen', 'true');
    setIsFirstTime(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setShowInviteDialog(true);
    localStorage.setItem('match-onboarding-seen', 'true');
  };

  const handleInviteClick = () => {
    if (isFirstTime && matchRules.length === 0) {
      setShowOnboarding(true);
    } else {
      setShowInviteDialog(true);
    }
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <Badge variant="default" className="bg-success text-xs">✅ Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="text-xs">⏳ Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="text-xs">❌ Failed</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  return (
    <>
      {/* Onboarding Dialog */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="w-[95vw] max-w-md p-0">
          <MatchOnboarding onComplete={handleOnboardingComplete} />
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="w-[90vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Invite Your Sponsor
            </DialogTitle>
            <DialogDescription>
              Send them a magical invitation to double your savings impact! ✨
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInviteSponsor} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="mom@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>
            <div className="bg-primary/5 rounded-lg p-3 text-center">
              <p className="text-sm text-muted-foreground">
                💝 They'll get a beautiful invite explaining how their support helps you reach goals 2x faster!
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90" disabled={isLoading}>
                {isLoading ? 'Sending Magic...' : '✨ Send Invitation'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      {matchRules.length === 0 && isFirstTime ? (
        <MatchHero onInviteClick={handleInviteClick} />
      ) : (
        <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Match
                <FeatureTooltip
                  title="Match-a-Save"
                  description="Invite sponsors to match your savings! They'll match a percentage of each save you make, helping you grow your money faster."
                >
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </FeatureTooltip>
              </div>
              <Button size="sm" className="h-8" onClick={handleInviteClick}>
                <Plus className="h-3 w-3 mr-1" />
                Invite
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {matchRules.length > 0 ? (
              <>
                {/* Active Sponsors Summary */}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">{matchRules.length} active sponsor{matchRules.length !== 1 ? 's' : ''}</span>
                </div>
                
                {/* Sponsors List - Compact */}
                <div className="space-y-2">
                  {matchRules.slice(0, 2).map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between py-2 px-3 bg-background/50 rounded-lg border border-primary/10">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {rule.sponsors.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{rule.sponsors.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {rule.percent}% match • ${formatCurrency(rule.cap_cents_weekly)}/week
                          </p>
                        </div>
                      </div>
                      <Badge variant={rule.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {rule.status === 'active' ? 'Active' : 'Paused'}
                      </Badge>
                    </div>
                  ))}
                  {matchRules.length > 2 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{matchRules.length - 2} more sponsor{matchRules.length - 2 !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* Recent Matches */}
                {recentMatches.length > 0 && (
                  <div className="border-t border-primary/10 pt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="h-4 w-4 text-accent" />
                      <span className="text-sm font-medium">Recent Matches</span>
                    </div>
                    {recentMatches.map((match) => (
                      <div key={match.id} className="flex items-center justify-between py-2 px-3 bg-accent/10 rounded-lg mb-2 last:mb-0">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">
                            +${formatCurrency(match.match_amount_cents)}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            From {match.sponsors.email}
                          </p>
                        </div>
                        {getStatusBadge(match.charge_status)}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full mb-3">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium mb-1">Ready to double your impact?</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Your sponsors are waiting to help you succeed! 🎯
                </p>
                
                <Button 
                  size="sm" 
                  onClick={handleInviteClick}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Invite Your First Sponsor
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default MobileMatchSection;