-- Update the save event trigger to also call match engine
CREATE OR REPLACE FUNCTION update_stacklet_progress()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;