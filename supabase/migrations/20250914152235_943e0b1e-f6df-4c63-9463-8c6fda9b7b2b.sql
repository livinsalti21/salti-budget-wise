-- Create friend connections table
CREATE TABLE public.friend_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  friend_user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_user_id)
);

-- Create friend matches table (different from sponsor matches)
CREATE TABLE public.friend_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_save_event_id UUID NOT NULL,
  matching_save_event_id UUID NOT NULL,
  original_user_id UUID NOT NULL,
  matching_user_id UUID NOT NULL,
  original_amount_cents INTEGER NOT NULL,
  matching_amount_cents INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(original_save_event_id, matching_user_id)
);

-- Create streak types table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.streak_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  streak_type TEXT NOT NULL CHECK (streak_type IN ('self', 'friends', 'community', 'sponsors')),
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, streak_type)
);

-- Enable RLS on new tables
ALTER TABLE public.friend_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_types ENABLE ROW LEVEL SECURITY;

-- RLS policies for friend_connections
CREATE POLICY "Users can view their own friend connections"
  ON public.friend_connections FOR SELECT
  USING (user_id = auth.uid() OR friend_user_id = auth.uid());

CREATE POLICY "Users can create friend connections"
  ON public.friend_connections FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own friend connections"
  ON public.friend_connections FOR UPDATE
  USING (user_id = auth.uid() OR friend_user_id = auth.uid());

-- RLS policies for friend_matches
CREATE POLICY "Users can view friend matches involving them"
  ON public.friend_matches FOR SELECT
  USING (original_user_id = auth.uid() OR matching_user_id = auth.uid());

CREATE POLICY "Users can create friend matches for their saves"
  ON public.friend_matches FOR INSERT
  WITH CHECK (matching_user_id = auth.uid());

-- RLS policies for streak_types
CREATE POLICY "Users can manage their own streak types"
  ON public.streak_types FOR ALL
  USING (user_id = auth.uid());

-- Add triggers for updated_at
CREATE TRIGGER update_friend_connections_updated_at
  BEFORE UPDATE ON public.friend_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_streak_types_updated_at
  BEFORE UPDATE ON public.streak_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update friend streaks when friend matches occur
CREATE OR REPLACE FUNCTION public.update_friend_streaks(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_date_local DATE := CURRENT_DATE;
  consecutive_count INTEGER := 0;
  temp_date DATE;
BEGIN
  -- Calculate consecutive days where user saved AND at least one friend matched
  temp_date := current_date_local;
  WHILE EXISTS (
    SELECT 1 FROM public.save_events se
    WHERE se.user_id = target_user_id 
    AND se.created_at::date = temp_date
    AND EXISTS (
      SELECT 1 FROM public.friend_matches fm
      WHERE fm.original_save_event_id = se.id
      AND fm.created_at::date = temp_date
    )
  ) LOOP
    consecutive_count := consecutive_count + 1;
    temp_date := temp_date - INTERVAL '1 day';
  END LOOP;
  
  -- Update friend streak type
  INSERT INTO public.streak_types (user_id, streak_type, current_streak, longest_streak, last_activity_date, is_active)
  VALUES (target_user_id, 'friends', consecutive_count, consecutive_count, current_date_local, consecutive_count > 0)
  ON CONFLICT (user_id, streak_type) 
  DO UPDATE SET
    current_streak = consecutive_count,
    longest_streak = GREATEST(streak_types.longest_streak, consecutive_count),
    last_activity_date = current_date_local,
    is_active = (consecutive_count > 0),
    updated_at = now();
END;
$$;

-- Function to handle friend match creation and streak updates
CREATE OR REPLACE FUNCTION public.handle_friend_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update friend streaks for both users involved in the match
  PERFORM update_friend_streaks(NEW.original_user_id);
  PERFORM update_friend_streaks(NEW.matching_user_id);
  
  RETURN NEW;
END;
$$;

-- Trigger to update friend streaks when friend matches are created
CREATE TRIGGER friend_match_streak_trigger
  AFTER INSERT ON public.friend_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_friend_match();