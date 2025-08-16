-- Fix critical security issues: Enable RLS on table_name and kv_store_ee841bb1
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kv_store_ee841bb1 ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for table_name (assuming it should be admin-only or system-level)
CREATE POLICY "Only admins can manage table_name" 
ON public.table_name 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add RLS policies for kv_store_ee841bb1 (typically a system-level key-value store)
CREATE POLICY "System can manage kv store" 
ON public.kv_store_ee841bb1 
FOR ALL 
USING (false) -- No direct access via API
WITH CHECK (false); -- No direct access via API

-- Fix search_path security for functions
CREATE OR REPLACE FUNCTION public.update_user_streak(target_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  current_date_local DATE := CURRENT_DATE;
  last_action_date_val DATE;
  consecutive_count INTEGER := 0;
  temp_date DATE;
BEGIN
  -- Get or create user_streaks record
  INSERT INTO public.user_streaks (user_id, consecutive_days, longest_streak, last_action_date)
  VALUES (target_user_id, 0, 0, NULL)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Get the last action date
  SELECT last_action_date INTO last_action_date_val
  FROM public.user_streaks
  WHERE user_id = target_user_id;
  
  -- Calculate consecutive days by checking backwards from today
  temp_date := current_date_local;
  WHILE EXISTS (
    SELECT 1 FROM public.daily_actions 
    WHERE user_id = target_user_id 
    AND action_date = temp_date
  ) LOOP
    consecutive_count := consecutive_count + 1;
    temp_date := temp_date - INTERVAL '1 day';
  END LOOP;
  
  -- Update user_streaks
  UPDATE public.user_streaks
  SET 
    consecutive_days = consecutive_count,
    longest_streak = GREATEST(longest_streak, consecutive_count),
    last_action_date = current_date_local,
    is_active = (consecutive_count > 0),
    updated_at = now()
  WHERE user_id = target_user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_and_award_badges(target_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  badge_record RECORD;
  user_stats RECORD;
BEGIN
  -- Get user statistics
  SELECT 
    (SELECT COUNT(*) FROM public.save_events WHERE user_id = target_user_id) as total_saves,
    (SELECT COALESCE(SUM(amount_cents), 0) FROM public.save_events WHERE user_id = target_user_id) as total_amount,
    (SELECT COUNT(*) FROM public.stacklets WHERE user_id = target_user_id) as stacklets_created,
    (SELECT COALESCE(consecutive_days, 0) FROM public.user_streaks WHERE user_id = target_user_id) as streak_days
  INTO user_stats;

  -- Check each badge requirement
  FOR badge_record IN 
    SELECT b.* FROM public.badges b
    WHERE b.id NOT IN (SELECT badge_id FROM public.user_badges WHERE user_id = target_user_id)
  LOOP
    -- Check if user meets the requirement
    CASE badge_record.requirement_type
      WHEN 'first_save' THEN
        IF user_stats.total_saves >= badge_record.requirement_value THEN
          INSERT INTO public.user_badges (user_id, badge_id) VALUES (target_user_id, badge_record.id);
        END IF;
      WHEN 'streak_days' THEN
        IF user_stats.streak_days >= badge_record.requirement_value THEN
          INSERT INTO public.user_badges (user_id, badge_id) VALUES (target_user_id, badge_record.id);
        END IF;
      WHEN 'total_saves' THEN
        IF user_stats.total_saves >= badge_record.requirement_value THEN
          INSERT INTO public.user_badges (user_id, badge_id) VALUES (target_user_id, badge_record.id);
        END IF;
      WHEN 'total_amount' THEN
        IF user_stats.total_amount >= badge_record.requirement_value THEN
          INSERT INTO public.user_badges (user_id, badge_id) VALUES (target_user_id, badge_record.id);
        END IF;
      WHEN 'stacklets_created' THEN
        IF user_stats.stacklets_created >= badge_record.requirement_value THEN
          INSERT INTO public.user_badges (user_id, badge_id) VALUES (target_user_id, badge_record.id);
        END IF;
    END CASE;
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_group_code()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 6-character code with numbers and uppercase letters
    code := upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.groups WHERE code = code) INTO exists;
    
    -- Exit loop if code is unique
    IF NOT exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_stacklet_progress()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  -- Update stacklet progress
  UPDATE public.stacklets 
  SET progress_cents = progress_cents + NEW.amount_cents,
      updated_at = now()
  WHERE id = NEW.stacklet_id;
  
  -- Ensure daily_actions record exists for today
  INSERT INTO public.daily_actions (user_id, action_date, action_type)
  VALUES (NEW.user_id, CURRENT_DATE, 'save')
  ON CONFLICT (user_id, action_date, action_type) DO NOTHING;
  
  -- Update user streaks
  PERFORM update_user_streak(NEW.user_id);
  
  -- Check and award badges
  PERFORM check_and_award_badges(NEW.user_id);
  
  -- For manual saves, trigger match engine (skip for match-generated saves)
  IF NEW.source = 'manual' OR NEW.source = 'payday_rule' THEN
    -- Use pg_notify to trigger match engine asynchronously
    PERFORM pg_notify('match_engine', json_build_object(
      'save_event_id', NEW.id,
      'user_id', NEW.user_id,
      'amount_cents', NEW.amount_cents
    )::text);
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_weekly_match_spend(rule_id uuid, week_start date)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
DECLARE
  total_spent INTEGER;
BEGIN
  SELECT COALESCE(SUM(match_amount_cents), 0)
  INTO total_spent
  FROM public.match_events
  WHERE match_rule_id = rule_id
    AND created_at >= week_start::TIMESTAMP
    AND created_at < (week_start + INTERVAL '7 days')::TIMESTAMP
    AND charge_status = 'succeeded';
  
  RETURN total_spent;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_onboarding_suggestions(target_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Create suggested stacklets
  INSERT INTO public.onboarding_suggestions (user_id, suggestion_type, title, emoji, target_cents) VALUES
  (target_user_id, 'stacklet', 'Emergency Fund', '🛡️', 100000),
  (target_user_id, 'stacklet', 'Spring Break Trip', '🌴', 50000);
  
  -- Create suggested payday rule
  INSERT INTO public.onboarding_suggestions (user_id, suggestion_type, title, amount_cents, cadence) VALUES
  (target_user_id, 'payday_rule', 'Weekly Auto-Save', 2500, 'weekly');
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$function$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;