-- Create challenges table
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  entry_fee_cents INTEGER NOT NULL DEFAULT 0,
  prize_pool_cents INTEGER NOT NULL DEFAULT 0,
  max_participants INTEGER DEFAULT 100,
  current_participants INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  challenge_type TEXT NOT NULL DEFAULT 'weekly' CHECK (challenge_type IN ('daily', 'weekly', 'monthly')),
  scoring_rules JSONB NOT NULL DEFAULT '{"consistency_weight": 0.4, "amount_weight": 0.4, "frequency_weight": 0.2}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenge participants table
CREATE TABLE public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_fee_paid_cents INTEGER NOT NULL DEFAULT 0,
  total_saved_cents INTEGER NOT NULL DEFAULT 0,
  save_count INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  score NUMERIC(10,2) NOT NULL DEFAULT 0,
  rank INTEGER,
  reward_cents INTEGER NOT NULL DEFAULT 0,
  reward_claimed BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Create challenge leaderboard view
CREATE VIEW public.challenge_leaderboards AS
SELECT 
  cp.challenge_id,
  cp.user_id,
  cp.score,
  cp.rank,
  cp.total_saved_cents,
  cp.save_count,
  cp.streak_days,
  cp.reward_cents,
  cp.reward_claimed,
  p.display_name,
  p.avatar_url,
  c.title as challenge_title,
  c.status as challenge_status,
  c.end_date as challenge_end_date
FROM public.challenge_participants cp
JOIN public.profiles p ON cp.user_id = p.id
JOIN public.challenges c ON cp.challenge_id = c.id
ORDER BY cp.challenge_id, cp.rank;

-- Create challenge activity log
CREATE TABLE public.challenge_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.challenge_participants(id) ON DELETE CASCADE,
  save_event_id UUID REFERENCES public.save_events(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('joined', 'saved', 'completed', 'won', 'claimed_reward')),
  amount_cents INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for challenges
CREATE POLICY "Challenges are viewable by everyone"
ON public.challenges FOR SELECT
USING (true);

CREATE POLICY "Admins can manage challenges"
ON public.challenges FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for challenge_participants
CREATE POLICY "Users can view participants in challenges they joined"
ON public.challenge_participants FOR SELECT
USING (
  challenge_id IN (
    SELECT challenge_id FROM public.challenge_participants WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can join challenges"
ON public.challenge_participants FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participation"
ON public.challenge_participants FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all participants"
ON public.challenge_participants FOR ALL
USING (true)
WITH CHECK (true);

-- RLS Policies for challenge_activities
CREATE POLICY "Users can view their own challenge activities"
ON public.challenge_activities FOR SELECT
USING (
  participant_id IN (
    SELECT id FROM public.challenge_participants WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage challenge activities"
ON public.challenge_activities FOR ALL
USING (true)
WITH CHECK (true);

-- Function to calculate challenge score
CREATE OR REPLACE FUNCTION public.calculate_challenge_score(
  p_total_saved_cents INTEGER,
  p_save_count INTEGER,
  p_streak_days INTEGER,
  p_scoring_rules JSONB
)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  consistency_weight NUMERIC;
  amount_weight NUMERIC;
  frequency_weight NUMERIC;
  max_saves INTEGER := 50; -- normalize against max expected saves
  max_amount INTEGER := 100000; -- $1000 in cents
  max_streak INTEGER := 7; -- max days in a week
  normalized_amount NUMERIC;
  normalized_frequency NUMERIC;
  normalized_streak NUMERIC;
  final_score NUMERIC;
BEGIN
  -- Extract weights from scoring rules
  consistency_weight := (p_scoring_rules->>'consistency_weight')::NUMERIC;
  amount_weight := (p_scoring_rules->>'amount_weight')::NUMERIC;
  frequency_weight := (p_scoring_rules->>'frequency_weight')::NUMERIC;
  
  -- Normalize metrics (0-1 scale)
  normalized_amount := LEAST(p_total_saved_cents::NUMERIC / max_amount, 1);
  normalized_frequency := LEAST(p_save_count::NUMERIC / max_saves, 1);
  normalized_streak := LEAST(p_streak_days::NUMERIC / max_streak, 1);
  
  -- Calculate weighted score (0-100 scale)
  final_score := (
    (normalized_amount * amount_weight * 100) +
    (normalized_frequency * frequency_weight * 100) +
    (normalized_streak * consistency_weight * 100)
  );
  
  RETURN ROUND(final_score, 2);
END;
$$;

-- Function to update participant rankings
CREATE OR REPLACE FUNCTION public.update_challenge_rankings(p_challenge_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update ranks based on scores
  WITH ranked AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (ORDER BY score DESC, joined_at ASC) as new_rank
    FROM public.challenge_participants
    WHERE challenge_id = p_challenge_id
  )
  UPDATE public.challenge_participants cp
  SET rank = ranked.new_rank,
      updated_at = now()
  FROM ranked
  WHERE cp.id = ranked.id;
END;
$$;

-- Function to distribute challenge rewards
CREATE OR REPLACE FUNCTION public.distribute_challenge_rewards(p_challenge_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_prize_pool INTEGER;
  participant_count INTEGER;
  reward_distribution JSONB;
BEGIN
  -- Get challenge info
  SELECT prize_pool_cents, current_participants
  INTO total_prize_pool, participant_count
  FROM public.challenges
  WHERE id = p_challenge_id;
  
  -- Define reward distribution (top 3 winners)
  -- 1st: 50%, 2nd: 30%, 3rd: 20%
  reward_distribution := jsonb_build_object(
    '1', total_prize_pool * 0.50,
    '2', total_prize_pool * 0.30,
    '3', total_prize_pool * 0.20
  );
  
  -- Update rewards for top 3
  UPDATE public.challenge_participants
  SET reward_cents = CASE
    WHEN rank = 1 THEN (reward_distribution->>'1')::INTEGER
    WHEN rank = 2 THEN (reward_distribution->>'2')::INTEGER
    WHEN rank = 3 THEN (reward_distribution->>'3')::INTEGER
    ELSE 0
  END,
  updated_at = now()
  WHERE challenge_id = p_challenge_id
  AND rank <= 3;
  
  -- Update challenge status
  UPDATE public.challenges
  SET status = 'completed',
      updated_at = now()
  WHERE id = p_challenge_id;
END;
$$;

-- Trigger to update challenge participant count
CREATE OR REPLACE FUNCTION public.update_challenge_participant_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.challenges
    SET current_participants = current_participants + 1,
        prize_pool_cents = prize_pool_cents + NEW.entry_fee_paid_cents,
        updated_at = now()
    WHERE id = NEW.challenge_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.challenges
    SET current_participants = GREATEST(current_participants - 1, 0),
        updated_at = now()
    WHERE id = OLD.challenge_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_challenge_count_trigger
AFTER INSERT OR DELETE ON public.challenge_participants
FOR EACH ROW
EXECUTE FUNCTION public.update_challenge_participant_count();

-- Create indexes for performance
CREATE INDEX idx_challenges_status ON public.challenges(status);
CREATE INDEX idx_challenges_dates ON public.challenges(start_date, end_date);
CREATE INDEX idx_challenge_participants_challenge ON public.challenge_participants(challenge_id);
CREATE INDEX idx_challenge_participants_user ON public.challenge_participants(user_id);
CREATE INDEX idx_challenge_participants_rank ON public.challenge_participants(challenge_id, rank);
CREATE INDEX idx_challenge_activities_challenge ON public.challenge_activities(challenge_id);
CREATE INDEX idx_challenge_activities_participant ON public.challenge_activities(participant_id);