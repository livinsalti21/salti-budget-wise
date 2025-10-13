-- ============================================
-- Security Fixes for ERROR-Level Issues
-- ============================================
-- Addresses critical security vulnerabilities identified in security scan

-- ============================================
-- 1. Fix user_ledger_detailed view - Add user isolation filter
-- ============================================

CREATE OR REPLACE VIEW public.user_ledger_detailed AS
SELECT 
  ul.id,
  ul.user_id,
  ul.transaction_type,
  ul.amount_cents,
  ul.running_balance_cents,
  ul.description,
  ul.reference_id,
  ul.future_value_40yr_cents,
  ul.created_at,
  
  -- Sponsor match details
  CASE 
    WHEN ul.transaction_type = 'MATCH_RECEIVED' AND ul.reference_id IS NOT NULL THEN
      (SELECT s.name 
       FROM match_events me 
       JOIN sponsors s ON me.sponsor_id = s.id 
       WHERE me.id = ul.reference_id::uuid)
    ELSE NULL
  END as sponsor_name,
  
  CASE 
    WHEN ul.transaction_type = 'MATCH_RECEIVED' AND ul.reference_id IS NOT NULL THEN
      (SELECT me.original_amount_cents 
       FROM match_events me 
       WHERE me.id = ul.reference_id::uuid)
    ELSE NULL
  END as original_save_amount_cents,
  
  -- Friend match indicator
  CASE 
    WHEN ul.transaction_type = 'SAVE' AND EXISTS(
      SELECT 1 FROM friend_matches fm
      WHERE fm.matching_save_event_id = ul.reference_id::uuid
         OR fm.original_save_event_id = ul.reference_id::uuid
    ) THEN true
    ELSE false
  END as has_friend_match,
  
  -- Friend name
  CASE 
    WHEN ul.transaction_type = 'SAVE' THEN
      (SELECT p.display_name 
       FROM friend_matches fm
       JOIN profiles p ON (
         CASE 
           WHEN fm.matching_save_event_id = ul.reference_id::uuid THEN fm.original_user_id
           WHEN fm.original_save_event_id = ul.reference_id::uuid THEN fm.matching_user_id
           ELSE NULL
         END = p.id
       )
       WHERE fm.matching_save_event_id = ul.reference_id::uuid
          OR fm.original_save_event_id = ul.reference_id::uuid
       LIMIT 1)
    ELSE NULL
  END as friend_match_name
  
FROM user_ledger ul
WHERE ul.user_id = auth.uid(); -- CRITICAL: Add user isolation filter

-- Grant SELECT to authenticated users
GRANT SELECT ON public.user_ledger_detailed TO authenticated;

-- ============================================
-- 2. Add RLS policies to sponsors table
-- ============================================

-- Enable RLS if not already enabled
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

-- Drop existing overly permissive policies if they exist
DROP POLICY IF EXISTS "System can manage sponsors" ON sponsors;

-- Policy 1: Admins can manage all sponsors
CREATE POLICY "Admins can manage sponsors"
ON sponsors FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Policy 2: Sponsors can view their own data
CREATE POLICY "Sponsors view own data"
ON sponsors FOR SELECT TO authenticated
USING (email = auth.email());

-- Policy 3: Service role for system operations
CREATE POLICY "Service role full access to sponsors"
ON sponsors FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- ============================================
-- 3. Protect subscription plan from client modification
-- ============================================

-- Drop existing policies on profiles that might conflict
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Recreate with subscription protection
CREATE POLICY "Users can update own profile except subscription"
ON profiles FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid() AND
  -- Prevent users from changing their own subscription
  plan = (SELECT plan FROM profiles WHERE id = auth.uid()) AND
  stripe_customer_id = (SELECT stripe_customer_id FROM profiles WHERE id = auth.uid()) AND
  pro_access_until = (SELECT pro_access_until FROM profiles WHERE id = auth.uid()) AND
  bonus_access_until = (SELECT bonus_access_until FROM profiles WHERE id = auth.uid())
);

-- ============================================
-- 4. Add RLS policy for premium budget templates
-- ============================================

-- Drop existing permissive policy
DROP POLICY IF EXISTS "Templates are viewable by authenticated users" ON budget_templates;

-- Recreate with subscription check
CREATE POLICY "Templates viewable based on subscription"
ON budget_templates FOR SELECT TO authenticated
USING (
  is_active = true AND (
    price_cents = 0 OR -- Free templates
    EXISTS(
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND (plan IN ('Pro', 'Family') 
           OR pro_access_until > now()
           OR bonus_access_until > now())
    )
  )
);

-- ============================================
-- 5. Fix encryption_keys table permissions
-- ============================================

-- Drop overly restrictive policies
DROP POLICY IF EXISTS "Absolute lockdown - encryption_keys public access" ON encryption_keys;
DROP POLICY IF EXISTS "Complete lockdown - encryption keys" ON encryption_keys;

-- Allow service role only
CREATE POLICY "Service role only - encryption keys"
ON encryption_keys FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- Explicitly deny all other roles
CREATE POLICY "Deny authenticated users - encryption keys"
ON encryption_keys FOR ALL TO authenticated
USING (false) WITH CHECK (false);

CREATE POLICY "Deny anon users - encryption keys"
ON encryption_keys FOR ALL TO anon
USING (false) WITH CHECK (false);

-- ============================================
-- 6. Fix public role policies on system tables
-- ============================================

-- Fix notifications table
DROP POLICY IF EXISTS "System can manage notifications" ON notifications;
CREATE POLICY "Service role can manage notifications"
ON notifications FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Users can view their notifications"
ON notifications FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Fix rewards table
DROP POLICY IF EXISTS "System can manage rewards" ON rewards;
CREATE POLICY "Service role can manage rewards"
ON rewards FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Users can view their rewards"
ON rewards FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Fix streaks_daily table
DROP POLICY IF EXISTS "System can manage streaks" ON streaks_daily;
CREATE POLICY "Service role can manage streaks"
ON streaks_daily FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Users can view their streaks"
ON streaks_daily FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Fix sponsor_growth_tracking table
DROP POLICY IF EXISTS "System can manage growth tracking" ON sponsor_growth_tracking;
CREATE POLICY "Service role can manage growth tracking"
ON sponsor_growth_tracking FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Sponsors can view their growth tracking"
ON sponsor_growth_tracking FOR SELECT TO authenticated
USING (
  sponsor_id IN (
    SELECT id FROM sponsors WHERE email = auth.email()
  ) OR
  has_role(auth.uid(), 'admin')
);

-- Fix sponsor_ledger table
DROP POLICY IF EXISTS "Service role can manage sponsor ledger" ON sponsor_ledger;
CREATE POLICY "Service role only - sponsor ledger"
ON sponsor_ledger FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Sponsors view own ledger"
ON sponsor_ledger FOR SELECT TO authenticated
USING (
  sponsor_id IN (
    SELECT id FROM sponsors WHERE email = auth.email()
  ) OR
  has_role(auth.uid(), 'admin')
);

-- Fix sponsor_accounts table
DROP POLICY IF EXISTS "Service role can manage sponsor accounts" ON sponsor_accounts;
CREATE POLICY "Service role only - sponsor accounts"
ON sponsor_accounts FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Sponsors view own account"
ON sponsor_accounts FOR SELECT TO authenticated
USING (
  sponsor_id IN (
    SELECT id FROM sponsors WHERE email = auth.email()
  ) OR
  has_role(auth.uid(), 'admin')
);

-- Fix sponsor_metrics_snapshots table
DROP POLICY IF EXISTS "System can manage metrics snapshots" ON sponsor_metrics_snapshots;
CREATE POLICY "Service role only - metrics snapshots"
ON sponsor_metrics_snapshots FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Sponsors view own metrics"
ON sponsor_metrics_snapshots FOR SELECT TO authenticated
USING (
  sponsor_id IN (
    SELECT id FROM sponsors WHERE email = auth.email()
  ) OR
  has_role(auth.uid(), 'admin')
);

-- ============================================
-- Summary of Security Fixes:
-- ============================================
-- ✅ user_ledger_detailed view now filters by auth.uid()
-- ✅ sponsors table has proper RLS policies
-- ✅ profiles subscription columns protected from client modification
-- ✅ budget_templates require Pro subscription for paid templates
-- ✅ encryption_keys accessible to service_role only
-- ✅ System tables (notifications, rewards, streaks) restricted from public role
-- ✅ Sponsor financial tables restricted to service_role and sponsor owners