import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, Heart, Flame, Trophy, Target } from 'lucide-react';
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
  
  const { user } = useAuth();
  const { toast } = useToast();

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
          <DialogTitle>Add Friends</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Save together, grow together! When they accept, you can match each other's saves and build streaks. 🔥
          </p>
        </DialogHeader>
        
        <div className="space-y-4">
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

          <Button onClick={handleInvite} disabled={!email || isLoading} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Sending...' : 'Send Invite'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
