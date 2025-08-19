import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Share2, Copy, Users, Gift, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ReferralStats {
  total_sent: number;
  total_joined: number;
  total_matched: number;
  total_streak_started: number;
  referral_code: string;
}

export default function ReferralSystem() {
  const [stats, setStats] = useState<ReferralStats>({
    total_sent: 0,
    total_joined: 0,
    total_matched: 0,
    total_streak_started: 0,
    referral_code: ''
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadReferralStats();
    }
  }, [user]);

  const loadReferralStats = async () => {
    if (!user) return;

    try {
      // Get or create referral code
      let { data: existingReferral } = await supabase
        .from('referrals')
        .select('code')
        .eq('referrer_id', user.id)
        .single();

      let referralCode = existingReferral?.code;

      if (!referralCode) {
        // Generate a new referral code
        referralCode = `STACK${user.id.slice(0, 6).toUpperCase()}`;
        
        const { error } = await supabase
          .from('referrals')
          .insert({
            referrer_id: user.id,
            code: referralCode
          });

        if (error) throw error;
      }

      // Get referral stats from events
      const { data: events } = await supabase
        .from('referral_events')
        .select('event_type')
        .eq('referral_id', (await supabase
          .from('referrals')
          .select('id')
          .eq('referrer_id', user.id)
          .single()
        ).data?.id || '');

      const eventCounts = events?.reduce((acc, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      setStats({
        total_sent: eventCounts.sent || 0,
        total_joined: eventCounts.joined || 0,
        total_matched: eventCounts.matched_save || 0,
        total_streak_started: eventCounts.streak_started || 0,
        referral_code: referralCode
      });
    } catch (error) {
      console.error('Error loading referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReferralLink = () => {
    return `${window.location.origin}?ref=${stats.referral_code}`;
  };

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(generateReferralLink());
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const shareReferralLink = async () => {
    const link = generateReferralLink();
    const text = `Join me on Livin Salti and start building wealth through Save n Stack! Use my link to get started: ${link}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Livin Salti',
          text,
          url: link,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      copyReferralLink();
    }
  };

  const getProgressPercentage = () => {
    const totalSteps = 5; // 5 friends to get reward
    return Math.min((stats.total_streak_started / totalSteps) * 100, 100);
  };

  const getStatusStep = (current: number, required: number, label: string) => {
    const isComplete = current >= required;
    return (
      <div className={`flex items-center gap-2 ${isComplete ? 'text-green-600' : 'text-muted-foreground'}`}>
        {isComplete ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <div className="h-4 w-4 rounded-full border-2 border-current" />
        )}
        <span className="text-sm">{label}: {current}/{required}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="h-64 animate-pulse" />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invite Friends
          </CardTitle>
          <CardDescription>
            Get 5 friends to start a streak and earn 1 free month of Pro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={generateReferralLink()}
              readOnly
              className="font-mono text-sm"
            />
            <Button variant="outline" onClick={copyReferralLink}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button onClick={shareReferralLink}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress to Free Pro Month</span>
              <Badge variant="secondary">
                {stats.total_streak_started}/5
              </Badge>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Referral Progress
          </CardTitle>
          <CardDescription>
            Track your friends' journey (rewards coming soon!)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {getStatusStep(stats.total_sent, 5, "Invites sent")}
          {getStatusStep(stats.total_joined, 5, "Friends joined")}
          {getStatusStep(stats.total_matched, 5, "Friends matched saves")}
          {getStatusStep(stats.total_streak_started, 5, "Friends started streaks")}
          
          <div className="mt-4 p-3 bg-accent/10 rounded-lg">
            <p className="text-sm text-muted-foreground">
              🎉 Complete all steps to earn 1 free month of Pro (coming soon!)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}