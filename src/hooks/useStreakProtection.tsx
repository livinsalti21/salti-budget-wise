import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface StreakInfo {
  current: number;
  longest: number;
  lastSaveDate: Date | null;
  gracePeriodActive: boolean;
  gracePeriodEnds: Date | null;
}

export const useStreakProtection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);

  // Get comprehensive streak information
  const getStreakInfo = useCallback(async (): Promise<StreakInfo | null> => {
    if (!user) return null;

    try {
      // Get user streak data
      const { data: userStreaks } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get last save event
      const { data: lastSave } = await supabase
        .from('save_events')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const lastSaveDate = lastSave ? new Date(lastSave.created_at) : null;
      const now = new Date();
      
      // Calculate grace period (users get 36 hours instead of 24)
      const gracePeriodHours = 36;
      let gracePeriodActive = false;
      let gracePeriodEnds = null;

      if (lastSaveDate) {
        const hoursSinceLastSave = (now.getTime() - lastSaveDate.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastSave > 24 && hoursSinceLastSave <= gracePeriodHours) {
          gracePeriodActive = true;
          gracePeriodEnds = new Date(lastSaveDate.getTime() + (gracePeriodHours * 60 * 60 * 1000));
        }
      }

      const info: StreakInfo = {
        current: userStreaks?.consecutive_days || 0,
        longest: userStreaks?.longest_streak || 0,
        lastSaveDate,
        gracePeriodActive,
        gracePeriodEnds
      };

      setStreakInfo(info);
      return info;
    } catch (error) {
      console.error('Error getting streak info:', error);
      return null;
    }
  }, [user]);

  // Validate streak integrity and fix if needed
  const validateAndFixStreak = useCallback(async () => {
    if (!user) return false;

    try {
      // Get all save events for this user, ordered by date
      const { data: saveEvents } = await supabase
        .from('save_events')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (!saveEvents || saveEvents.length === 0) {
        // No saves, streak should be 0
        await supabase
          .from('user_streaks')
          .upsert({
            user_id: user.id,
            consecutive_days: 0,
            longest_streak: 0,
            last_action_date: null,
            is_active: false
          });
        return true;
      }

      // Calculate streak manually
      const savesByDate: { [key: string]: boolean } = {};
      saveEvents.forEach(save => {
        const dateStr = new Date(save.created_at).toDateString();
        savesByDate[dateStr] = true;
      });

      // Calculate current streak from today backwards
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      const today = new Date();
      
      // Check backwards from today
      for (let i = 0; i < 365; i++) { // Check up to a year back
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toDateString();
        
        if (savesByDate[dateStr]) {
          if (i === 0 || i === 1) { // Today or yesterday counts for current streak
            currentStreak = Math.max(currentStreak, 1);
          }
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          if (i <= 1) {
            // No save today or yesterday breaks current streak
            currentStreak = 0;
          }
          tempStreak = 0;
        }
      }

      // Update the streak data
      const { error } = await supabase
        .from('user_streaks')
        .upsert({
          user_id: user.id,
          consecutive_days: currentStreak,
          longest_streak: longestStreak,
          last_action_date: saveEvents[saveEvents.length - 1]?.created_at ? 
            new Date(saveEvents[saveEvents.length - 1].created_at).toISOString().split('T')[0] : null,
          is_active: currentStreak > 0
        });

      if (error) throw error;

      // Trigger profile update
      await supabase.rpc('update_user_profile_summary', {
        target_user_id: user.id
      });

      return true;
    } catch (error) {
      console.error('Error validating streak:', error);
      return false;
    }
  }, [user]);

  // Recover streak if user saves within grace period
  const recoverStreak = useCallback(async () => {
    if (!user) return false;

    const info = await getStreakInfo();
    if (!info || !info.gracePeriodActive) {
      toast({
        title: "Grace Period Expired",
        description: "The grace period for streak recovery has ended.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Create a backdated save event for yesterday to maintain streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(23, 59, 59); // End of yesterday

      // Get or create a default stacklet
      let { data: stacklets } = await supabase
        .from('stacklets')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      let stackletId;
      if (!stacklets || stacklets.length === 0) {
        const { data: newStacklet, error: stackletError } = await supabase
          .from('stacklets')
          .insert({
            user_id: user.id,
            title: 'Streak Recovery',
            target_cents: 100000,
            emoji: '🔥'
          })
          .select('id')
          .single();
        
        if (stackletError) throw stackletError;
        stackletId = newStacklet.id;
      } else {
        stackletId = stacklets[0].id;
      }

      // Create recovery save event
      const { error } = await supabase
        .from('save_events')
        .insert({
          user_id: user.id,
          stacklet_id: stackletId,
          amount_cents: 100, // $1 symbolic save
          reason: 'Streak Recovery Save',
          source: 'streak_recovery',
          created_at: yesterday.toISOString()
        });

      if (error) throw error;

      // Recalculate streak
      await validateAndFixStreak();

      toast({
        title: "Streak Recovered! 🔥",
        description: "Your saving streak has been recovered. Keep it going!",
        duration: 5000,
      });

      return true;
    } catch (error) {
      console.error('Error recovering streak:', error);
      toast({
        title: "Recovery Failed",
        description: "Unable to recover your streak. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, getStreakInfo, validateAndFixStreak, toast]);

  return {
    streakInfo,
    getStreakInfo,
    validateAndFixStreak,
    recoverStreak
  };
};