-- SECURITY FIX #4 (CORRECTED): Add comprehensive anonymous denial policies for all sensitive tables

-- Secure template_purchases table
REVOKE ALL ON template_purchases FROM public;
GRANT SELECT, INSERT, UPDATE, DELETE ON template_purchases TO authenticated;

CREATE POLICY "Deny anonymous access to template_purchases"
ON template_purchases FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Secure transactions table  
REVOKE ALL ON transactions FROM public;
GRANT SELECT, INSERT, UPDATE, DELETE ON transactions TO authenticated;

CREATE POLICY "Deny anonymous access to transactions"
ON transactions FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Secure all other sensitive tables comprehensively
CREATE POLICY "Deny anonymous access to budget_templates"
ON budget_templates FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny anonymous access to badges"
ON badges FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Additional comprehensive security for all user data tables
DO $$
DECLARE
    tbl_name TEXT;
    sensitive_tables TEXT[] := ARRAY[
        'budgets', 'budget_items', 'budget_inputs', 'budget_uploads',
        'daily_actions', 'stacklets', 'save_events', 'payday_rules',
        'user_streaks', 'user_badges', 'streak_types', 'stacklet_progress',
        'friend_connections', 'friend_matches', 'group_members', 'groups',
        'family_groups', 'family_group_members', 'family_group_invites',
        'encouragements', 'match_rules', 'match_invites', 'notification_settings',
        'ai_sessions', 'ai_messages', 'ai_suggestions', 'analytics_events',
        'goals', 'events', 'comments', 'community_posts', 'likes',
        'onboarding_suggestions', 'demo_wallets', 'demo_transactions'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY sensitive_tables
    LOOP
        -- Enable RLS if table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl_name AND table_schema = 'public') THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl_name);
            
            -- Revoke public access
            EXECUTE format('REVOKE ALL ON public.%I FROM public', tbl_name);
            
            -- Grant access only to authenticated users
            EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', tbl_name);
            
            -- Add anonymous denial policy (will ignore if already exists)
            BEGIN
                EXECUTE format('CREATE POLICY "Deny anonymous access to %I" ON public.%I FOR ALL TO anon USING (false) WITH CHECK (false)', tbl_name, tbl_name);
            EXCEPTION WHEN duplicate_object THEN
                -- Policy already exists, continue
            END;
        END IF;
    END LOOP;
END $$;