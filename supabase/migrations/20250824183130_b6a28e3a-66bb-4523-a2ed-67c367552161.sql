-- Create function to get user community stats efficiently
CREATE OR REPLACE FUNCTION public.get_user_community_stats(target_user_id uuid)
RETURNS TABLE (
  total_saved_cents bigint,
  total_matched_cents bigint,
  current_streak integer,
  total_saves_count bigint,
  active_sponsors_count bigint,
  recent_match_events jsonb
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Total saved amount
    COALESCE((
      SELECT SUM(amount_cents)::bigint 
      FROM save_events 
      WHERE user_id = target_user_id
    ), 0) as total_saved_cents,
    
    -- Total matched amount
    COALESCE((
      SELECT SUM(match_amount_cents)::bigint 
      FROM match_events 
      WHERE recipient_user_id = target_user_id 
      AND charge_status = 'succeeded'
    ), 0) as total_matched_cents,
    
    -- Current streak
    COALESCE((
      SELECT consecutive_days 
      FROM user_streaks 
      WHERE user_id = target_user_id
    ), 0) as current_streak,
    
    -- Total saves count
    COALESCE((
      SELECT COUNT(*)::bigint 
      FROM save_events 
      WHERE user_id = target_user_id
    ), 0) as total_saves_count,
    
    -- Active sponsors count
    COALESCE((
      SELECT COUNT(DISTINCT sponsor_id)::bigint 
      FROM match_rules 
      WHERE recipient_user_id = target_user_id 
      AND status = 'active'
    ), 0) as active_sponsors_count,
    
    -- Recent match events (last 5)
    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', me.id,
          'match_amount_cents', me.match_amount_cents,
          'original_amount_cents', me.original_amount_cents,
          'created_at', me.created_at,
          'charge_status', me.charge_status,
          'sponsor_name', s.name
        ) ORDER BY me.created_at DESC
      )
      FROM (
        SELECT * FROM match_events 
        WHERE recipient_user_id = target_user_id 
        ORDER BY created_at DESC 
        LIMIT 5
      ) me
      LEFT JOIN sponsors s ON me.sponsor_id = s.id
    ), '[]'::jsonb) as recent_match_events;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_community_stats(uuid) TO authenticated;