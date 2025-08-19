-- Add plan and subscription fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'Free' CHECK (plan IN ('Free', 'Pro', 'Family')),
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS pro_access_until timestamptz,
ADD COLUMN IF NOT EXISTS bonus_access_until timestamptz,
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC';

-- Create users table for easier access (since auth.users is protected)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can insert their own data" ON users FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (id = auth.uid());

-- Create goals/stacklets if not exists (already exists in schema)
-- stacklets table already exists with proper structure

-- Create daily streaks table for timezone-aware streak tracking
CREATE TABLE IF NOT EXISTS streaks_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_date date NOT NULL,
  save_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, streak_date)
);

ALTER TABLE streaks_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own streaks" ON streaks_daily FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can manage streaks" ON streaks_daily FOR ALL USING (true);

-- Create streak windows for duo/group streaks  
CREATE TABLE IF NOT EXISTS streak_windows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date,
  streak_length integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE streak_windows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their streak windows" ON streak_windows 
  FOR SELECT USING (user_id = auth.uid() OR partner_user_id = auth.uid());
CREATE POLICY "Users can create their streak windows" ON streak_windows 
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Update referrals table to track status properly
ALTER TABLE referrals 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'sent' CHECK (status IN ('sent', 'joined', 'matched_save', 'streak_started')),
ADD COLUMN IF NOT EXISTS referred_user_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create rewards table (scaffold only)
CREATE TABLE IF NOT EXISTS rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_type text NOT NULL CHECK (reward_type IN ('pro_month', 'family_month')),
  reward_reason text,
  months_granted integer DEFAULT 1,
  granted_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_applied boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own rewards" ON rewards FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can manage rewards" ON rewards FOR ALL USING (true);

-- Create leaderboard view for easy querying
CREATE OR REPLACE VIEW leaderboard_weekly AS
SELECT 
  u.id as user_id,
  p.display_name,
  COUNT(s.id) as saves_count,
  SUM(s.amount_cents) as total_saved_cents,
  MAX(ss.current_streak) as current_streak
FROM users u
LEFT JOIN profiles p ON u.id = p.id  
LEFT JOIN saves s ON u.id = s.user_id 
  AND s.created_at >= date_trunc('week', now())
LEFT JOIN save_streaks ss ON u.id = ss.user_id
WHERE p.display_name IS NOT NULL
GROUP BY u.id, p.display_name
ORDER BY saves_count DESC, total_saved_cents DESC;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'streak', 'social')),
  is_read boolean DEFAULT false,
  scheduled_for timestamptz,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can manage notifications" ON notifications FOR ALL USING (true);

-- Create groups and group_members tables if not exists (already exist)