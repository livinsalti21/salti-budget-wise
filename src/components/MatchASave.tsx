import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Heart, Plus, DollarSign, Pause, Play, Users, CreditCard, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MatchRule {
  id: string;
  percent: number;
  cap_cents_weekly: number;
  asset_type: 'CASH' | 'BTC';
  status: 'active' | 'paused';
  created_at: string;
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

const MatchASave = () => {
  const [matchRules, setMatchRules] = useState<MatchRule[]>([]);
  const [recentMatches, setRecentMatches] = useState<MatchEvent[]>([]);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  
  const { user } = useAuth();
  const { toast } = useToast();

  const loadMatchData = async () => {
    if (!user) return;

    // Load match rules for this user
    const { data: rulesData, error: rulesError } = await supabase
      .from('match_rules')
      .select(`
        *,
        sponsors (email, stripe_customer_id)
      `)
      .eq('recipient_user_id', user.id);

    if (rulesError) {
      console.error('Error loading match rules:', rulesError);
    } else {
      setMatchRules((rulesData || []) as MatchRule[]);
    }

    // Load recent match events
    const { data: eventsData, error: eventsError } = await supabase
      .from('match_events')
      .select(`
        *,
        sponsors (email)
      `)
      .eq('recipient_user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (eventsError) {
      console.error('Error loading match events:', eventsError);
    } else {
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

    // For now, just show a success message
    // In production, this would send an actual email invitation
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
        return <Badge variant="default" className="bg-success">✅ Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary">⏳ Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">❌ Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Match-a-Save</h2>
          <p className="text-muted-foreground">Family & friends can match your saves automatically</p>
        </div>
        
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Invite Sponsor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Family or Friends</DialogTitle>
              <DialogDescription>
                Invite someone to become your savings sponsor and automatically match your saves
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInviteSponsor} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="grandma@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  They'll receive an email with instructions to set up matching
                </p>
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
      </div>

      {/* Active Match Rules */}
      {matchRules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Your Sponsors ({matchRules.length})
            </CardTitle>
            <CardDescription>
              People who automatically match your saves
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {matchRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-lg border border-red-500/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                      {rule.sponsors.email.charAt(0).toUpperCase()}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold">{rule.sponsors.email}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {rule.percent}% match
                        </span>
                        <span>
                          Cap: ${formatCurrency(rule.cap_cents_weekly)}/week
                        </span>
                        <Badge variant="outline">
                          {rule.asset_type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>
                      {rule.status === 'active' ? (
                        <>
                          <Play className="mr-1 h-3 w-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <Pause className="mr-1 h-3 w-3" />
                          Paused
                        </>
                      )}
                    </Badge>
                    
                    {!rule.sponsors.stripe_customer_id && (
                      <Badge variant="destructive" className="text-xs">
                        <CreditCard className="mr-1 h-3 w-3" />
                        Payment Setup Needed
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Matches */}
      {recentMatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-green-500" />
              Recent Matches
            </CardTitle>
            <CardDescription>
              Your latest matched saves from sponsors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMatches.map((match) => (
                <div key={match.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                  <div>
                    <p className="font-medium">
                      ${formatCurrency(match.match_amount_cents)} matched
                    </p>
                    <p className="text-sm text-muted-foreground">
                      From {match.sponsors.email} • {new Date(match.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Original save: ${formatCurrency(match.original_amount_cents)}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    {getStatusBadge(match.charge_status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {matchRules.length === 0 && (
        <Card className="p-8 text-center">
          <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No sponsors yet</h3>
          <p className="text-muted-foreground mb-4">
            Invite family or friends to automatically match your saves and help you reach your goals faster
          </p>
          <Button onClick={() => setShowInviteDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Invite Your First Sponsor
          </Button>
        </Card>
      )}

      {/* How it Works */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <CardContent className="p-6">
          <h4 className="font-semibold mb-3">How Match-a-Save Works</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">1</div>
              <p><strong>You Save</strong></p>
              <p className="text-muted-foreground">Make a save to any stacklet</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">2</div>
              <p><strong>Auto Match</strong></p>
              <p className="text-muted-foreground">Sponsors are automatically charged their % match</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">3</div>
              <p><strong>You Get More</strong></p>
              <p className="text-muted-foreground">Extra money added to your stacklet</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchASave;