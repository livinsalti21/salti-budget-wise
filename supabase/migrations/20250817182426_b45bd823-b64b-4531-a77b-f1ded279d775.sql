-- Create push metrics table for tracking notification lifecycle
CREATE TABLE IF NOT EXISTS public.push_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL,
  push_id UUID NOT NULL,
  event TEXT NOT NULL CHECK (event IN ('delivered', 'opened', 'save_confirmed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create push events table for tracking generated notifications  
CREATE TABLE IF NOT EXISTS public.push_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('payday', 'roundup', 'streak_guard', 'match_invite')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'acted', 'expired')),
  payload JSONB NOT NULL,
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  acted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create push action logs for snooze/dismiss tracking
CREATE TABLE IF NOT EXISTS public.push_action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  push_event_id UUID NOT NULL REFERENCES public.push_events(id),
  user_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('snooze', 'dismiss', 'open', 'save')),
  action_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create notification settings table
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  quiet_hours_start TIME DEFAULT '21:00:00',
  quiet_hours_end TIME DEFAULT '08:00:00',
  timezone TEXT DEFAULT 'UTC',
  payday_enabled BOOLEAN NOT NULL DEFAULT true,
  roundup_enabled BOOLEAN NOT NULL DEFAULT true,
  streak_enabled BOOLEAN NOT NULL DEFAULT true,
  match_enabled BOOLEAN NOT NULL DEFAULT true,
  max_daily_pushes INTEGER NOT NULL DEFAULT 1,
  max_weekly_pushes INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create roundup tracking table
CREATE TABLE IF NOT EXISTS public.roundup_accumulator (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  accumulated_cents INTEGER NOT NULL DEFAULT 0,
  last_transaction_date DATE,
  auto_convert_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create match invites table
CREATE TABLE IF NOT EXISTS public.match_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL,
  invitee_id UUID NOT NULL,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  message TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.push_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roundup_accumulator ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for push_metrics
CREATE POLICY "Users can view their own push metrics" 
ON public.push_metrics FOR SELECT 
USING (profile_id = auth.uid());

CREATE POLICY "System can insert push metrics" 
ON public.push_metrics FOR INSERT 
WITH CHECK (true);

-- RLS Policies for push_events
CREATE POLICY "Users can view their own push events" 
ON public.push_events FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can manage push events" 
ON public.push_events FOR ALL 
USING (true);

-- RLS Policies for push_action_logs
CREATE POLICY "Users can view their own push actions" 
ON public.push_action_logs FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own push actions" 
ON public.push_action_logs FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- RLS Policies for notification_settings
CREATE POLICY "Users can manage their own notification settings" 
ON public.notification_settings FOR ALL 
USING (user_id = auth.uid());

-- RLS Policies for roundup_accumulator
CREATE POLICY "Users can manage their own roundup data" 
ON public.roundup_accumulator FOR ALL 
USING (user_id = auth.uid());

-- RLS Policies for match_invites
CREATE POLICY "Users can view match invites for them" 
ON public.match_invites FOR SELECT 
USING (invitee_id = auth.uid() OR inviter_id = auth.uid());

CREATE POLICY "Users can create match invites" 
ON public.match_invites FOR INSERT 
WITH CHECK (inviter_id = auth.uid());

CREATE POLICY "Users can update their match invites" 
ON public.match_invites FOR UPDATE 
USING (invitee_id = auth.uid() OR inviter_id = auth.uid());

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_push_events_updated_at
  BEFORE UPDATE ON public.push_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_roundup_accumulator_updated_at
  BEFORE UPDATE ON public.roundup_accumulator
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_match_invites_updated_at
  BEFORE UPDATE ON public.match_invites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_push_metrics_profile_id ON public.push_metrics(profile_id);
CREATE INDEX idx_push_metrics_push_id ON public.push_metrics(push_id);
CREATE INDEX idx_push_events_user_id ON public.push_events(user_id);
CREATE INDEX idx_push_events_type ON public.push_events(type);
CREATE INDEX idx_push_events_status ON public.push_events(status);
CREATE INDEX idx_push_events_scheduled_for ON public.push_events(scheduled_for);
CREATE INDEX idx_notification_settings_user_id ON public.notification_settings(user_id);
CREATE INDEX idx_roundup_accumulator_user_id ON public.roundup_accumulator(user_id);
CREATE INDEX idx_match_invites_invitee_id ON public.match_invites(invitee_id);
CREATE INDEX idx_match_invites_inviter_id ON public.match_invites(inviter_id);