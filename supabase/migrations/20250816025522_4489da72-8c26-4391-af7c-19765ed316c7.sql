-- Create badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('first_save', 'streak_days', 'total_saves', 'total_amount', 'stacklets_created')),
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_badges table for earned badges
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Create groups table for challenges
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL,
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE NOT NULL,
  max_members INTEGER DEFAULT 200,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group_members table
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Badges are viewable by everyone" ON public.badges FOR SELECT USING (true);

CREATE POLICY "Users can view their own badges" ON public.user_badges
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own badges" ON public.user_badges
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Groups are viewable by members" ON public.groups
FOR SELECT USING (
  id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  OR owner_id = auth.uid()
);

CREATE POLICY "Users can create groups" ON public.groups
FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Group owners can update groups" ON public.groups
FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Group members can view membership" ON public.group_members
FOR SELECT USING (
  group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  OR user_id = auth.uid()
);

CREATE POLICY "Users can join groups" ON public.group_members
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave groups" ON public.group_members
FOR DELETE USING (user_id = auth.uid());

-- Function to check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
  badge_record RECORD;
  user_stats RECORD;
BEGIN
  -- Get user statistics
  SELECT 
    (SELECT COUNT(*) FROM public.save_events WHERE user_id = target_user_id) as total_saves,
    (SELECT COALESCE(SUM(amount_cents), 0) FROM public.save_events WHERE user_id = target_user_id) as total_amount,
    (SELECT COUNT(*) FROM public.stacklets WHERE user_id = target_user_id) as stacklets_created,
    (SELECT COALESCE(consecutive_days, 0) FROM public.user_streaks WHERE user_id = target_user_id) as streak_days
  INTO user_stats;

  -- Check each badge requirement
  FOR badge_record IN 
    SELECT b.* FROM public.badges b
    WHERE b.id NOT IN (SELECT badge_id FROM public.user_badges WHERE user_id = target_user_id)
  LOOP
    -- Check if user meets the requirement
    CASE badge_record.requirement_type
      WHEN 'first_save' THEN
        IF user_stats.total_saves >= badge_record.requirement_value THEN
          INSERT INTO public.user_badges (user_id, badge_id) VALUES (target_user_id, badge_record.id);
        END IF;
      WHEN 'streak_days' THEN
        IF user_stats.streak_days >= badge_record.requirement_value THEN
          INSERT INTO public.user_badges (user_id, badge_id) VALUES (target_user_id, badge_record.id);
        END IF;
      WHEN 'total_saves' THEN
        IF user_stats.total_saves >= badge_record.requirement_value THEN
          INSERT INTO public.user_badges (user_id, badge_id) VALUES (target_user_id, badge_record.id);
        END IF;
      WHEN 'total_amount' THEN
        IF user_stats.total_amount >= badge_record.requirement_value THEN
          INSERT INTO public.user_badges (user_id, badge_id) VALUES (target_user_id, badge_record.id);
        END IF;
      WHEN 'stacklets_created' THEN
        IF user_stats.stacklets_created >= badge_record.requirement_value THEN
          INSERT INTO public.user_badges (user_id, badge_id) VALUES (target_user_id, badge_record.id);
        END IF;
    END CASE;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Update the save event trigger to also check badges
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Insert initial badges
INSERT INTO public.badges (name, description, icon, requirement_type, requirement_value) VALUES
('First Stack', 'Made your very first save!', '🎯', 'first_save', 1),
('Consistent Saver', 'Saved for 7 days in a row', '🔥', 'streak_days', 7),
('Stack Master', 'Saved 25 times', '💪', 'total_saves', 25),
('Goal Setter', 'Created 3 stacklets', '🎪', 'stacklets_created', 3),
('Century Club', 'Saved over $100 total', '💯', 'total_amount', 10000),
('Streak Legend', 'Maintained a 30-day streak', '⚡', 'streak_days', 30),
('Stack Millionaire', 'Saved over $1000 total', '💎', 'total_amount', 100000),
('Habit Former', 'Saved for 14 days in a row', '✨', 'streak_days', 14);

-- Generate unique group codes function
CREATE OR REPLACE FUNCTION generate_group_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 6-character code with numbers and uppercase letters
    code := upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.groups WHERE code = code) INTO exists;
    
    -- Exit loop if code is unique
    IF NOT exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;