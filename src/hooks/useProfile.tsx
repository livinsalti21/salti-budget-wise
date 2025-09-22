import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProfileStats {
  totalSaved: number;
  currentStreak: number;
  longestStreak: number;
  totalStacklets: number;
  completedGoals: number;
  activeBudgets: number;
  lastSaveDate: string | null;
  totalSavesCount: number;
}

interface ProfilePreferences {
  notifications: {
    pushEnabled: boolean;
    streakEnabled: boolean;
    matchEnabled: boolean;
  };
  ui: {
    theme: string;
    currency: string;
  };
}

export const useProfile = () => {
  const { profile, updateProfile, refreshProfile } = useAuth();

  // Format cents to dollars
  const formatCurrency = (cents: number): string => {
    const currency = profile?.ui_preferences?.currency || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100);
  };

  // Get profile stats in a convenient format
  const getStats = (): ProfileStats => {
    return {
      totalSaved: profile?.total_saved_cents || 0,
      currentStreak: profile?.current_streak_days || 0,
      longestStreak: profile?.longest_streak_days || 0,
      totalStacklets: profile?.total_stacklets || 0,
      completedGoals: profile?.completed_goals || 0,
      activeBudgets: profile?.active_budgets || 0,
      lastSaveDate: profile?.last_save_date || null,
      totalSavesCount: profile?.total_saves_count || 0,
    };
  };

  // Get preferences in a convenient format
  const getPreferences = (): ProfilePreferences => {
    return {
      notifications: profile?.notification_preferences || {
        pushEnabled: true,
        streakEnabled: true,
        matchEnabled: true,
      },
      ui: profile?.ui_preferences || {
        theme: 'auto',
        currency: 'USD',
      },
    };
  };

  // Update notification preferences
  const updateNotificationPreferences = async (preferences: Partial<ProfilePreferences['notifications']>) => {
    const currentPrefs = getPreferences();
    const newNotificationPrefs = { ...currentPrefs.notifications, ...preferences };
    
    await updateProfile({
      notification_preferences: newNotificationPrefs,
    });
  };

  // Update UI preferences
  const updateUIPreferences = async (preferences: Partial<ProfilePreferences['ui']>) => {
    const currentPrefs = getPreferences();
    const newUIPrefs = { ...currentPrefs.ui, ...preferences };
    
    await updateProfile({
      ui_preferences: newUIPrefs,
    });
  };

  // Check if user has pro access
  const hasProAccess = (): boolean => {
    if (!profile) return false;
    
    const now = new Date();
    
    // Check for active pro plan
    if (profile.plan === 'Pro' || profile.plan === 'Family') {
      return true;
    }
    
    // Check for bonus access
    if (profile.bonus_access_until) {
      const bonusUntil = new Date(profile.bonus_access_until);
      if (bonusUntil > now) return true;
    }
    
    // Check for pro access until
    if (profile.pro_access_until) {
      const proUntil = new Date(profile.pro_access_until);
      if (proUntil > now) return true;
    }
    
    return false;
  };

  // Get current saving streak with status
  const getStreakInfo = () => {
    const stats = getStats();
    const lastSave = stats.lastSaveDate ? new Date(stats.lastSaveDate) : null;
    const today = new Date();
    
    let status: 'active' | 'at_risk' | 'broken' = 'active';
    
    if (!lastSave) {
      status = 'broken';
    } else {
      const daysSinceLastSave = Math.floor((today.getTime() - lastSave.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLastSave > 1) {
        status = 'broken';
      } else if (daysSinceLastSave === 1) {
        status = 'at_risk';
      }
    }
    
    return {
      current: stats.currentStreak,
      longest: stats.longestStreak,
      status,
      lastSaveDate: lastSave,
    };
  };

  // Manually trigger profile refresh (useful after saves)
  const triggerRefresh = async () => {
    await refreshProfile();
  };

  return {
    profile,
    stats: getStats(),
    preferences: getPreferences(),
    formatCurrency,
    hasProAccess: hasProAccess(),
    streakInfo: getStreakInfo(),
    updateProfile,
    updateNotificationPreferences,
    updateUIPreferences,
    triggerRefresh,
  };
};