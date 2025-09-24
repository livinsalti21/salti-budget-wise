-- Create user ledger system
CREATE TABLE public.user_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('SAVE', 'MATCH_RECEIVED', 'ADJUSTMENT')),
  amount_cents INTEGER NOT NULL,
  running_balance_cents BIGINT NOT NULL,
  description TEXT,
  reference_id UUID, -- References save_events.id or match_events.id
  future_value_40yr_cents BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user accounts summary table
CREATE TABLE public.user_accounts (
  user_id UUID NOT NULL PRIMARY KEY,
  account_type TEXT NOT NULL DEFAULT 'TOTAL' CHECK (account_type IN ('SAVES', 'MATCHES', 'TOTAL')),
  current_balance_cents BIGINT NOT NULL DEFAULT 0,
  total_inflow_cents BIGINT NOT NULL DEFAULT 0,
  total_outflow_cents BIGINT NOT NULL DEFAULT 0,
  last_transaction_at TIMESTAMP WITH TIME ZONE,
  projected_40yr_value_cents BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sponsor ledger system
CREATE TABLE public.sponsor_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id UUID NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('MATCH_SENT', 'CHARGE', 'REFUND')),
  amount_cents INTEGER NOT NULL,
  running_balance_cents BIGINT NOT NULL,
  recipient_user_id UUID,
  match_event_id UUID,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sponsor accounts summary table
CREATE TABLE public.sponsor_accounts (
  sponsor_id UUID NOT NULL PRIMARY KEY,
  total_matched_cents BIGINT NOT NULL DEFAULT 0,
  total_charged_cents BIGINT NOT NULL DEFAULT 0,
  current_outstanding_cents BIGINT NOT NULL DEFAULT 0,
  last_transaction_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all ledger tables
ALTER TABLE public.user_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_ledger
CREATE POLICY "Users can view their own ledger entries" 
ON public.user_ledger 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Service role can manage user ledger" 
ON public.user_ledger 
FOR ALL 
USING (true)
WITH CHECK (true);

-- RLS Policies for user_accounts
CREATE POLICY "Users can view their own account summary" 
ON public.user_accounts 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Service role can manage user accounts" 
ON public.user_accounts 
FOR ALL 
USING (true)
WITH CHECK (true);

-- RLS Policies for sponsor_ledger
CREATE POLICY "Sponsors can view their own ledger entries" 
ON public.sponsor_ledger 
FOR SELECT 
USING (sponsor_id IN (SELECT id FROM sponsors WHERE email = auth.email()));

CREATE POLICY "Service role can manage sponsor ledger" 
ON public.sponsor_ledger 
FOR ALL 
USING (true)
WITH CHECK (true);

-- RLS Policies for sponsor_accounts
CREATE POLICY "Sponsors can view their own account summary" 
ON public.sponsor_accounts 
FOR SELECT 
USING (sponsor_id IN (SELECT id FROM sponsors WHERE email = auth.email()));

CREATE POLICY "Service role can manage sponsor accounts" 
ON public.sponsor_accounts 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_user_ledger_user_id_created_at ON public.user_ledger(user_id, created_at DESC);
CREATE INDEX idx_user_ledger_reference_id ON public.user_ledger(reference_id);
CREATE INDEX idx_sponsor_ledger_sponsor_id_created_at ON public.sponsor_ledger(sponsor_id, created_at DESC);
CREATE INDEX idx_sponsor_ledger_match_event_id ON public.sponsor_ledger(match_event_id);

-- Create function to update user account balances
CREATE OR REPLACE FUNCTION public.update_user_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or create user account record
  INSERT INTO public.user_accounts (
    user_id,
    current_balance_cents,
    total_inflow_cents,
    last_transaction_at,
    projected_40yr_value_cents,
    updated_at
  ) VALUES (
    NEW.user_id,
    NEW.running_balance_cents,
    NEW.amount_cents,
    NEW.created_at,
    NEW.future_value_40yr_cents,
    now()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    current_balance_cents = NEW.running_balance_cents,
    total_inflow_cents = user_accounts.total_inflow_cents + NEW.amount_cents,
    last_transaction_at = NEW.created_at,
    projected_40yr_value_cents = user_accounts.projected_40yr_value_cents + NEW.future_value_40yr_cents,
    updated_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for user account balance updates
CREATE TRIGGER update_user_account_balance_trigger
  AFTER INSERT ON public.user_ledger
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_account_balance();

-- Create function to update sponsor account balances
CREATE OR REPLACE FUNCTION public.update_sponsor_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or create sponsor account record
  INSERT INTO public.sponsor_accounts (
    sponsor_id,
    total_matched_cents,
    total_charged_cents,
    current_outstanding_cents,
    last_transaction_at,
    updated_at
  ) VALUES (
    NEW.sponsor_id,
    CASE WHEN NEW.transaction_type = 'MATCH_SENT' THEN NEW.amount_cents ELSE 0 END,
    CASE WHEN NEW.transaction_type = 'CHARGE' THEN NEW.amount_cents ELSE 0 END,
    NEW.running_balance_cents,
    NEW.created_at,
    now()
  )
  ON CONFLICT (sponsor_id) 
  DO UPDATE SET
    total_matched_cents = sponsor_accounts.total_matched_cents + 
      CASE WHEN NEW.transaction_type = 'MATCH_SENT' THEN NEW.amount_cents ELSE 0 END,
    total_charged_cents = sponsor_accounts.total_charged_cents + 
      CASE WHEN NEW.transaction_type = 'CHARGE' THEN NEW.amount_cents ELSE 0 END,
    current_outstanding_cents = NEW.running_balance_cents,
    last_transaction_at = NEW.created_at,
    updated_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for sponsor account balance updates
CREATE TRIGGER update_sponsor_account_balance_trigger
  AFTER INSERT ON public.sponsor_ledger
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sponsor_account_balance();