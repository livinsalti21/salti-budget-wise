import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, Flame, Calendar, Trophy, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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

export default function CommunityFeed() {
  const [activeTab, setActiveTab] = useState<'feed' | 'leaderboard' | 'contacts'>('feed');
  const [posts, setPosts] = useState<SavePost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadCommunityFeed();
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

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
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
      case 'contacts':
        return <ContactSync />;
      default:
        return renderFeed();
    }
  };

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

  return (
    <div className="space-y-4">
      <div className="text-center py-4">
        <h2 className="text-xl font-bold">Community</h2>
        <p className="text-muted-foreground">Connect, compete, and celebrate together</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-muted p-1 rounded-lg">
          <Button
            variant={activeTab === 'feed' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('feed')}
            className="flex items-center gap-2"
          >
            <Heart className="h-4 w-4" />
            Feed
          </Button>
          <Button
            variant={activeTab === 'leaderboard' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('leaderboard')}
            className="flex items-center gap-2"
          >
            <Trophy className="h-4 w-4" />
            Leaderboard
          </Button>
          <Button
            variant={activeTab === 'contacts' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('contacts')}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Friends
          </Button>
        </div>
      </div>

      {renderTabContent()}
    </div>
  );
}