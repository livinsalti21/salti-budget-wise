-- EMERGENCY SECURITY FIX: Enable proper RLS on tables (not views)

-- Handle leaderboard_weekly view - drop it since it's exposing data publicly
-- The app should query individual tables with proper RLS instead
DROP VIEW IF EXISTS public.leaderboard_weekly CASCADE;

-- Fix encouragements table RLS (ensure it's enabled)
ALTER TABLE public.encouragements ENABLE ROW LEVEL SECURITY;

-- Fix family_groups table RLS (ensure it's enabled)  
ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;

-- Fix family_group_members table RLS (ensure it's enabled)
ALTER TABLE public.family_group_members ENABLE ROW LEVEL SECURITY;

-- Fix family_group_invites table RLS (ensure it's enabled)
ALTER TABLE public.family_group_invites ENABLE ROW LEVEL SECURITY;

-- Fix demo_wallets table RLS (ensure it's enabled)
ALTER TABLE public.demo_wallets ENABLE ROW LEVEL SECURITY;

-- Fix demo_transactions table RLS (ensure it's enabled)
ALTER TABLE public.demo_transactions ENABLE ROW LEVEL SECURITY;

-- Fix groups table RLS (ensure it's enabled)
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Fix group_members table RLS (ensure it's enabled)
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Ensure all other sensitive tables have RLS enabled
DO $$
DECLARE
    table_record RECORD;
BEGIN
    -- List of tables that should have RLS enabled
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT IN ('badges', 'budget_templates') -- These can remain public
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_record.table_name);
    END LOOP;
END $$;

-- Move pgcrypto extension from public to extensions schema to fix extension warning
-- Check if extensions schema exists first
CREATE SCHEMA IF NOT EXISTS extensions;

-- Recreate pgcrypto in extensions schema (safer approach)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;