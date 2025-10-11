-- Phase 1: Automatic Ledger Sync from Save Events
-- This ensures every save automatically updates user_ledger and user_accounts

-- Create trigger function to sync save_events to user_ledger
CREATE OR REPLACE FUNCTION sync_save_event_to_ledger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  future_value_40yr BIGINT;
  current_balance BIGINT;
  new_balance BIGINT;
BEGIN
  -- Calculate 40-year future value (8% annual return)
  future_value_40yr := ROUND(NEW.amount_cents * POWER(1.08, 40));
  
  -- Get current balance
  SELECT COALESCE(current_balance_cents, 0)
  INTO current_balance
  FROM user_accounts
  WHERE user_id = NEW.user_id;
  
  new_balance := COALESCE(current_balance, 0) + NEW.amount_cents;
  
  -- Create ledger entry
  INSERT INTO user_ledger (
    user_id,
    transaction_type,
    amount_cents,
    running_balance_cents,
    description,
    reference_id,
    future_value_40yr_cents
  ) VALUES (
    NEW.user_id,
    'SAVE',
    NEW.amount_cents,
    new_balance,
    COALESCE(NEW.note, 'Save'),
    NEW.id,
    future_value_40yr
  );
  
  -- The existing trigger on user_ledger will automatically update user_accounts
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS sync_save_event_to_ledger_trigger ON save_events;

-- Create trigger on save_events to auto-create ledger entries
CREATE TRIGGER sync_save_event_to_ledger_trigger
  AFTER INSERT ON save_events
  FOR EACH ROW
  EXECUTE FUNCTION sync_save_event_to_ledger();

-- Enable realtime for user_accounts table (critical for instant updates)
ALTER PUBLICATION supabase_realtime ADD TABLE user_accounts;