-- Fix Security Definer View by dropping and recreating leaderboard_weekly view
-- The current view references non-existent tables (users, saves, save_streaks)
-- Replace with a proper view that uses our actual schema

DROP VIEW IF EXISTS public.leaderboard_weekly;

-- Create new leaderboard_weekly view using correct table names from our schema
CREATE VIEW public.leaderboard_weekly AS
SELECT 
    p.id AS user_id,
    p.display_name,
    COUNT(se.id)::bigint AS saves_count,
    COALESCE(SUM(se.amount_cents), 0)::bigint AS total_saved_cents,
    COALESCE(us.consecutive_days, 0) AS current_streak
FROM public.profiles p
LEFT JOIN public.save_events se ON (
    p.id = se.user_id 
    AND se.created_at >= date_trunc('week', now())
)
LEFT JOIN public.user_streaks us ON (p.id = us.user_id)
WHERE p.display_name IS NOT NULL
GROUP BY p.id, p.display_name, us.consecutive_days
ORDER BY COUNT(se.id) DESC, COALESCE(SUM(se.amount_cents), 0) DESC;