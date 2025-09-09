-- Fix remaining function search path issues
-- Update has_role function to include proper search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$function$;

-- Fix any remaining trigger functions that don't have search_path set
CREATE OR REPLACE FUNCTION public.update_weekly_budgets_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_device_tokens_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_demo_wallet_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_stacklet_progress()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
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

-- Update remaining functions with proper search_path
CREATE OR REPLACE FUNCTION public.generate_group_code()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.get_week_start(input_date date DEFAULT CURRENT_DATE)
 RETURNS date
 LANGUAGE sql
 IMMUTABLE
 SET search_path = 'public'
AS $function$
    SELECT (input_date - INTERVAL '1 day' * EXTRACT(DOW FROM input_date - 1))::DATE;
$function$;

CREATE OR REPLACE FUNCTION public.current_user_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE
 SET search_path = 'public'
AS $function$
  SELECT auth.uid()
$function$;

CREATE OR REPLACE FUNCTION public.is_parent_of(child uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path = 'public'
AS $function$
  SELECT EXISTS(
    SELECT 1
    FROM family_group_members m_parent
    JOIN family_group_members m_child
      ON m_parent.group_id = m_child.group_id
    WHERE m_parent.user_id = auth.uid()
      AND m_parent.role = 'parent'
      AND m_child.user_id = child
      AND m_child.role = 'child'
  );
$function$;