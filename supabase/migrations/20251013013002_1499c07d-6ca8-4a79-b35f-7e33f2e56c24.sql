-- ============================================
-- CRITICAL SECURITY FIX: user_ledger and user_accounts RLS
-- ============================================
-- These tables contain sensitive financial data and must be locked down
-- Only the user can read their own data
-- Only edge functions (service role) can write data

-- ============================================
-- 1. Fix user_ledger policies
-- ============================================

-- Drop any overly permissive policies
DROP POLICY IF EXISTS "Service role can manage user ledger" ON public.user_ledger;
DROP POLICY IF EXISTS "Users can view their own ledger entries" ON public.user_ledger;

-- Users can only SELECT their own ledger entries
CREATE POLICY "Users can view their own ledger"
ON public.user_ledger
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Only edge functions (service role) can INSERT
CREATE POLICY "Service role can insert ledger entries"
ON public.user_ledger
FOR INSERT
TO service_role
WITH CHECK (true);

-- Only edge functions (service role) can UPDATE
CREATE POLICY "Service role can update ledger entries"
ON public.user_ledger
FOR UPDATE
TO service_role
USING (true);

-- Only edge functions (service role) can DELETE (for corrections)
CREATE POLICY "Service role can delete ledger entries"
ON public.user_ledger
FOR DELETE
TO service_role
USING (true);

-- ============================================
-- 2. Fix user_accounts policies
-- ============================================

-- Drop any overly permissive policies
DROP POLICY IF EXISTS "Service role can manage user accounts" ON public.user_accounts;
DROP POLICY IF EXISTS "Users can view their own account" ON public.user_accounts;

-- Users can only SELECT their own account
CREATE POLICY "Users can view their own account"
ON public.user_accounts
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Only edge functions (service role) can INSERT
CREATE POLICY "Service role can insert accounts"
ON public.user_accounts
FOR INSERT
TO service_role
WITH CHECK (true);

-- Only edge functions (service role) can UPDATE
CREATE POLICY "Service role can update accounts"
ON public.user_accounts
FOR UPDATE
TO service_role
USING (true);

-- Only edge functions (service role) can DELETE
CREATE POLICY "Service role can delete accounts"
ON public.user_accounts
FOR DELETE
TO service_role
USING (true);

-- ============================================
-- 3. Verify RLS is enabled
-- ============================================

ALTER TABLE public.user_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Summary of changes:
-- ============================================
-- ✅ user_ledger: Users can only read their own data
-- ✅ user_ledger: Only edge functions can write/update/delete
-- ✅ user_accounts: Users can only read their own data  
-- ✅ user_accounts: Only edge functions can write/update/delete
-- ✅ Prevents any client-side writes to financial data
-- ✅ Prevents users from reading other users' financial data