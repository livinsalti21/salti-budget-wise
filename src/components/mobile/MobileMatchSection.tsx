import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Heart, Plus, DollarSign, Gift, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const [isLoading, setIsLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  
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

  const handleInviteSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inviteEmail.trim()) return;
    
    setIsLoading(true);
    
    toast({
      title: "Invitation sent! 📧",
      description: `We've sent an invitation to ${inviteEmail} to become your savings sponsor.`,
    });
    
    setInviteEmail('');
    setShowInviteDialog(false);
    setIsLoading(false);
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
    <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Match
          </div>
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8">
                <Plus className="h-3 w-3 mr-1" />
                Invite
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[90vw] max-w-md">
              <DialogHeader>
                <DialogTitle>Invite a Sponsor</DialogTitle>
                <DialogDescription>
                  Family or friends can automatically match your saves
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInviteSponsor} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="family@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Invitation'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowInviteDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
            <Heart className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">No sponsors yet</p>
            <p className="text-xs text-muted-foreground mb-3">
              Invite family to match your saves
            </p>
            <Button 
              size="sm" 
              onClick={() => setShowInviteDialog(true)}
              className="w-full"
            >
              <Plus className="h-3 w-3 mr-1" />
              Invite Your First Sponsor
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileMatchSection;