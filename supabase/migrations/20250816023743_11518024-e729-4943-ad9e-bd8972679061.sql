-- Create stacklets table for goal-based savings
CREATE TABLE public.stacklets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🎯',
  target_cents INTEGER,
  deadline_date DATE,
  asset_type TEXT NOT NULL DEFAULT 'CASH' CHECK (asset_type IN ('CASH', 'BTC')),
  progress_cents INTEGER NOT NULL DEFAULT 0,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payday_rules table for automation
CREATE TABLE public.payday_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stacklet_id UUID NOT NULL REFERENCES public.stacklets(id) ON DELETE CASCADE,
  trigger_cadence TEXT NOT NULL CHECK (trigger_cadence IN ('weekly', 'biweekly', 'monthly')),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  next_run_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create save_events table (replaces current saves table structure)
CREATE TABLE public.save_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stacklet_id UUID NOT NULL REFERENCES public.stacklets(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'payday_rule', 'challenge', 'match')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_actions table for streaks
CREATE TABLE public.daily_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_date DATE NOT NULL DEFAULT CURRENT_DATE,
  action_type TEXT NOT NULL CHECK (action_type IN ('save', 'no_spend')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, action_date, action_type)
);

-- Create user_streaks table for tracking
CREATE TABLE public.user_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  consecutive_days INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_action_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.stacklets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payday_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.save_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stacklets
CREATE POLICY "Users can manage their own stacklets" ON public.stacklets
FOR ALL USING (user_id = auth.uid());

-- RLS Policies for payday_rules
CREATE POLICY "Users can manage their own payday rules" ON public.payday_rules
FOR ALL USING (user_id = auth.uid());

-- RLS Policies for save_events
CREATE POLICY "Users can manage their own save events" ON public.save_events
FOR ALL USING (user_id = auth.uid());

-- RLS Policies for daily_actions
CREATE POLICY "Users can manage their own daily actions" ON public.daily_actions
FOR ALL USING (user_id = auth.uid());

-- RLS Policies for user_streaks
CREATE POLICY "Users can manage their own streaks" ON public.user_streaks
FOR ALL USING (user_id = auth.uid());

-- Create function to update stacklet progress when save_event is added
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update user streaks
CREATE OR REPLACE FUNCTION update_user_streak(target_user_id UUID)
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for save_events
CREATE TRIGGER save_event_update_progress
  AFTER INSERT ON public.save_events
  FOR EACH ROW
  EXECUTE FUNCTION update_stacklet_progress();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_stacklets_updated_at
  BEFORE UPDATE ON public.stacklets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payday_rules_updated_at
  BEFORE UPDATE ON public.payday_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();