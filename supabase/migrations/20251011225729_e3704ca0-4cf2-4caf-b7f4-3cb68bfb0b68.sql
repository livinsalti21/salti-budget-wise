-- Update sync_save_event_to_ledger function to use 10% annual return
CREATE OR REPLACE FUNCTION public.sync_save_event_to_ledger()
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
  -- Calculate 40-year future value with 10% annual return
  future_value_40yr := ROUND(NEW.amount_cents * POWER(1.10, 40));
  
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
  
  RETURN NEW;
END;
$$;