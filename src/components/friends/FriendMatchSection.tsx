import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Heart, Plus, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import FriendInviteModal from './FriendInviteModal';

interface FriendConnection {
  id: string;
  friend_user_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  profiles?: {
    email: string;
    display_name?: string;
  };
}

interface FriendMatch {
  id: string;
  original_amount_cents: number;
  matching_amount_cents: number;
  original_user_id: string;
  matching_user_id: string;
  created_at: string;
  profiles?: {
    email: string;
    display_name?: string;
  };
}

interface RecentSave {
  id: string;
  amount_cents: number;
  created_at: string;
  user_id: string;
  profiles?: {
    email: string;
    display_name?: string;
  };
}

export default function FriendMatchSection() {
  const [friends, setFriends] = useState<FriendConnection[]>([]);
  const [recentMatches, setRecentMatches] = useState<FriendMatch[]>([]);
  const [friendSaves, setFriendSaves] = useState<RecentSave[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadFriendData();
    }
  }, [user]);

  const loadFriendData = async () => {
    if (!user) return;

    setIsLoading(true);
    
    // Load friend connections (simplified query)
    const { data: friendsData } = await supabase
      .from('friend_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    if (friendsData) {
      // Add mock profile data for now
      const friendsWithProfiles = friendsData.map(f => ({
        ...f,
        profiles: {
          email: `friend-${f.friend_user_id.slice(0, 8)}@example.com`,
          display_name: `Friend ${f.friend_user_id.slice(0, 4)}`
        }
      }));
      setFriends(friendsWithProfiles as FriendConnection[]);
    }

    // Load recent friend matches (simplified)
    const { data: matchesData } = await supabase
      .from('friend_matches')
      .select('*')
      .or(`original_user_id.eq.${user.id},matching_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(5);

    if (matchesData) {
      // Add mock profile data
      const matchesWithProfiles = matchesData.map(m => ({
        ...m,
        profiles: {
          email: `friend-${m.matching_user_id.slice(0, 8)}@example.com`,
          display_name: `Friend ${m.matching_user_id.slice(0, 4)}`
        }
      }));
      setRecentMatches(matchesWithProfiles as FriendMatch[]);
    }

    // Load recent saves from friends (simplified)
    const friendIds = friendsData?.map(f => f.friend_user_id) || [];
    if (friendIds.length > 0) {
      const { data: savesData } = await supabase
        .from('save_events')
        .select('*')
        .in('user_id', friendIds)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (savesData) {
        // Add mock profile data
        const savesWithProfiles = savesData.map(s => ({
          ...s,
          profiles: {
            email: `friend-${s.user_id.slice(0, 8)}@example.com`,
            display_name: `Friend ${s.user_id.slice(0, 4)}`
          }
        }));
        setFriendSaves(savesWithProfiles as RecentSave[]);
      }
    }

    setIsLoading(false);
  };

  const handleMatchFriendSave = async (friendSave: RecentSave) => {
    if (!user) return;

    setIsLoading(true);
    
    // First, create a save event for the matching amount (need a stacklet_id)
    // For now, create a temporary stacklet or use an existing one
    const { data: existingStacklets } = await supabase
      .from('stacklets')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);
    
    let stackletId = existingStacklets?.[0]?.id;
    
    if (!stackletId) {
      // Create a default stacklet if none exists
      const { data: newStacklet } = await supabase
        .from('stacklets')
        .insert({
          user_id: user.id,
          title: 'Friend Matches',
          emoji: '🤝',
          target_cents: 100000 // $1000 default
        })
        .select('id')
        .single();
      
      stackletId = newStacklet?.id;
    }

    const { data: saveEvent, error: saveError } = await supabase
      .from('save_events')
      .insert({
        user_id: user.id,
        amount_cents: friendSave.amount_cents,
        source: 'manual',
        stacklet_id: stackletId,
        note: `Matching ${friendSave.profiles?.display_name || friendSave.profiles?.email}'s save`
      })
      .select()
      .single();

    if (saveError) {
      toast({
        title: "Error creating save",
        description: "Failed to create your matching save. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    // Create the friend match record
    const { error: matchError } = await supabase
      .from('friend_matches')
      .insert({
        original_save_event_id: friendSave.id,
        matching_save_event_id: saveEvent.id,
        original_user_id: friendSave.user_id,
        matching_user_id: user.id,
        original_amount_cents: friendSave.amount_cents,
        matching_amount_cents: saveEvent.amount_cents
      });

    if (matchError) {
      toast({
        title: "Error creating match",
        description: "Failed to record the friend match. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "🎉 Friend Match Created!",
        description: `You matched ${friendSave.profiles?.display_name || "your friend"}'s $${(friendSave.amount_cents / 100).toFixed(2)} save!`,
      });
      
      // Reload data to show the new match
      loadFriendData();
    }

    setIsLoading(false);
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  if (isLoading && friends.length === 0) {
    return <div className="text-center py-4">Loading friend matches...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Friend Matches Header */}
      <Card className="bg-gradient-to-br from-blue-50/50 via-indigo-50/50 to-purple-50/50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-blue-500" />
            Friend Matches
            <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200">
              Social Saving
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            When your friends save, you can "match" them by saving the same amount to your own account. 
            Build <strong>friend streaks</strong> together! 💪
          </p>
          
          {/* Key Difference Callout */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <Zap className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-900">Friend Match vs Sponsor Match</p>
                <p className="text-amber-700">
                  • <strong>Friend Match:</strong> You both save to your own accounts (social motivation)
                </p>
                <p className="text-amber-700">
                  • <strong>Sponsor Match:</strong> They send money directly to your account (financial support)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Friend Saves to Match */}
      {friendSaves.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Friend Saves</CardTitle>
            <p className="text-sm text-muted-foreground">Match your friends' saves to build friend streaks together</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {friendSaves.slice(0, 3).map((save) => (
                <div key={save.id} className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Heart className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {save.profiles?.display_name || save.profiles?.email} saved ${formatCurrency(save.amount_cents)}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(save.created_at)}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleMatchFriendSave(save)}
                    disabled={isLoading}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Heart className="h-3 w-3 mr-1" />
                    Match ${formatCurrency(save.amount_cents)}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Friend Matches */}
      {recentMatches.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-500" />
              Recent Friend Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMatches.slice(0, 3).map((match) => (
                <div key={match.id} className="flex items-center justify-between p-3 bg-purple-50/50 rounded-lg border border-purple-100">
                  <div>
                    <p className="font-medium text-sm">
                      {match.original_user_id === user?.id ? 'You' : match.profiles?.display_name || 'Friend'} ↔️ 
                      {match.matching_user_id === user?.id ? ' You' : ` ${match.profiles?.display_name || 'Friend'}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${formatCurrency(match.original_amount_cents)} • {formatTimeAgo(match.created_at)}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-purple-50 border-purple-200">
                    Friend Match ✨
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {friends.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="font-medium mb-2">No Friends Connected Yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Connect with friends to start matching each other's saves and building friend streaks!
            </p>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowInviteModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Friends
            </Button>
          </CardContent>
        </Card>
      )}

      {friends.length > 0 && friendSaves.length === 0 && (
        <Card>
          <CardContent className="text-center py-6">
            <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium mb-1">No Recent Friend Saves</p>
            <p className="text-sm text-muted-foreground">
              Your friends haven't saved recently. Encourage them to save so you can match! 🎯
            </p>
          </CardContent>
        </Card>
      )}

      {/* Friend Invite Modal */}
      <FriendInviteModal 
        open={showInviteModal} 
        onOpenChange={setShowInviteModal}
      />
    </div>
  );
}