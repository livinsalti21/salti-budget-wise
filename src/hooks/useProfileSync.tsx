import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProfileSyncStatus {
  isSync: boolean;
  lastSyncAt: Date | null;
  syncError: string | null;
}

export const useProfileSync = () => {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [syncStatus, setSyncStatus] = useState<ProfileSyncStatus>({
    isSync: true,
    lastSyncAt: null,
    syncError: null
  });

  // Validate profile data against source data
  const validateProfileData = useCallback(async () => {
    if (!user) return { isValid: false, errors: [] };

    try {
      const errors: string[] = [];
      
      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile) {
        errors.push('Profile not found');
        return { isValid: false, errors };
      }

      // Validate against source data
      const { data: saveEvents } = await supabase
        .from('save_events')
        .select('amount_cents, created_at')
        .eq('user_id', user.id);

      const { data: userStreaks } = await supabase
        .from('user_streaks')
        .select('consecutive_days, longest_streak')
        .eq('user_id', user.id)
        .single();

      // Calculate expected values
      const expectedTotalSaved = saveEvents?.reduce((sum, save) => sum + save.amount_cents, 0) || 0;
      const expectedSaveCount = saveEvents?.length || 0;

      // Validate totals
      if (Math.abs((profile.total_saved_cents || 0) - expectedTotalSaved) > 1) {
        errors.push(`Total saved mismatch: expected ${expectedTotalSaved}, got ${profile.total_saved_cents}`);
      }

      if ((profile.total_saves_count || 0) !== expectedSaveCount) {
        errors.push(`Save count mismatch: expected ${expectedSaveCount}, got ${profile.total_saves_count}`);
      }

      // Validate streaks
      if (userStreaks) {
        if ((profile.current_streak_days || 0) !== userStreaks.consecutive_days) {
          errors.push(`Current streak mismatch: expected ${userStreaks.consecutive_days}, got ${profile.current_streak_days}`);
        }
        if ((profile.longest_streak_days || 0) !== userStreaks.longest_streak) {
          errors.push(`Longest streak mismatch: expected ${userStreaks.longest_streak}, got ${profile.longest_streak_days}`);
        }
      }

      return { isValid: errors.length === 0, errors };
    } catch (error) {
      console.error('Profile validation error:', error);
      return { isValid: false, errors: ['Validation check failed'] };
    }
  }, [user]);

  // Force profile sync with retry mechanism
  const forceProfileSync = useCallback(async (maxRetries = 3) => {
    if (!user) return false;

    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        setSyncStatus(prev => ({ ...prev, isSync: false, syncError: null }));
        
        // Trigger profile update function
        const { error } = await supabase.rpc('update_user_profile_summary', {
          target_user_id: user.id
        });

        if (error) throw error;

        // Refresh profile data
        await refreshProfile();
        
        // Validate the sync worked
        const validation = await validateProfileData();
        
        if (validation.isValid) {
          setSyncStatus({
            isSync: true,
            lastSyncAt: new Date(),
            syncError: null
          });
          return true;
        } else {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }
      } catch (error) {
        attempts++;
        console.error(`Profile sync attempt ${attempts} failed:`, error);
        
        if (attempts >= maxRetries) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          setSyncStatus({
            isSync: false,
            lastSyncAt: null,
            syncError: errorMessage
          });
          
          toast({
            title: "Profile Sync Failed",
            description: `Unable to sync your profile data. Please try again later.`,
            variant: "destructive",
          });
          return false;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
      }
    }
    return false;
  }, [user, refreshProfile, validateProfileData, toast]);

  // Enhanced save with profile sync validation
  const saveWithSync = useCallback(async (saveData: {
    stacklet_id: string;
    amount_cents: number;
    reason: string;
    source: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Create save event
      const { data: saveEvent, error: saveError } = await supabase
        .from('save_events')
        .insert({
          user_id: user.id,
          ...saveData
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // Wait for triggers to complete (give DB time to process)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Force profile sync and validate
      const syncSuccess = await forceProfileSync();
      
      if (!syncSuccess) {
        console.warn('Profile sync failed after save, but save was successful');
      }

      return saveEvent;
    } catch (error) {
      console.error('Save with sync failed:', error);
      throw error;
    }
  }, [user, forceProfileSync]);

  // Check profile integrity on mount
  const checkProfileIntegrity = useCallback(async () => {
    if (!user) return;

    const validation = await validateProfileData();
    if (!validation.isValid) {
      console.warn('Profile integrity check failed:', validation.errors);
      
      // Attempt to fix automatically
      const syncSuccess = await forceProfileSync();
      if (!syncSuccess) {
        toast({
          title: "Profile Data Issue",
          description: "We detected some inconsistencies in your profile. Your saves are safe, but please contact support if issues persist.",
          variant: "destructive",
        });
      }
    }
  }, [user, validateProfileData, forceProfileSync, toast]);

  return {
    syncStatus,
    validateProfileData,
    forceProfileSync,
    saveWithSync,
    checkProfileIntegrity
  };
};