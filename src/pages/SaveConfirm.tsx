import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Sparkles, Users, ArrowLeft, Share2, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { track, EVENTS } from '@/analytics/analytics';

interface SaveConfirmProps {
  amount_cents?: number;
  source?: string;
  push_id?: string;
  goal_id?: string;
}

export default function SaveConfirm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [amount, setAmount] = useState(0);
  const [source, setSource] = useState('');
  const [pushId, setPushId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);

  useEffect(() => {
    const verifyAndSetParams = async () => {
      // Parse URL parameters
      const amountCents = parseInt(searchParams.get('amount_cents') || '0');
      const sourceParam = searchParams.get('source') || 'manual';
      const pushIdParam = searchParams.get('push_id');
      const sig = searchParams.get('sig');
      const expiresAt = searchParams.get('expires_at');

      // Verify signature and expiry for deep links
      if (pushIdParam && (!sig || !expiresAt)) {
        toast({
          title: "Invalid Link",
          description: "This link appears to be tampered with. Please try again.",
          variant: "destructive"
        });
        navigate('/app');
        return;
      }

      if (expiresAt && new Date(expiresAt) < new Date()) {
        toast({
          title: "Link Expired",
          description: "This link has expired. Please generate a new one.",
          variant: "destructive"
        });
        navigate('/app');
        return;
      }

      // Verify HMAC signature for security
      if (sig && expiresAt) {
        try {
          const { data: isValid } = await supabase.rpc('verify_deep_link_signature', {
            amount_cents: amountCents,
            source: sourceParam,
            push_id: pushIdParam,
            expires_at: expiresAt,
            provided_sig: sig
          });

          if (!isValid) {
            toast({
              title: "Security Verification Failed",
              description: "This link has been tampered with. Access denied.",
              variant: "destructive"
            });
            navigate('/app');
            return;
          }
        } catch (error) {
          console.error('Signature verification failed:', error);
          toast({
            title: "Security Error",
            description: "Could not verify link authenticity. Please try again.",
            variant: "destructive"
          });
          navigate('/app');
          return;
        }
      }

      setAmount(amountCents);
      setSource(sourceParam);
      setPushId(pushIdParam);

      // Log that the push was opened
      if (pushIdParam) {
        logPushEvent(pushIdParam, 'opened');
      }
    };

    verifyAndSetParams();
  }, [searchParams, navigate, toast]);

  const logPushEvent = async (pushId: string, event: string) => {
    try {
      await supabase.functions.invoke('push-log', {
        body: { push_id: pushId, event }
      });
    } catch (error) {
      console.error('Failed to log push event:', error);
    }
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const calculateImpact = (cents: number) => {
    // 30-year projection at 8% growth
    const years = 30;
    const rate = 0.08;
    const monthlyAmount = cents / 100;
    const monthlyContributions = 12;
    
    // Future value of annuity formula
    const futureValue = monthlyAmount * monthlyContributions * 
      (((1 + rate) ** years - 1) / rate);
    
    return Math.round(futureValue);
  };

  const quickAmounts = [500, 1000, 2000]; // $5, $10, $20 in cents

  const confirmSave = async () => {
    if (!user || amount <= 0) return;

    setLoading(true);
    try {
      const idempotencyKey = pushId ? `push_${pushId}` : `manual_${Date.now()}`;
      
      const { data, error } = await supabase.functions.invoke('save-confirm', {
        body: {
          amount_cents: amount,
          source,
          push_id: pushId,
          idempotency_key: idempotencyKey
        }
      });

      if (error) throw error;

      // Update local stats immediately
      setStreakCount(data?.streak_count || 0);
      setTotalSaved(data?.total_saved_cents || 0);

      // Log save confirmed if from push
      if (pushId) {
        await logPushEvent(pushId, 'save_confirmed');
      }

      // Track analytics
      await track(EVENTS.save_confirmed, {
        amount_cents: amount,
        source,
        total_saved_cents: data?.total_saved_cents || 0,
        streak_count: data?.streak_count || 0
      });

      setShowConfetti(true);
      toast({
        title: "Save Confirmed! 🎉",
        description: `$${formatCurrency(amount)} added to your stack!`
      });

      // Auto navigate after celebration
      setTimeout(() => {
        navigate('/app');
      }, 3000);

    } catch (error) {
      console.error('Error confirming save:', error);
      toast({
        title: "Save Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const shareSuccess = async () => {
    const shareData = {
      title: 'Livin Salti - Save Success!',
      text: `Just saved $${formatCurrency(amount)}! 💪 Join me on Livin Salti to build wealth together.`,
      url: 'https://livinsalti.com'
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        track('share_success', { source: 'save_confirmation', amount_cents: amount });
      } catch (error) {
        console.log('Share was cancelled or failed', error);
      }
    } else {
      // Fallback for web - copy to clipboard
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      toast({
        title: "Copied to clipboard!",
        description: "Share your success with friends",
      });
    }
  };

  if (showConfetti) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md text-center animate-scale-in">
          <CardContent className="p-8">
            {/* Animated Success Icons */}
            <div className="relative mb-6">
              <div className="text-8xl animate-pulse">🎉</div>
              <div className="absolute -top-2 -right-2 text-4xl animate-bounce">✨</div>
              <div className="absolute -bottom-2 -left-2 text-4xl animate-bounce delay-100">💰</div>
            </div>
            
            {/* Success Message */}
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Save Confirmed!
            </h2>
            <p className="text-xl mb-2">${formatCurrency(amount)} added to your stack</p>
            
            {/* Updated Stats */}
            <div className="flex justify-center gap-4 mb-4">
              {streakCount > 0 && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  🔥 {streakCount} day streak
                </Badge>
              )}
              {totalSaved > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  💎 ${formatCurrency(totalSaved)} total
                </Badge>
              )}
            </div>
            
            {/* Future Value Impact */}
            <div className="p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg mb-6 border border-accent/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                <span className="text-sm font-semibold">30-Year Impact</span>
              </div>
              <p className="text-sm text-muted-foreground">
                This save could grow to{" "}
                <span className="text-lg font-bold text-accent">
                  ${calculateImpact(amount).toLocaleString()}
                </span>
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <Button onClick={shareSuccess} className="w-full" size="lg">
                <Share2 className="h-4 w-4 mr-2" />
                Share Your Success
              </Button>
              <Button onClick={() => navigate('/app')} variant="outline" className="w-full">
                Back to Dashboard
              </Button>
            </div>
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
              <DollarSign className="h-5 w-5 text-primary" />
              Confirm Your Save
            </CardTitle>
            <CardDescription>
              {source === 'payday' && "Great timing! Your payday save is ready."}
              {source === 'roundup' && "Your round-ups are ready to convert."}
              {source === 'streak_guard' && "Keep that streak alive!"}
              {source === 'match_invite' && "Match contribution ready!"}
              {source === 'manual' && "Ready to stack some savings?"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Amount */}
            <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">
                ${formatCurrency(amount)}
              </div>
              <Badge variant="secondary">{source.replace('_', ' ')}</Badge>
            </div>

            {/* Quick Amount Chips */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Quick adjust:</p>
              <div className="flex gap-2">
                {quickAmounts.map(quickAmount => (
                  <Button
                    key={quickAmount}
                    variant={amount === quickAmount ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAmount(quickAmount)}
                  >
                    ${formatCurrency(quickAmount)}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/app/save/choose?default_cents=${amount}&source=${source}&push_id=${pushId || ''}`)}
                >
                  Custom
                </Button>
              </div>
            </div>

            {/* Impact Projection */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">30-Year Impact</span>
              </div>
              <p className="text-sm text-muted-foreground">
                At 8% growth, this save could become{" "}
                <span className="font-semibold text-primary">
                  ${calculateImpact(amount).toLocaleString()}
                </span>
              </p>
            </div>

            {/* Confirm Button */}
            <Button
              onClick={confirmSave}
              disabled={loading || amount <= 0}
              className="w-full"
              size="lg"
            >
              {loading ? "Confirming..." : `Confirm $${formatCurrency(amount)} Save`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}