-- Update saves table to support public visibility for social features
ALTER TABLE public.saves ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'friends', 'public'));

-- Make saves viewable publicly when visibility is public
CREATE POLICY "Public can view public saves" 
ON public.saves 
FOR SELECT 
USING (visibility = 'public');

-- Update save_matches policies to allow public viewing for social features
CREATE POLICY "Public can view save matches" 
ON public.save_matches 
FOR SELECT 
USING (true);

-- Update save_likes policies for public viewing
CREATE POLICY "Public can view save likes" 
ON public.save_likes 
FOR SELECT 
USING (true);

-- Update save_comments policies for public viewing
CREATE POLICY "Public can view save comments" 
ON public.save_comments 
FOR SELECT 
USING (true);

-- Create friends table for social connections
CREATE TABLE public.friends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  addressee_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

-- Enable RLS for friends
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Create policies for friends
CREATE POLICY "Users can view their friend requests" 
ON public.friends 
FOR SELECT 
USING (requester_id = auth.uid() OR addressee_id = auth.uid());

CREATE POLICY "Users can create friend requests" 
ON public.friends 
FOR INSERT 
WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update friend requests they're involved in" 
ON public.friends 
FOR UPDATE 
USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- Create achievements table for gamification
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  requirement_type TEXT NOT NULL, -- 'saves_count', 'total_amount', 'streak', 'matches_received'
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for achievements (public viewing)
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements" 
ON public.achievements 
FOR SELECT 
USING (true);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS for user_achievements
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can earn achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Create notifications table for real-time updates
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'friend_request', 'save_matched', 'achievement_earned'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (user_id = auth.uid());

-- Add trigger for friends updated_at
CREATE TRIGGER update_friends_updated_at
BEFORE UPDATE ON public.friends
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, requirement_type, requirement_value) VALUES
('First Save', 'Complete your first Save & Stack', '🎯', 'saves_count', 1),
('Save Streak', 'Save 5 times in a row', '🔥', 'saves_count', 5),
('Big Saver', 'Save $100 total', '💰', 'total_amount', 10000),
('Social Saver', 'Receive your first match', '👥', 'matches_received', 1),
('Milestone Master', 'Complete 25 saves', '⭐', 'saves_count', 25),
('Century Club', 'Save $1000 total', '💎', 'total_amount', 100000);

-- Create referrals table for viral growth
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referrals are viewable by everyone" 
ON public.referrals 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own referral" 
ON public.referrals 
FOR INSERT 
WITH CHECK (referrer_id = auth.uid());

CREATE POLICY "Users can manage their own referral" 
ON public.referrals 
FOR UPDATE 
USING (referrer_id = auth.uid());

-- Create referral_events table for tracking
CREATE TABLE public.referral_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_id UUID NOT NULL,
  event_type TEXT NOT NULL, -- 'signup', 'first_save'
  referred_user_id UUID,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB
);

-- Enable RLS for referral_events
ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referrers/admins can view referral events" 
ON public.referral_events 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM referrals r 
  WHERE r.id = referral_events.referral_id 
  AND r.referrer_id = auth.uid()
));

CREATE POLICY "Referrers/admins can insert referral events" 
ON public.referral_events 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM referrals r 
  WHERE r.id = referral_events.referral_id 
  AND r.referrer_id = auth.uid()
));

-- Add match status enum for save_matches
DO $$ BEGIN
    CREATE TYPE match_status AS ENUM ('pledged', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update save_matches table to use enum
ALTER TABLE public.save_matches 
ALTER COLUMN status TYPE match_status USING status::match_status;