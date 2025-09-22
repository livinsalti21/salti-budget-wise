-- Profile-Centric Data Architecture: Add summary fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_saved_cents BIGINT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_streak_days INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longest_streak_days INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_stacklets INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS completed_goals INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_budgets INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_save_date TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_saves_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"push_enabled": true, "streak_enabled": true, "match_enabled": true}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ui_preferences JSONB DEFAULT '{"theme": "auto", "currency": "USD"}';

-- Function to update profile summary data
CREATE OR REPLACE FUNCTION public.update_user_profile_summary(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
  save_stats RECORD;
  streak_stats RECORD;
BEGIN
  -- Get save statistics
  SELECT 
    COALESCE(COUNT(*), 0) as total_saves,
    COALESCE(SUM(amount_cents), 0) as total_amount,
    MAX(created_at) as last_save
  INTO save_stats
  FROM public.save_events 
  WHERE user_id = target_user_id;
  
  -- Get streak statistics
  SELECT 
    COALESCE(consecutive_days, 0) as current_streak,
    COALESCE(longest_streak, 0) as longest_streak
  INTO streak_stats
  FROM public.user_streaks 
  WHERE user_id = target_user_id;
  
  -- Update profile with calculated data
  UPDATE public.profiles SET
    total_saved_cents = save_stats.total_amount,
    total_saves_count = save_stats.total_saves,
    last_save_date = save_stats.last_save,
    current_streak_days = streak_stats.current_streak,
    longest_streak_days = streak_stats.longest_streak,
    total_stacklets = (
      SELECT COALESCE(COUNT(*), 0) 
      FROM public.stacklets 
      WHERE user_id = target_user_id AND is_active = true
    ),
    completed_goals = (
      SELECT COALESCE(COUNT(*), 0) 
      FROM public.goals 
      WHERE user_id = target_user_id AND status = 'completed'
    ),
    active_budgets = (
      SELECT COALESCE(COUNT(*), 0) 
      FROM public.budgets 
      WHERE user_id = target_user_id
    ),
    updated_at = now()
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to handle profile updates on save events
CREATE OR REPLACE FUNCTION public.handle_save_event_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profile summary for the user
  PERFORM update_user_profile_summary(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to handle profile updates on streak changes
CREATE OR REPLACE FUNCTION public.handle_streak_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profile summary for the user
  PERFORM update_user_profile_summary(COALESCE(NEW.user_id, OLD.user_id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for automatic profile updates
DROP TRIGGER IF EXISTS trigger_save_event_profile_update ON public.save_events;
CREATE TRIGGER trigger_save_event_profile_update
  AFTER INSERT ON public.save_events
  FOR EACH ROW EXECUTE FUNCTION handle_save_event_profile_update();

DROP TRIGGER IF EXISTS trigger_streak_profile_update ON public.user_streaks;
CREATE TRIGGER trigger_streak_profile_update
  AFTER INSERT OR UPDATE ON public.user_streaks
  FOR EACH ROW EXECUTE FUNCTION handle_streak_profile_update();

-- Initialize existing user profiles with current data
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM public.profiles LOOP
    PERFORM update_user_profile_summary(user_record.id);
  END LOOP;
END $$;