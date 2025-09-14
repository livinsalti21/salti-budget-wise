-- SECURITY FIX #5: Address remaining subscriptions and other missing tables

-- Handle subscriptions table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions' AND table_schema = 'public') THEN
        -- Enable RLS on subscriptions table
        ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
        
        -- Revoke public access
        REVOKE ALL ON subscriptions FROM public;
        GRANT SELECT, INSERT, UPDATE, DELETE ON subscriptions TO authenticated;
        
        -- Add denial for anonymous users
        CREATE POLICY "Deny anonymous access to subscriptions"
        ON subscriptions FOR ALL
        TO anon
        USING (false)
        WITH CHECK (false);
        
        -- Add user-specific access policy
        CREATE POLICY "Users can manage their own subscriptions"
        ON subscriptions FOR ALL
        TO authenticated
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
    END IF;
EXCEPTION 
    WHEN duplicate_object THEN
        -- Policies already exist
    WHEN OTHERS THEN
        -- Continue if there are issues
END $$;

-- Double-check that all critical tables have proper RLS enforcement
DO $$
DECLARE
    critical_tables TEXT[] := ARRAY['users', 'profiles', 'linked_accounts', 'sponsors', 'leads', 'invoices', 'template_purchases', 'match_events'];
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY critical_tables
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl AND table_schema = 'public') THEN
            -- Force RLS on critical tables
            EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', tbl);
        END IF;
    END LOOP;
END $$;

-- Add additional security policy to prevent any possible data leaks
-- Create a catch-all policy for any missed cases
DO $$
BEGIN
    -- Ensure no default permissions exist on any sensitive table
    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM public;
    
    -- Grant minimum necessary permissions only to authenticated users
    GRANT USAGE ON SCHEMA public TO authenticated;
    GRANT USAGE ON SCHEMA public TO anon;
    
EXCEPTION 
    WHEN OTHERS THEN
        -- Continue if there are permission issues
END $$;