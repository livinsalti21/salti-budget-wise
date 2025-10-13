-- ============================================
-- PHASE 1: Fix Friend Streaks Database (CRITICAL)
-- ============================================
-- Creates the missing friend_streaks table that useFriendStreaks hook expects
-- This table tracks consecutive matching days between friends for accountability

-- ============================================
-- 1. Create friend_streaks table
-- ============================================

CREATE TABLE IF NOT EXISTS public.friend_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  total_matches INTEGER NOT NULL DEFAULT 0,
  total_matched_cents BIGINT NOT NULL DEFAULT 0,
  last_matched_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_user_id),
  CHECK (user_id != friend_user_id)
);

-- Enable RLS
ALTER TABLE public.friend_streaks ENABLE ROW LEVEL SECURITY;

-- Users can SELECT their own streaks
CREATE POLICY "Users can view their own friend streaks"
ON public.friend_streaks
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Only service role can write (via functions)
CREATE POLICY "Service role can manage friend streaks"
ON public.friend_streaks
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX idx_friend_streaks_user_id ON public.friend_streaks(user_id);
CREATE INDEX idx_friend_streaks_friend_user_id ON public.friend_streaks(friend_user_id);
CREATE INDEX idx_friend_streaks_active ON public.friend_streaks(is_active) WHERE is_active = true;
CREATE INDEX idx_friend_streaks_last_matched ON public.friend_streaks(last_matched_date) WHERE last_matched_date IS NOT NULL;

-- ============================================
-- 2. Create calculate_friend_streak function
-- ============================================

CREATE OR REPLACE FUNCTION public.calculate_friend_streak(
  p_user_id UUID,
  p_friend_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  streak_count INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  found_match BOOLEAN;
BEGIN
  -- Calculate consecutive days where BOTH users saved AND matched
  LOOP
    -- Check if both users matched on this date
    SELECT EXISTS(
      SELECT 1 FROM friend_matches fm
      WHERE (
        (fm.original_user_id = p_user_id AND fm.matching_user_id = p_friend_id)
        OR
        (fm.original_user_id = p_friend_id AND fm.matching_user_id = p_user_id)
      )
      AND DATE(fm.created_at) = check_date
    ) INTO found_match;
    
    EXIT WHEN NOT found_match;
    
    streak_count := streak_count + 1;
    check_date := check_date - INTERVAL '1 day';
  END LOOP;
  
  RETURN streak_count;
END;
$$;

-- ============================================
-- 3. Create update_friend_streaks function
-- ============================================

CREATE OR REPLACE FUNCTION public.update_friend_streaks(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  friend_record RECORD;
  current_streak_val INTEGER;
BEGIN
  -- Get all friends for this user (from accepted connections)
  FOR friend_record IN 
    SELECT DISTINCT
      CASE 
        WHEN fc.user_id = target_user_id THEN fc.friend_user_id
        ELSE fc.user_id
      END as friend_id
    FROM friend_connections fc
    WHERE (fc.user_id = target_user_id OR fc.friend_user_id = target_user_id)
      AND fc.status = 'accepted'
  LOOP
    -- Calculate current streak
    current_streak_val := calculate_friend_streak(target_user_id, friend_record.friend_id);
    
    -- Upsert streak record
    INSERT INTO friend_streaks (
      user_id,
      friend_user_id,
      current_streak,
      longest_streak,
      total_matches,
      total_matched_cents,
      last_matched_date,
      is_active,
      updated_at
    )
    SELECT
      target_user_id,
      friend_record.friend_id,
      current_streak_val,
      current_streak_val, -- Will be updated by GREATEST below on conflict
      COUNT(*),
      COALESCE(SUM(fm.matching_amount_cents), 0),
      MAX(DATE(fm.created_at)),
      (current_streak_val > 0),
      now()
    FROM friend_matches fm
    WHERE (
      (fm.original_user_id = target_user_id AND fm.matching_user_id = friend_record.friend_id)
      OR
      (fm.original_user_id = friend_record.friend_id AND fm.matching_user_id = target_user_id)
    )
    ON CONFLICT (user_id, friend_user_id)
    DO UPDATE SET
      current_streak = EXCLUDED.current_streak,
      longest_streak = GREATEST(friend_streaks.longest_streak, EXCLUDED.current_streak),
      total_matches = EXCLUDED.total_matches,
      total_matched_cents = EXCLUDED.total_matched_cents,
      last_matched_date = EXCLUDED.last_matched_date,
      is_active = (EXCLUDED.current_streak > 0),
      updated_at = now();
  END LOOP;
END;
$$;

-- ============================================
-- 4. Create trigger to auto-update streaks
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_friend_match_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update streaks for both users involved in the match
  PERFORM update_friend_streaks(NEW.original_user_id);
  PERFORM update_friend_streaks(NEW.matching_user_id);
  RETURN NEW;
END;
$$;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS friend_match_streak_trigger ON public.friend_matches;

-- Create new trigger
CREATE TRIGGER friend_match_streak_trigger
  AFTER INSERT ON public.friend_matches
  FOR EACH ROW
  EXECUTE FUNCTION handle_friend_match_created();

-- ============================================
-- 5. Backfill existing data
-- ============================================

-- Backfill friend streaks for all existing users with friend matches
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN
    SELECT DISTINCT original_user_id as user_id
    FROM friend_matches
    UNION
    SELECT DISTINCT matching_user_id as user_id
    FROM friend_matches
  LOOP
    PERFORM update_friend_streaks(user_record.user_id);
  END LOOP;
END $$;

-- ============================================
-- Summary of Phase 1:
-- ============================================
-- ✅ friend_streaks table created with proper RLS
-- ✅ Users can only read their own streaks
-- ✅ Only edge functions can write streaks
-- ✅ calculate_friend_streak() function created
-- ✅ update_friend_streaks() function created
-- ✅ Trigger on friend_matches auto-updates streaks
-- ✅ Existing data backfilled