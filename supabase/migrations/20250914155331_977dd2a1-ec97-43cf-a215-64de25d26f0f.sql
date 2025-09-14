-- SECURITY FIX #2: Ensure all critical tables have proper access controls
-- Double-check and fix any remaining public access issues

-- Verify and fix profiles table access
REVOKE ALL ON profiles FROM public;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;

-- Ensure profiles has proper policies (already should exist but double-checking)
DO $$
BEGIN
    -- Check if proper policies exist, if not create them
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Deny anonymous access to profiles') THEN
        CREATE POLICY "Deny anonymous access to profiles"
        ON profiles FOR ALL
        TO anon
        USING (false)
        WITH CHECK (false);
    END IF;
END $$;

-- Verify and fix linked_accounts table access  
REVOKE ALL ON linked_accounts FROM public;
GRANT SELECT, INSERT, UPDATE, DELETE ON linked_accounts TO authenticated;

-- Verify and fix leads table access
REVOKE ALL ON leads FROM public;
GRANT SELECT, INSERT, UPDATE, DELETE ON leads TO authenticated;
GRANT INSERT ON leads TO anon;  -- Allow lead capture forms

-- Verify and fix sponsors table access
REVOKE ALL ON sponsors FROM public;
GRANT SELECT, INSERT, UPDATE, DELETE ON sponsors TO authenticated;

-- Also fix any other sensitive tables that might have public access
REVOKE ALL ON security_audit_log FROM public;
REVOKE ALL ON encryption_keys FROM public;
REVOKE ALL ON device_tokens FROM public;
REVOKE ALL ON notifications FROM public;

-- Grant only necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON security_audit_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON device_tokens TO authenticated;
GRANT SELECT, UPDATE ON notifications TO authenticated;