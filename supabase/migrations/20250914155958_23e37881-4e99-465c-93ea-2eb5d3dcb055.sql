-- SECURITY FIX #6: Final critical vulnerability resolution

-- Ensure encryption_keys table is completely locked down (system only)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'encryption_keys' AND table_schema = 'public') THEN
        -- Remove all existing policies
        DROP POLICY IF EXISTS "System only access to encryption keys" ON encryption_keys;
        
        -- Create absolute lockdown policy
        CREATE POLICY "Complete lockdown - encryption keys"
        ON encryption_keys FOR ALL
        USING (false)
        WITH CHECK (false);
        
        -- Revoke all permissions
        REVOKE ALL ON encryption_keys FROM public, anon, authenticated;
    END IF;
END $$;

-- Fix profiles table access - ensure only users can see their own profiles  
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
CREATE POLICY "Strict user-only access to profiles"
ON profiles FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Fix linked_accounts table - make absolutely sure only owners can access
DROP POLICY IF EXISTS "Users can view their own linked accounts" ON linked_accounts;
DROP POLICY IF EXISTS "Users can insert their own linked accounts" ON linked_accounts;
DROP POLICY IF EXISTS "Users can update their own linked accounts" ON linked_accounts;
DROP POLICY IF EXISTS "Users can delete their own linked accounts" ON linked_accounts;

CREATE POLICY "Strict owner-only access to linked accounts"
ON linked_accounts FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Fix transactions table - ensure only owners can access their transactions
DROP POLICY IF EXISTS "Users can manage their own transactions" ON transactions;
CREATE POLICY "Strict owner-only access to transactions"
ON transactions FOR ALL  
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Ensure sponsors table is properly locked to email-based access
DROP POLICY IF EXISTS "Sponsors can view their own data" ON sponsors;
DROP POLICY IF EXISTS "Sponsors can insert their own data" ON sponsors;
DROP POLICY IF EXISTS "Sponsors can update their own data" ON sponsors;
DROP POLICY IF EXISTS "Sponsors can delete their own data" ON sponsors;

CREATE POLICY "Strict email-based sponsor access"
ON sponsors FOR ALL
TO authenticated
USING (email = auth.email())
WITH CHECK (email = auth.email());

-- Add final security measure: deny all default access to any table
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM public;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM public;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM public;

-- Only grant necessary schema usage
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;