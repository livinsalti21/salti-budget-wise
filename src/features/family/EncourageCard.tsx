import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Send, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EncourageCardProps {
  childName: string;
  childId: string;
  groupId: string;
  onEncouragementSent: () => void;
}

const EMOJI_OPTIONS = ['🎉', '⭐', '🔥', '💪', '👏', '🏆', '💎', '🚀'];

export default function EncourageCard({ 
  childName, 
  childId, 
  groupId, 
  onEncouragementSent 
}: EncourageCardProps) {
  const [selectedEmoji, setSelectedEmoji] = useState('🎉');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendEncouragement = async () => {
    if (!note.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('encouragements')
        .insert({
          group_id: groupId,
          from_user_id: (await supabase.auth.getUser()).data.user?.id,
          to_user_id: childId,
          emoji: selectedEmoji,
          note: note.trim()
        });

      if (error) throw error;

      // Optionally add a simulated reward to their demo wallet
      const rewardAmount = Math.floor(Math.random() * 500) + 100; // $1-$5 random reward
      
      const { error: walletError } = await supabase
        .from('demo_transactions')
        .insert({
          user_id: childId,
          amount_cents: rewardAmount,
          type: 'reward',
          note: `Encouragement reward: ${note.trim()}`
        });

      // Update demo wallet balance
      if (!walletError) {
        await supabase
          .from('demo_wallets')
          .upsert({
            user_id: childId,
            balance_cents: rewardAmount
          }, { 
            onConflict: 'user_id',
            ignoreDuplicates: false 
          });
      }

      toast({
        title: "Encouragement Sent!",
        description: `${childName} will see your message and a small simulated reward.`,
      });

      setNote('');
      setSelectedEmoji('🎉');
      onEncouragementSent();
    } catch (error) {
      console.error('Error sending encouragement:', error);
      toast({
        title: "Error sending encouragement",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-success" />
          <span className="font-medium">Encourage {childName}</span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">Choose an emoji</label>
            <div className="flex gap-2 flex-wrap">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`text-2xl p-2 rounded-lg transition-colors ${
                    selectedEmoji === emoji 
                      ? 'bg-success/20 ring-2 ring-success' 
                      : 'bg-background/50 hover:bg-background/70'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Write a note</label>
            <Input
              placeholder="Great job on your streak! Keep it up!"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={100}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {note.length}/100 characters
            </div>
          </div>

          <Button 
            onClick={handleSendEncouragement}
            disabled={loading || !note.trim()}
            className="w-full"
            size="sm"
          >
            {loading ? (
              "Sending..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Encouragement
              </>
            )}
          </Button>

          <div className="text-xs text-muted-foreground text-center">
            <Gift className="h-3 w-3 inline mr-1" />
            Includes a small simulated reward
          </div>
        </div>
      </CardContent>
    </Card>
  );
}