-- SECURITY FIX #1: Fix users table policies (CRITICAL)
-- The users table currently has policies for 'public' role which is extremely dangerous

DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can delete their own data" ON users;

-- Create proper policies restricted to authenticated users only
CREATE POLICY "Users can view their own data"
ON users FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can insert their own data"
ON users FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own data"
ON users FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can delete their own data"
ON users FOR DELETE
TO authenticated
USING (id = auth.uid());

-- Add explicit denial for anonymous users on users table
CREATE POLICY "Deny all anonymous access to users"
ON users FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Revoke any dangerous public access
REVOKE ALL ON users FROM public;
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;