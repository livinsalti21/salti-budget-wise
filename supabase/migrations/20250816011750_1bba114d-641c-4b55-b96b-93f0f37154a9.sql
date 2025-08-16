-- Fix the schema to work with existing tables and add missing components
-- Drop existing tables that need to be recreated with proper structure
DROP TABLE IF EXISTS public.projections CASCADE;

-- Create projections table with proper structure
CREATE TABLE public.projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  save_id UUID NOT NULL REFERENCES public.saves(id) ON DELETE CASCADE,
  years INTEGER NOT NULL CHECK (years > 0 AND years <= 50),
  rate_apr DECIMAL(6,4) NOT NULL DEFAULT 0.08,
  future_value_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create the additional tables that don't exist yet
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  default_apr DECIMAL(6,4) DEFAULT 0.08,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  privacy TEXT DEFAULT 'private' CHECK (privacy IN ('private', 'public')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.save_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_save_id UUID NOT NULL REFERENCES public.saves(id) ON DELETE CASCADE,
  matcher_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matched_save_id UUID REFERENCES public.saves(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  amount_cents INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly')),
  current_length INTEGER DEFAULT 0 CHECK (current_length >= 0),
  longest_length INTEGER DEFAULT 0 CHECK (longest_length >= 0),
  last_save_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, type)
);

CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('save_recorded', 'match_invite', 'match_accepted', 'badge_earned', 'streak_milestone')),
  title TEXT NOT NULL,
  message TEXT,
  payload JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  template_data JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE RESTRICT,
  amount_cents INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  monthly_limit_cents INTEGER,
  color TEXT DEFAULT '#10B981',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.budget_categories(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.save_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
-- Profiles
CREATE POLICY "Users can manage their own profile" ON public.profiles
  FOR ALL USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Projections (linked to saves)
CREATE POLICY "Users can view projections for their saves" ON public.projections
  FOR SELECT USING (EXISTS(SELECT 1 FROM public.saves WHERE saves.id = save_id AND saves.user_id = auth.uid()));

-- Groups
CREATE POLICY "Users can view groups they own or are members of" ON public.groups
  FOR SELECT USING (
    owner_id = auth.uid() OR 
    EXISTS(SELECT 1 FROM public.group_members WHERE group_id = groups.id AND user_id = auth.uid())
  );

CREATE POLICY "Users can manage their own groups" ON public.groups
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own groups" ON public.groups
  FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- Group members
CREATE POLICY "Users can view group memberships for their groups" ON public.group_members
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS(SELECT 1 FROM public.groups WHERE groups.id = group_id AND groups.owner_id = auth.uid())
  );

CREATE POLICY "Group owners can manage memberships" ON public.group_members
  FOR ALL USING (EXISTS(SELECT 1 FROM public.groups WHERE groups.id = group_id AND groups.owner_id = auth.uid()));

-- Save matches
CREATE POLICY "Users can view save matches involving them" ON public.save_matches
  FOR SELECT USING (
    matcher_user_id = auth.uid() OR 
    EXISTS(SELECT 1 FROM public.saves WHERE saves.id = initiator_save_id AND saves.user_id = auth.uid())
  );

CREATE POLICY "Users can create and update save matches for themselves" ON public.save_matches
  FOR ALL USING (matcher_user_id = auth.uid()) WITH CHECK (matcher_user_id = auth.uid());

-- Streaks
CREATE POLICY "Users can manage their own streaks" ON public.streaks
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Badges (public read)
CREATE POLICY "Everyone can view badges" ON public.badges FOR SELECT USING (true);

-- User badges
CREATE POLICY "Users can view their own badges" ON public.user_badges
  FOR SELECT USING (user_id = auth.uid());

-- Notifications
CREATE POLICY "Users can manage their own notifications" ON public.notifications
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Templates (public read)
CREATE POLICY "Everyone can view active templates" ON public.templates
  FOR SELECT USING (is_active = true);

-- Purchases
CREATE POLICY "Users can manage their own purchases" ON public.purchases
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Budget categories
CREATE POLICY "Users can manage their own budget categories" ON public.budget_categories
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Expenses
CREATE POLICY "Users can manage their own expenses" ON public.expenses
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Create functions
CREATE OR REPLACE FUNCTION calculate_projections(save_id_param UUID, amount_cents INTEGER, rate_apr DECIMAL DEFAULT 0.08)
RETURNS VOID AS $$
DECLARE
  years_array INTEGER[] := ARRAY[1, 5, 10, 20, 30];
  year_val INTEGER;
  future_value INTEGER;
BEGIN
  -- Delete existing projections for this save
  DELETE FROM public.projections WHERE save_id = save_id_param;
  
  -- Calculate new projections
  FOREACH year_val IN ARRAY years_array
  LOOP
    future_value := ROUND(amount_cents * POWER(1 + rate_apr, year_val));
    INSERT INTO public.projections (save_id, years, rate_apr, future_value_cents)
    VALUES (save_id_param, year_val, rate_apr, future_value);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update streaks
CREATE OR REPLACE FUNCTION update_user_streaks(user_id_param UUID)
RETURNS VOID AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  daily_streak RECORD;
  last_save_date DATE;
BEGIN
  -- Get the user's last save date
  SELECT DATE(created_at) INTO last_save_date 
  FROM public.saves 
  WHERE user_id = user_id_param 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Update or create daily streak
  SELECT * INTO daily_streak 
  FROM public.streaks 
  WHERE user_id = user_id_param AND type = 'daily';
  
  IF daily_streak IS NULL THEN
    -- Create new daily streak
    INSERT INTO public.streaks (user_id, type, current_length, longest_length, last_save_date, is_active)
    VALUES (user_id_param, 'daily', 1, 1, today_date, true);
  ELSE
    -- Update existing streak
    IF daily_streak.last_save_date = today_date - INTERVAL '1 day' THEN
      -- Continuing streak
      UPDATE public.streaks 
      SET current_length = current_length + 1,
          longest_length = GREATEST(longest_length, current_length + 1),
          last_save_date = today_date,
          is_active = true,
          updated_at = NOW()
      WHERE id = daily_streak.id;
    ELSIF daily_streak.last_save_date = today_date THEN
      -- Same day, no change needed
      UPDATE public.streaks 
      SET last_save_date = today_date,
          updated_at = NOW()
      WHERE id = daily_streak.id;
    ELSE
      -- Streak broken, reset
      UPDATE public.streaks 
      SET current_length = 1,
          last_save_date = today_date,
          is_active = true,
          updated_at = NOW()
      WHERE id = daily_streak.id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges(user_id_param UUID)
RETURNS VOID AS $$
DECLARE
  streak_record RECORD;
  badge_record RECORD;
  save_count INTEGER;
BEGIN
  -- Get user's current streaks
  SELECT * INTO streak_record 
  FROM public.streaks 
  WHERE user_id = user_id_param AND type = 'daily' AND is_active = true;
  
  -- Get total save count
  SELECT COUNT(*) INTO save_count 
  FROM public.saves 
  WHERE user_id = user_id_param;
  
  -- Award streak badges
  IF streak_record.current_length >= 7 THEN
    -- Award 7-day streak badge
    SELECT * INTO badge_record FROM public.badges WHERE code = 'STREAK_7';
    IF badge_record IS NOT NULL THEN
      INSERT INTO public.user_badges (user_id, badge_id)
      VALUES (user_id_param, badge_record.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;
  END IF;
  
  IF streak_record.current_length >= 30 THEN
    -- Award 30-day streak badge
    SELECT * INTO badge_record FROM public.badges WHERE code = 'STREAK_30';
    IF badge_record IS NOT NULL THEN
      INSERT INTO public.user_badges (user_id, badge_id)
      VALUES (user_id_param, badge_record.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;
  END IF;
  
  -- Award first save badge
  IF save_count = 1 THEN
    SELECT * INTO badge_record FROM public.badges WHERE code = 'FIRST_SAVE';
    IF badge_record IS NOT NULL THEN
      INSERT INTO public.user_badges (user_id, badge_id)
      VALUES (user_id_param, badge_record.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for after save insert
CREATE OR REPLACE FUNCTION handle_new_save()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate projections
  PERFORM calculate_projections(NEW.id, NEW.amount_cents);
  
  -- Update streaks
  PERFORM update_user_streaks(NEW.user_id);
  
  -- Check and award badges
  PERFORM check_and_award_badges(NEW.user_id);
  
  -- Create notification
  INSERT INTO public.notifications (user_id, type, title, message, payload)
  VALUES (
    NEW.user_id,
    'save_recorded',
    'Save Recorded! 🎉',
    FORMAT('You saved $%.2f! Keep building your wealth stack.', NEW.amount_cents::DECIMAL / 100),
    jsonb_build_object('save_id', NEW.id, 'amount_cents', NEW.amount_cents)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS after_save_insert ON public.saves;
CREATE TRIGGER after_save_insert
  AFTER INSERT ON public.saves
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_save();

-- Seed badges
INSERT INTO public.badges (code, name, description, icon) VALUES
  ('FIRST_SAVE', 'First Step', 'Made your first save!', '🎯'),
  ('STREAK_7', '7-Day Saver', 'Saved for 7 days in a row', '🔥'),
  ('STREAK_30', '30-Day Builder', 'Saved for 30 days straight', '💪'),
  ('WEEKEND_WARRIOR', 'Weekend Warrior', 'Saved every weekend for a month', '🌅'),
  ('MATCHMAKER', 'Matchmaker', 'Matched a save with a friend', '🤝'),
  ('GROUP_HERO', 'Group Hero', 'Started a group challenge', '👥'),
  ('BIG_IMPACT', 'Future Millionaire', 'Created $1M+ in projected wealth', '💰')
ON CONFLICT (code) DO NOTHING;

-- Seed budget templates
INSERT INTO public.templates (name, description, price_cents, template_data) VALUES
  ('Student Budget Starter', 'Perfect for college students and young adults', 999, '{"categories": [{"name": "Food", "limit": 30000}, {"name": "Entertainment", "limit": 15000}, {"name": "Transportation", "limit": 10000}]}'),
  ('Young Professional', 'Comprehensive budget for early career professionals', 1999, '{"categories": [{"name": "Housing", "limit": 120000}, {"name": "Food", "limit": 40000}, {"name": "Transportation", "limit": 25000}, {"name": "Entertainment", "limit": 20000}, {"name": "Savings", "limit": 50000}]}'),
  ('Family Budget Pro', 'Complete family financial planning template', 2999, '{"categories": [{"name": "Housing", "limit": 200000}, {"name": "Food", "limit": 80000}, {"name": "Childcare", "limit": 100000}, {"name": "Transportation", "limit": 40000}, {"name": "Healthcare", "limit": 30000}, {"name": "Savings", "limit": 100000}]}')
ON CONFLICT DO NOTHING;