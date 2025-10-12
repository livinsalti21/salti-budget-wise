import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Share2, Copy, Send, Heart, Flame, Trophy, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FriendInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FriendInviteModal({ open, onOpenChange }: FriendInviteModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [loadingCode, setLoadingCode] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && open) {
      loadReferralCode();
    }
  }, [user, open]);

  const loadReferralCode = async () => {
    if (!user) return;

    try {
      let { data: existingReferral } = await supabase
        .from('referrals')
        .select('code')
        .eq('referrer_id', user.id)
        .single();

      let code = existingReferral?.code;

      if (!code) {
        code = `STACK${user.id.slice(0, 6).toUpperCase()}`;
        await supabase.from('referrals').insert({
          referrer_id: user.id,
          code: code
        });
      }

      setReferralCode(code);
    } catch (error) {
      console.error('Error loading referral code:', error);
    } finally {
      setLoadingCode(false);
    }
  };

  const generateShareLink = () => {
    return `${window.location.origin}?ref=${referralCode}`;
  };

  const handleShare = async () => {
    const link = generateShareLink();
    const text = `Join me on Livin Salti! We can save together and build streaks 🔥 Use my link: ${link}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on Livin Salti',
          text,
          url: link,
        });
        toast({
          title: "🎉 Shared!",
          description: "Invite sent to your friend",
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generateShareLink());
      toast({
        title: "📋 Link Copied!",
        description: "Share it with your friends via text or social media",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleInvite = async () => {
    if (!email || !user) return;

    setIsLoading(true);
    
    try {
      // Check if user exists with this email
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email.toLowerCase())
        .single();

      if (existingUser) {
        // Check if friend connection already exists
        const { data: existingConnection } = await supabase
          .from('friend_connections')
          .select('id, status')
          .or(`and(user_id.eq.${user.id},friend_user_id.eq.${existingUser.id}),and(user_id.eq.${existingUser.id},friend_user_id.eq.${user.id})`)
          .single();

        if (existingConnection) {
          toast({
            title: "Already Connected",
            description: `You're already friends with ${email}`,
          });
          setIsLoading(false);
          return;
        }

        // Create friend connection request
        const { error } = await supabase.from('friend_connections').insert({
          user_id: user.id,
          friend_user_id: existingUser.id,
          status: 'pending'
        });

        if (error) throw error;

        toast({
          title: "🎉 Friend Request Sent!",
          description: `Sent friend request to ${email}`,
        });
      } else {
        toast({
          title: "📧 Invitation Sent!",
          description: `${email} will receive an invitation to join Livin Salti`,
        });
      }
      
      setEmail('');
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Friends</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Save together, grow together! Start building streaks with friends 🔥
          </p>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Share Link Section - Primary Action */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Share Your Link</h4>
              <span className="text-xs text-muted-foreground">Instant invite ⚡</span>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={loadingCode ? 'Loading...' : generateShareLink()}
                readOnly
                className="font-mono text-xs"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleCopyLink}
                disabled={loadingCode}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <Button 
              onClick={handleShare} 
              disabled={loadingCode}
              className="w-full"
              size="lg"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share via Text or Social
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              They join instantly → No emails needed
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>

          {/* Email Invite Section - Secondary */}
          <div className="space-y-3">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">💪 Benefits of Friend Streaks:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-start gap-2">
                <Heart className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                Match each other's saves to stay accountable
              </li>
              <li className="flex items-start gap-2">
                <Flame className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                Build consecutive day streaks together
              </li>
              <li className="flex items-start gap-2">
                <Trophy className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                Celebrate milestones (3, 7, 30+ days!)
              </li>
              <li className="flex items-start gap-2">
                <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                See each other's progress in real-time
              </li>
            </ul>
          </div>

            <h4 className="text-sm font-medium">Send Email Invite</h4>
            <div className="space-y-2">
              <Label htmlFor="email">Friend's Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
              />
            </div>

            <Button onClick={handleInvite} disabled={!email || isLoading} variant="secondary" className="w-full">
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? 'Sending...' : 'Send Email Invite'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
