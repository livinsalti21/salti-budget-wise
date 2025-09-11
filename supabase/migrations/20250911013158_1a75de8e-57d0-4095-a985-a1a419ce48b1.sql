-- Create sponsor growth tracking tables

-- Table to store historical growth data for each sponsee
CREATE TABLE public.sponsor_growth_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id UUID NOT NULL REFERENCES public.sponsors(id) ON DELETE CASCADE,
  recipient_user_id UUID NOT NULL,
  match_rule_id UUID NOT NULL REFERENCES public.match_rules(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_matched_cents INTEGER NOT NULL DEFAULT 0,
  save_events_count INTEGER NOT NULL DEFAULT 0,
  average_save_cents INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  growth_rate DECIMAL(5,4) DEFAULT 0, -- e.g., 0.0800 for 8%
  projected_value_cents BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table to store periodic snapshots of key metrics
CREATE TABLE public.sponsor_metrics_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id UUID NOT NULL REFERENCES public.sponsors(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  total_sponsees INTEGER NOT NULL DEFAULT 0,
  active_sponsees INTEGER NOT NULL DEFAULT 0,
  total_matched_cents BIGINT NOT NULL DEFAULT 0,
  total_saves_matched INTEGER NOT NULL DEFAULT 0,
  average_match_per_sponsee_cents INTEGER NOT NULL DEFAULT 0,
  compound_growth_projection_1yr BIGINT NOT NULL DEFAULT 0,
  compound_growth_projection_5yr BIGINT NOT NULL DEFAULT 0,
  compound_growth_projection_10yr BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.sponsor_growth_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_metrics_snapshots ENABLE ROW LEVEL SECURITY;

-- Create policies for sponsor_growth_tracking
CREATE POLICY "Sponsors can view their own growth tracking" 
  ON public.sponsor_growth_tracking
  FOR SELECT
  USING (sponsor_id IN (
    SELECT id FROM public.sponsors WHERE email = auth.email()
  ));

CREATE POLICY "System can manage growth tracking" 
  ON public.sponsor_growth_tracking
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create policies for sponsor_metrics_snapshots
CREATE POLICY "Sponsors can view their own metrics snapshots" 
  ON public.sponsor_metrics_snapshots
  FOR SELECT
  USING (sponsor_id IN (
    SELECT id FROM public.sponsors WHERE email = auth.email()
  ));

CREATE POLICY "System can manage metrics snapshots" 
  ON public.sponsor_metrics_snapshots
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_sponsor_growth_tracking_sponsor_id ON public.sponsor_growth_tracking(sponsor_id);
CREATE INDEX idx_sponsor_growth_tracking_period ON public.sponsor_growth_tracking(period_start, period_end);
CREATE INDEX idx_sponsor_growth_tracking_recipient ON public.sponsor_growth_tracking(recipient_user_id);

CREATE INDEX idx_sponsor_metrics_snapshots_sponsor_id ON public.sponsor_metrics_snapshots(sponsor_id);
CREATE INDEX idx_sponsor_metrics_snapshots_date ON public.sponsor_metrics_snapshots(snapshot_date DESC);

-- Add triggers to update timestamps
CREATE TRIGGER update_sponsor_growth_tracking_updated_at
  BEFORE UPDATE ON public.sponsor_growth_tracking
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate and store growth metrics
CREATE OR REPLACE FUNCTION public.calculate_sponsor_growth_metrics(target_sponsor_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_date_val DATE := CURRENT_DATE;
  week_start_val DATE := current_date_val - INTERVAL '7 days';
  month_start_val DATE := current_date_val - INTERVAL '30 days';
  annual_growth_rate DECIMAL := 0.08; -- 8% annual return assumption
BEGIN
  -- Calculate weekly growth tracking for each active match rule
  INSERT INTO public.sponsor_growth_tracking (
    sponsor_id,
    recipient_user_id,
    match_rule_id,
    period_start,
    period_end,
    total_matched_cents,
    save_events_count,
    average_save_cents,
    streak_days,
    growth_rate,
    projected_value_cents
  )
  SELECT 
    mr.sponsor_id,
    mr.recipient_user_id,
    mr.id,
    week_start_val,
    current_date_val,
    COALESCE(SUM(me.match_amount_cents), 0),
    COUNT(me.id),
    COALESCE(AVG(me.original_amount_cents), 0),
    COALESCE(us.consecutive_days, 0),
    annual_growth_rate,
    -- Calculate projected value with compound interest
    CASE 
      WHEN COALESCE(SUM(me.match_amount_cents), 0) > 0 THEN
        (COALESCE(SUM(me.match_amount_cents), 0) * POWER(1 + annual_growth_rate, 1))::BIGINT
      ELSE 0
    END
  FROM public.match_rules mr
  LEFT JOIN public.match_events me ON mr.id = me.match_rule_id 
    AND me.created_at >= week_start_val::TIMESTAMP
    AND me.created_at < (current_date_val + INTERVAL '1 day')::TIMESTAMP
    AND me.charge_status = 'succeeded'
  LEFT JOIN public.user_streaks us ON mr.recipient_user_id = us.user_id
  WHERE mr.sponsor_id = target_sponsor_id 
    AND mr.status = 'active'
  GROUP BY mr.sponsor_id, mr.recipient_user_id, mr.id, us.consecutive_days
  ON CONFLICT (sponsor_id, recipient_user_id, period_start, period_end) 
  DO UPDATE SET
    total_matched_cents = EXCLUDED.total_matched_cents,
    save_events_count = EXCLUDED.save_events_count,
    average_save_cents = EXCLUDED.average_save_cents,
    streak_days = EXCLUDED.streak_days,
    projected_value_cents = EXCLUDED.projected_value_cents,
    updated_at = now();

  -- Create/update sponsor metrics snapshot
  INSERT INTO public.sponsor_metrics_snapshots (
    sponsor_id,
    snapshot_date,
    total_sponsees,
    active_sponsees,
    total_matched_cents,
    total_saves_matched,
    average_match_per_sponsee_cents,
    compound_growth_projection_1yr,
    compound_growth_projection_5yr,
    compound_growth_projection_10yr
  )
  SELECT
    target_sponsor_id,
    current_date_val,
    COUNT(DISTINCT mr.recipient_user_id),
    COUNT(DISTINCT CASE WHEN us.consecutive_days > 0 THEN mr.recipient_user_id END),
    COALESCE(SUM(all_me.match_amount_cents), 0),
    COUNT(all_me.id),
    CASE 
      WHEN COUNT(DISTINCT mr.recipient_user_id) > 0 THEN
        COALESCE(SUM(all_me.match_amount_cents), 0) / COUNT(DISTINCT mr.recipient_user_id)
      ELSE 0
    END,
    -- 1 year projection
    (COALESCE(SUM(all_me.match_amount_cents), 0) * POWER(1 + annual_growth_rate, 1))::BIGINT,
    -- 5 year projection  
    (COALESCE(SUM(all_me.match_amount_cents), 0) * POWER(1 + annual_growth_rate, 5))::BIGINT,
    -- 10 year projection
    (COALESCE(SUM(all_me.match_amount_cents), 0) * POWER(1 + annual_growth_rate, 10))::BIGINT
  FROM public.match_rules mr
  LEFT JOIN public.match_events all_me ON mr.id = all_me.match_rule_id 
    AND all_me.charge_status = 'succeeded'
  LEFT JOIN public.user_streaks us ON mr.recipient_user_id = us.user_id
  WHERE mr.sponsor_id = target_sponsor_id 
    AND mr.status = 'active'
  ON CONFLICT (sponsor_id, snapshot_date)
  DO UPDATE SET
    total_sponsees = EXCLUDED.total_sponsees,
    active_sponsees = EXCLUDED.active_sponsees,
    total_matched_cents = EXCLUDED.total_matched_cents,
    total_saves_matched = EXCLUDED.total_saves_matched,
    average_match_per_sponsee_cents = EXCLUDED.average_match_per_sponsee_cents,
    compound_growth_projection_1yr = EXCLUDED.compound_growth_projection_1yr,
    compound_growth_projection_5yr = EXCLUDED.compound_growth_projection_5yr,
    compound_growth_projection_10yr = EXCLUDED.compound_growth_projection_10yr;
END;
$$;

-- Add unique constraint to prevent duplicate tracking records
ALTER TABLE public.sponsor_growth_tracking 
ADD CONSTRAINT unique_sponsor_growth_period 
UNIQUE (sponsor_id, recipient_user_id, period_start, period_end);

ALTER TABLE public.sponsor_metrics_snapshots 
ADD CONSTRAINT unique_sponsor_metrics_snapshot 
UNIQUE (sponsor_id, snapshot_date);

-- Comment tables for documentation
COMMENT ON TABLE public.sponsor_growth_tracking IS 'Historical growth tracking data for individual sponsees';
COMMENT ON TABLE public.sponsor_metrics_snapshots IS 'Periodic snapshots of sponsor performance metrics';