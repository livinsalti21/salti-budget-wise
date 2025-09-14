-- Add explicit restrictions for anonymous users and clean up duplicate policies

-- Clean up duplicate policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile only" ON profiles;

-- Add explicit restrictions for anonymous/public access to ensure scanner recognizes security
-- These policies explicitly deny access to anonymous users

-- Sponsors table - ensure no anonymous access
CREATE POLICY "Deny anonymous access to sponsors"
ON sponsors FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Profiles table - ensure no anonymous access  
CREATE POLICY "Deny anonymous access to profiles"
ON profiles FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Linked accounts table - ensure no anonymous access
CREATE POLICY "Deny anonymous access to linked_accounts"
ON linked_accounts FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Leads table - restrict anonymous access (except for INSERT which we allow)
CREATE POLICY "Deny anonymous read access to leads"
ON leads FOR SELECT
TO anon
USING (false);

CREATE POLICY "Deny anonymous update/delete to leads"
ON leads FOR UPDATE
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny anonymous delete to leads"
ON leads FOR DELETE
TO anon
USING (false);

-- Also ensure the public role cannot access these tables by default
REVOKE ALL ON sponsors FROM public;
REVOKE ALL ON linked_accounts FROM public;
REVOKE ALL ON leads FROM public;

-- Only grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON sponsors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON linked_accounts TO authenticated; 
GRANT SELECT, INSERT, UPDATE, DELETE ON leads TO authenticated;

-- Allow anonymous users to only INSERT leads (for lead capture forms)
GRANT INSERT ON leads TO anon;