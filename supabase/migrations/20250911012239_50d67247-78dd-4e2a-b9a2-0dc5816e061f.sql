-- Fix security definer views and remaining critical issues

-- Check for any problematic security definer views and replace with secure alternatives
-- Note: We need to ensure no views bypass RLS inappropriately

-- Fix any potential security definer issues in our leaderboard view
-- First drop and recreate the leaderboard view without security definer if it exists
DROP VIEW IF EXISTS public.leaderboard_weekly;

-- Recreate leaderboard as a regular view (not security definer) with proper RLS respect
CREATE VIEW public.leaderboard_weekly AS
SELECT 
  p.id as user_id,
  p.display_name,
  COALESCE(SUM(se.amount_cents), 0) as total_saved_cents,
  COUNT(se.id) as saves_count,
  COALESCE(us.consecutive_days, 0) as current_streak
FROM profiles p
LEFT JOIN save_events se ON p.id = se.user_id 
  AND se.created_at >= date_trunc('week', CURRENT_DATE)
LEFT JOIN user_streaks us ON p.id = us.user_id
WHERE p.display_name IS NOT NULL
GROUP BY p.id, p.display_name, us.consecutive_days
ORDER BY total_saved_cents DESC
LIMIT 100;

-- Add proper RLS policy for leaderboard view access
CREATE POLICY "Public leaderboard view access"
  ON public.leaderboard_weekly
  FOR SELECT
  USING (true); -- Public leaderboard is viewable by all authenticated users

-- Ensure all our custom functions use proper security practices
-- Update any remaining functions that might have security issues

-- Add constraint to ensure security audit logs have required fields
ALTER TABLE public.security_audit_log 
ADD CONSTRAINT check_event_type_not_empty 
CHECK (char_length(event_type) > 0);

-- Add better indexing for performance and security
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name) 
WHERE display_name IS NOT NULL;

-- Add timestamp index for save_events to optimize leaderboard queries
CREATE INDEX IF NOT EXISTS idx_save_events_created_week ON public.save_events(created_at) 
WHERE created_at >= date_trunc('week', CURRENT_DATE);

-- Security: Add check constraint to prevent negative amounts in critical tables
ALTER TABLE public.save_events 
ADD CONSTRAINT check_amount_positive 
CHECK (amount_cents >= 0);

-- Add check for match events to prevent negative matches
ALTER TABLE public.match_events 
ADD CONSTRAINT check_match_amount_positive 
CHECK (match_amount_cents >= 0 AND original_amount_cents >= 0);

-- Create a secure function for getting user stats without security definer issues
CREATE OR REPLACE FUNCTION public.get_current_user_stats()
RETURNS TABLE(
  total_saves bigint,
  total_amount_cents bigint,
  current_streak integer,
  badges_count bigint
)
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(COUNT(se.id), 0) as total_saves,
    COALESCE(SUM(se.amount_cents), 0) as total_amount_cents,
    COALESCE(us.consecutive_days, 0) as current_streak,
    COALESCE(COUNT(DISTINCT ub.badge_id), 0) as badges_count
  FROM profiles p
  LEFT JOIN save_events se ON p.id = se.user_id
  LEFT JOIN user_streaks us ON p.id = us.user_id  
  LEFT JOIN user_badges ub ON p.id = ub.user_id
  WHERE p.id = auth.uid()
  GROUP BY us.consecutive_days;
END;
$$;