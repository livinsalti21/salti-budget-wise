-- Fix all remaining critical security issues by ensuring proper RLS policies

-- Enable RLS on all critical tables that need it
ALTER TABLE IF EXISTS public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.linked_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.leads ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for sponsors table
DROP POLICY IF EXISTS "Sponsors can view their own data" ON sponsors;
DROP POLICY IF EXISTS "Sponsors can insert their own data" ON sponsors;
DROP POLICY IF EXISTS "Sponsors can update their own data" ON sponsors;
DROP POLICY IF EXISTS "Sponsors can delete their own data" ON sponsors;

CREATE POLICY "Sponsors can view their own data"
ON sponsors FOR SELECT
TO authenticated
USING (email = auth.email());

CREATE POLICY "Sponsors can insert their own data"
ON sponsors FOR INSERT
TO authenticated
WITH CHECK (email = auth.email());

CREATE POLICY "Sponsors can update their own data"
ON sponsors FOR UPDATE
TO authenticated
USING (email = auth.email())
WITH CHECK (email = auth.email());

CREATE POLICY "Sponsors can delete their own data"
ON sponsors FOR DELETE
TO authenticated
USING (email = auth.email());

-- Ensure profiles table has proper policies (already done but ensuring completeness)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Ensure linked_accounts table has proper policies
DROP POLICY IF EXISTS "Users can manage their own accounts" ON linked_accounts;

CREATE POLICY "Users can view their own linked accounts"
ON linked_accounts FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own linked accounts"
ON linked_accounts FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own linked accounts"
ON linked_accounts FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own linked accounts"
ON linked_accounts FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Ensure leads table has admin-only access
DROP POLICY IF EXISTS "Admins can manage leads" ON leads;
DROP POLICY IF EXISTS "Anyone can create lead" ON leads;
DROP POLICY IF EXISTS "Only admins can view leads" ON leads;

CREATE POLICY "Admins can view all leads"
ON leads FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all leads"
ON leads FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can create lead"
ON leads FOR INSERT
TO anon
WITH CHECK (true);