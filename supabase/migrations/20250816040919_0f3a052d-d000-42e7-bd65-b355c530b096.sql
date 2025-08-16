-- Create sponsors table for family/friends who want to match saves
CREATE TABLE public.sponsors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create match_rules table for sponsor matching rules
CREATE TABLE public.match_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id UUID NOT NULL REFERENCES public.sponsors(id) ON DELETE CASCADE,
  recipient_user_id UUID NOT NULL,
  percent INTEGER NOT NULL CHECK (percent >= 1 AND percent <= 100),
  cap_cents_weekly INTEGER NOT NULL DEFAULT 2500,
  asset_type TEXT NOT NULL DEFAULT 'CASH' CHECK (asset_type IN ('CASH', 'BTC')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create match_events table to track actual matches
CREATE TABLE public.match_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_rule_id UUID NOT NULL REFERENCES public.match_rules(id) ON DELETE CASCADE,
  save_event_id UUID NOT NULL REFERENCES public.save_events(id) ON DELETE CASCADE,
  sponsor_id UUID NOT NULL REFERENCES public.sponsors(id) ON DELETE CASCADE,
  recipient_user_id UUID NOT NULL,
  original_amount_cents INTEGER NOT NULL,
  match_amount_cents INTEGER NOT NULL,
  charge_status TEXT NOT NULL DEFAULT 'pending' CHECK (charge_status IN ('pending', 'succeeded', 'failed', 'retry')),
  stripe_payment_intent_id TEXT,
  btc_trade_id TEXT,
  btc_quantity DECIMAL,
  btc_price_usd DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user onboarding suggestions table
CREATE TABLE public.onboarding_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('stacklet', 'payday_rule')),
  title TEXT NOT NULL,
  emoji TEXT,
  target_cents INTEGER,
  amount_cents INTEGER,
  cadence TEXT,
  is_applied BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sponsors
CREATE POLICY "Sponsors can view their own data" ON public.sponsors
FOR SELECT USING (email = auth.email());

CREATE POLICY "Sponsors can insert their own data" ON public.sponsors
FOR INSERT WITH CHECK (email = auth.email());

CREATE POLICY "Sponsors can update their own data" ON public.sponsors
FOR UPDATE USING (email = auth.email());

-- RLS Policies for match_rules
CREATE POLICY "Sponsors can manage their own match rules" ON public.match_rules
FOR ALL USING (
  sponsor_id IN (SELECT id FROM public.sponsors WHERE email = auth.email())
);

CREATE POLICY "Recipients can view match rules for them" ON public.match_rules
FOR SELECT USING (recipient_user_id = auth.uid());

-- RLS Policies for match_events
CREATE POLICY "Sponsors can view their own match events" ON public.match_events
FOR SELECT USING (
  sponsor_id IN (SELECT id FROM public.sponsors WHERE email = auth.email())
);

CREATE POLICY "Recipients can view their own match events" ON public.match_events
FOR SELECT USING (recipient_user_id = auth.uid());

CREATE POLICY "System can insert match events" ON public.match_events
FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update match events" ON public.match_events
FOR UPDATE USING (true);

-- RLS Policies for onboarding suggestions
CREATE POLICY "Users can manage their own onboarding suggestions" ON public.onboarding_suggestions
FOR ALL USING (user_id = auth.uid());

-- Function to get weekly spend for match rule caps
CREATE OR REPLACE FUNCTION get_weekly_match_spend(rule_id UUID, week_start DATE)
RETURNS INTEGER AS $$
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
$$ LANGUAGE plpgsql;

-- Function to create onboarding suggestions for new users
CREATE OR REPLACE FUNCTION create_onboarding_suggestions(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Create suggested stacklets
  INSERT INTO public.onboarding_suggestions (user_id, suggestion_type, title, emoji, target_cents) VALUES
  (target_user_id, 'stacklet', 'Emergency Fund', '🛡️', 100000),
  (target_user_id, 'stacklet', 'Spring Break Trip', '🌴', 50000);
  
  -- Create suggested payday rule
  INSERT INTO public.onboarding_suggestions (user_id, suggestion_type, title, amount_cents, cadence) VALUES
  (target_user_id, 'payday_rule', 'Weekly Auto-Save', 2500, 'weekly');
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers
CREATE TRIGGER update_match_rules_updated_at
  BEFORE UPDATE ON public.match_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_match_events_updated_at
  BEFORE UPDATE ON public.match_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();