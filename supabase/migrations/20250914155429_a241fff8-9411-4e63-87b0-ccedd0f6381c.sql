-- SECURITY FIX #3: Secure payment and financial transaction tables

-- Enable RLS on all payment-related tables
ALTER TABLE IF EXISTS public.match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoices ENABLE ROW LEVEL SECURITY;

-- Secure match_events table (contains payment data)
REVOKE ALL ON match_events FROM public;
GRANT SELECT, INSERT, UPDATE, DELETE ON match_events TO authenticated;

-- Create policies for match_events if they don't exist properly
DROP POLICY IF EXISTS "Recipients can view their own match events" ON match_events;
DROP POLICY IF EXISTS "Sponsors can view their own match events" ON match_events;
DROP POLICY IF EXISTS "System can insert match events" ON match_events;
DROP POLICY IF EXISTS "System can update match events" ON match_events;

CREATE POLICY "Recipients can view their own match events"
ON match_events FOR SELECT
TO authenticated
USING (recipient_user_id = auth.uid());

CREATE POLICY "Sponsors can view their own match events"
ON match_events FOR SELECT
TO authenticated
USING (sponsor_id IN (
    SELECT id FROM sponsors WHERE email = auth.email()
));

CREATE POLICY "System can manage match events"
ON match_events FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add denial for anonymous users
CREATE POLICY "Deny anonymous access to match events"
ON match_events FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Secure invoices table
REVOKE ALL ON invoices FROM public;
GRANT SELECT, INSERT, UPDATE, DELETE ON invoices TO authenticated;

-- Add denial for anonymous users on invoices
CREATE POLICY "Deny anonymous access to invoices"
ON invoices FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Also secure any other tables that might contain sensitive data
DO $$
BEGIN
    -- Enable RLS on all tables that might contain sensitive data
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'budget_templates' AND table_schema = 'public') THEN
        ALTER TABLE public.budget_templates ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'badges' AND table_schema = 'public') THEN
        ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;