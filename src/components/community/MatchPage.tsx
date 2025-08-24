import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, MessageCircle, Flame, Trophy, Users, Plus, DollarSign, Pause, Play, CreditCard, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDistance } from 'date-fns';
import LeaderboardPage from '../leaderboard/LeaderboardPage';
import ContactSync from './ContactSync';

interface SavePost {
  id: string;
  user_id: string;
  amount_cents: number;
  reason: string;
  created_at: string;
  user_profile?: {
    display_name: string | null;
  };
  likes_count?: number;
  user_has_liked?: boolean;
  streak_days?: number;
}

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

export default function MatchPage() {
  const [activeTab, setActiveTab] = useState<'feed' | 'leaderboard' | 'friends' | 'streaks' | 'match'>('feed');
  const [posts, setPosts] = useState<SavePost[]>([]);
  const [friendStreaks, setFriendStreaks] = useState<any[]>([]);
  const [matchRules, setMatchRules] = useState<MatchRule[]>([]);
  const [recentMatches, setRecentMatches] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadCommunityFeed();
    loadFriendStreaks();
    loadMatchData();
  }, []);

  const loadCommunityFeed = async () => {
    try {
      // Get recent saves - we'll get profiles separately to avoid relation issues
      const { data: saves, error } = await supabase
        .from('saves')
        .select(`
          id,
          user_id,
          amount_cents,
          reason,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Get like counts, user's likes, profiles and streak data for each post
      const postsWithLikes = await Promise.all(
        (saves || []).map(async (save) => {
          // Get profile for this user
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', save.user_id)
            .single();

          // Get current streak for this user
          const { data: streakData } = await supabase
            .from('user_streaks')
            .select('consecutive_days')
            .eq('user_id', save.user_id)
            .single();

          const { count: likesCount } = await supabase
            .from('save_likes')
            .select('*', { count: 'exact', head: true })
            .eq('save_id', save.id);

          let userHasLiked = false;
          if (user) {
            const { data: userLike } = await supabase
              .from('save_likes')
              .select('id')
              .eq('save_id', save.id)
              .eq('user_id', user.id)
              .single();
            userHasLiked = !!userLike;
          }

          return {
            ...save,
            user_profile: { display_name: profile?.display_name || null },
            likes_count: likesCount || 0,
            user_has_liked: userHasLiked,
            streak_days: streakData?.consecutive_days || 0
          };
        })
      );

      setPosts(postsWithLikes);
    } catch (error) {
      console.error('Error loading community feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFriendStreaks = async () => {
    if (!user) return;

    try {
      // Get all friend streaks - in a real app this would filter by actual friends
      const { data: streaks } = await supabase
        .from('user_streaks')
        .select(`
          user_id,
          consecutive_days,
          profiles!user_streaks_user_id_fkey (display_name)
        `)
        .neq('user_id', user.id)
        .gt('consecutive_days', 0)
        .order('consecutive_days', { ascending: false });

      if (streaks) {
        const formattedStreaks = streaks.map((streak, index) => ({
          user_id: streak.user_id,
          consecutive_days: streak.consecutive_days,
          rank: index + 1,
          display_name: (streak.profiles as any)?.display_name || 'Friend',
          created_at: new Date().toISOString() // Mock date for "started" time
        }));
        setFriendStreaks(formattedStreaks);
      }
    } catch (error) {
      console.error('Error loading friend streaks:', error);
    }
  };

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

  const handleLike = async (postId: string) => {
    if (!user) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      if (post.user_has_liked) {
        // Unlike
        await supabase
          .from('save_likes')
          .delete()
          .eq('save_id', postId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('save_likes')
          .insert({
            save_id: postId,
            user_id: user.id
          });
      }

      // Update local state
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === postId
            ? {
                ...p,
                user_has_liked: !p.user_has_liked,
                likes_count: p.user_has_liked 
                  ? (p.likes_count || 0) - 1 
                  : (p.likes_count || 0) + 1
              }
            : p
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

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
    return `$${(cents / 100).toFixed(2)}`;
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

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-24" />
          </Card>
        ))}
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'friends':
        return <ContactSync />;
      case 'streaks':
        return renderFriendStreaks();
      case 'match':
        return renderMatchTab();
      default:
        return renderFeed();
    }
  };

  const renderFriendStreaks = () => (
    <div className="space-y-4">
      <div className="text-center py-4">
        <h3 className="text-lg font-bold">Friend Streaks 🔥</h3>
        <p className="text-sm text-muted-foreground">See how your friends are doing!</p>
      </div>

      {friendStreaks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Flame className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No friend streaks yet</p>
            <p className="text-sm text-muted-foreground">Connect with friends to see their progress!</p>
          </CardContent>
        </Card>
      ) : (
        friendStreaks.map((friend) => (
          <Card key={friend.user_id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      #{friend.rank}
                    </Badge>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {friend.display_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <p className="font-semibold">{friend.display_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Started {formatDistance(new Date(friend.created_at), new Date(), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <span className="text-xl font-bold text-orange-600">{friend.consecutive_days}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderFeed = () => (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">No community activity yet</p>
            <p className="text-sm">Be the first to share a save!</p>
          </CardContent>
        </Card>
      ) : (
        posts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {post.user_profile?.display_name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {post.user_profile?.display_name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistance(new Date(post.created_at), new Date(), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-orange-50 text-orange-700">
                    <Flame className="h-3 w-3 mr-1" />
                    {post.streak_days} day{post.streak_days !== 1 ? 's' : ''}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {formatCurrency(post.amount_cents)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm mb-4">
                Saved {formatCurrency(post.amount_cents)} by skipping: {post.reason}
              </p>
              
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  className={`gap-2 ${post.user_has_liked ? 'text-red-500' : ''}`}
                  disabled={!user}
                >
                  <Heart 
                    className={`h-4 w-4 ${post.user_has_liked ? 'fill-current' : ''}`} 
                  />
                  {post.likes_count || 0}
                </Button>
                
                <Button variant="ghost" size="sm" className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  0
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderMatchTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Match-a-Save</h3>
          <p className="text-sm text-muted-foreground">Family & friends can match your saves automatically</p>
        </div>
        
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Invite
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
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-4 w-4 text-red-500" />
              Your Sponsors ({matchRules.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {matchRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-lg border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {rule.sponsors.email.charAt(0).toUpperCase()}
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm">{rule.sponsors.email}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{rule.percent}% match</span>
                        <span>${(rule.cap_cents_weekly / 100).toFixed(0)}/week cap</span>
                      </div>
                    </div>
                  </div>
                  
                  <Badge variant={rule.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {rule.status}
                  </Badge>
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
            <CardTitle className="flex items-center gap-2 text-base">
              <Gift className="h-4 w-4 text-green-500" />
              Recent Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMatches.map((match) => (
                <div key={match.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                  <div>
                    <p className="font-medium text-sm">
                      {formatCurrency(match.match_amount_cents)} matched
                    </p>
                    <p className="text-xs text-muted-foreground">
                      From {match.sponsors.email}
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
        <Card className="p-6 text-center">
          <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">No sponsors yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Invite family or friends to automatically match your saves
          </p>
          <Button onClick={() => setShowInviteDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Invite Your First Sponsor
          </Button>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="text-center py-4">
        <h2 className="text-xl font-bold">Match</h2>
        <p className="text-muted-foreground">Connect, compete, and get matched</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-muted p-1 rounded-lg overflow-x-auto">
          <Button
            variant={activeTab === 'feed' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('feed')}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Heart className="h-4 w-4" />
            Feed
          </Button>
          <Button
            variant={activeTab === 'leaderboard' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('leaderboard')}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Trophy className="h-4 w-4" />
            Leaderboard
          </Button>
          <Button
            variant={activeTab === 'friends' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('friends')}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Users className="h-4 w-4" />
            Friends
          </Button>
          <Button
            variant={activeTab === 'streaks' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('streaks')}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Flame className="h-4 w-4" />
            Streaks
          </Button>
          <Button
            variant={activeTab === 'match' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('match')}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Gift className="h-4 w-4" />
            Match
          </Button>
        </div>
      </div>

      {renderTabContent()}
    </div>
  );
}