import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FriendStreak {
  friend_id: string;
  friend_name: string;
  friend_email: string;
  current_streak: number;
  longest_streak: number;
  total_matches: number;
  total_matched_cents: number;
  last_matched_date: string | null;
  is_active: boolean;
}

export const useFriendStreaks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [friendStreaks, setFriendStreaks] = useState<FriendStreak[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [topStreak, setTopStreak] = useState<FriendStreak | null>(null);

  const loadFriendStreaks = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    
    const { data: streaksData, error } = await supabase
      .from('friend_streaks' as any)
      .select(`
        *,
        profiles:friend_user_id (
          email,
          display_name,
          avatar_url
        )
      `)
      .eq('user_id', user.id)
      .order('current_streak', { ascending: false });

    if (error) {
      console.error('Error loading friend streaks:', error);
      setIsLoading(false);
      return;
    }

    const formattedStreaks: FriendStreak[] = (streaksData as any)?.map((s: any) => ({
      friend_id: s.friend_user_id,
      friend_name: s.profiles?.display_name || s.profiles?.email?.split('@')[0] || 'Friend',
      friend_email: s.profiles?.email || '',
      current_streak: s.current_streak,
      longest_streak: s.longest_streak,
      total_matches: s.total_matches,
      total_matched_cents: s.total_matched_cents,
      last_matched_date: s.last_matched_date,
      is_active: s.is_active
    })) || [];

    setFriendStreaks(formattedStreaks);
    setTopStreak(formattedStreaks[0] || null);
    setIsLoading(false);
  }, [user]);

  const refreshStreaks = useCallback(async () => {
    if (!user) return;
    
    // Trigger recalculation
    await supabase.rpc('update_friend_streaks' as any, {
      target_user_id: user.id
    });
    
    // Reload data
    await loadFriendStreaks();
    
    toast({
      title: "Friend Streaks Updated! 🔥",
      description: "Your friend streak data has been refreshed.",
    });
  }, [user, loadFriendStreaks, toast]);

  const getStreakWithFriend = useCallback((friendId: string) => {
    return friendStreaks.find(s => s.friend_id === friendId);
  }, [friendStreaks]);

  useEffect(() => {
    if (user) {
      loadFriendStreaks();
      
      // Real-time subscription
      const channel = supabase
        .channel('friend-streaks-changes')
        .on(
          'postgres_changes' as any,
          {
            event: '*',
            schema: 'public',
            table: 'friend_streaks',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            loadFriendStreaks();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, loadFriendStreaks]);

  return {
    friendStreaks,
    topStreak,
    isLoading,
    refreshStreaks,
    getStreakWithFriend
  };
};
