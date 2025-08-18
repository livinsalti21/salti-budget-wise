import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, X, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InviteChildProps {
  groupId: string;
  onClose: () => void;
  onInviteSent: () => void;
}

export default function InviteChild({ groupId, onClose, onInviteSent }: InviteChildProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      // Create the invitation
      const { error: inviteError } = await supabase
        .from('family_group_invites')
        .insert({
          group_id: groupId,
          invitee_email: email.trim().toLowerCase(),
          role: 'child',
          status: 'pending'
        });

      if (inviteError) throw inviteError;

      // Here you would typically send an email via edge function
      // For now, we'll just show a success message
      
      toast({
        title: "Invitation Sent!",
        description: `We'll send an invite to ${email}. Your child will see encouragements and simulated rewards — no real money moves.`,
      });

      onInviteSent();
    } catch (error) {
      console.error('Error sending invite:', error);
      toast({
        title: "Error sending invitation",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="fixed inset-0 z-50 m-4 md:m-8 lg:max-w-lg lg:mx-auto lg:my-20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Invite a Child
            </CardTitle>
            <CardDescription>
              Send an invitation to join your family group
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Child's Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="child@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
            <h4 className="font-medium mb-2">What happens next?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Your child will receive an email invitation</li>
              <li>• They'll be able to join in Educational Mode</li>
              <li>• You can send encouragements and see their progress</li>
              <li>• All activities use simulated money only</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !email.trim()} className="flex-1">
              {loading ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invite
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}