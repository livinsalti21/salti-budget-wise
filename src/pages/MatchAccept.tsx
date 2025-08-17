import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, ArrowLeft, CheckCircle, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface MatchInvite {
  id: string;
  inviter_id: string;
  amount_cents: number;
  message?: string;
  status: string;
  created_at: string;
  inviter_name?: string;
}

export default function MatchAccept() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [inviteId, setInviteId] = useState<string | null>(null);
  const [pushId, setPushId] = useState<string | null>(null);
  const [invite, setInvite] = useState<MatchInvite | null>(null);
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const inviteIdParam = searchParams.get('invite_id');
    const pushIdParam = searchParams.get('push_id');

    setInviteId(inviteIdParam);
    setPushId(pushIdParam);

    if (inviteIdParam) {
      fetchInvite(inviteIdParam);
    }
  }, [searchParams]);

  const fetchInvite = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('match_invites')
        .select('*')
        .eq('id', id)
        .eq('invitee_id', user?.id)
        .single();

      if (error) throw error;

      // Get inviter profile separately
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', data.inviter_id)
        .single();

      setInvite({
        ...data,
        inviter_name: profile?.display_name || 'Someone'
      });
    } catch (error) {
      console.error('Error fetching invite:', error);
      toast({
        title: "Invite Not Found",
        description: "This invite may have expired or been removed.",
        variant: "destructive"
      });
      navigate('/app');
    }
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const acceptInvite = async () => {
    if (!inviteId || !invite) return;

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('match-accept', {
        body: {
          invite_id: inviteId,
          push_id: pushId
        }
      });

      if (error) throw error;

      setAccepted(true);
      toast({
        title: "Match Accepted! 🎉",
        description: `You'll both be saving $${formatCurrency(invite.amount_cents)}!`
      });

      // Auto navigate after celebration
      setTimeout(() => {
        navigate('/app');
      }, 3000);

    } catch (error) {
      console.error('Error accepting invite:', error);
      toast({
        title: "Accept Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const declineInvite = async () => {
    if (!inviteId) return;

    try {
      const { error } = await supabase
        .from('match_invites')
        .update({ status: 'declined' })
        .eq('id', inviteId);

      if (error) throw error;

      toast({
        title: "Invite Declined",
        description: "You can always change your mind later."
      });

      navigate('/app');
    } catch (error) {
      console.error('Error declining invite:', error);
    }
  };

  if (accepted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Match Accepted!</h2>
            <p className="text-lg mb-4">
              You and {invite?.inviter_name} are now matched for ${formatCurrency(invite?.amount_cents || 0)}
            </p>
            <Badge variant="secondary" className="mb-4">
              Both of you will save together
            </Badge>
            <p className="text-sm text-muted-foreground">
              Great teamwork! You'll both be notified when it's time to save.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="text-2xl mb-4">🔍</div>
            <h2 className="text-xl font-bold mb-2">Loading Invite...</h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="max-w-md mx-auto space-y-6 pt-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/app')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Match Invitation
            </CardTitle>
            <CardDescription>
              Someone wants to save together!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Inviter Info */}
            <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
              <Avatar className="h-16 w-16 mx-auto mb-3">
                <AvatarFallback>
                  {invite.inviter_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg">{invite.inviter_name}</h3>
              <p className="text-sm text-muted-foreground">wants to match your saves</p>
            </div>

            {/* Match Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="font-medium">Match Amount</span>
                </div>
                <span className="text-xl font-bold text-primary">
                  ${formatCurrency(invite.amount_cents)}
                </span>
              </div>

              {invite.message && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium mb-2">Message:</p>
                  <p className="text-sm italic">"{invite.message}"</p>
                </div>
              )}

              <div className="p-4 bg-secondary/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  When you both save, you'll each contribute ${formatCurrency(invite.amount_cents)} 
                  and motivate each other to build better saving habits!
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={acceptInvite}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? "Accepting..." : `Accept Match - $${formatCurrency(invite.amount_cents)}`}
              </Button>

              <Button
                variant="outline"
                onClick={declineInvite}
                className="w-full"
              >
                Maybe Later
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}