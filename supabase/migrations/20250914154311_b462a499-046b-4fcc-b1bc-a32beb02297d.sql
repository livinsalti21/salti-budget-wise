-- Final security hardening - fix remaining critical issues

-- Check if profiles table has RLS enabled, if not enable it
DO $$
BEGIN
    -- Enable RLS on profiles if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE c.relname = 'profiles' 
        AND n.nspname = 'public'
        AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Drop and recreate profiles policies to ensure they're correct
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
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

EXCEPTION 
    WHEN OTHERS THEN 
        RAISE NOTICE 'Error creating profiles policies: %', SQLERRM;
END $$;

-- Ensure security_audit_log has proper RLS
DO $$
BEGIN
    ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view their own security events" ON security_audit_log;
    DROP POLICY IF EXISTS "System can insert security events" ON security_audit_log;

    CREATE POLICY "Users can view their own security events"
    ON security_audit_log FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

    CREATE POLICY "System can insert security events"
    ON security_audit_log FOR INSERT
    TO authenticated
    WITH CHECK (true);

EXCEPTION 
    WHEN OTHERS THEN 
        RAISE NOTICE 'Error with security_audit_log policies: %', SQLERRM;
END $$;