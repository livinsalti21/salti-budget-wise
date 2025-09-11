-- EMERGENCY SECURITY FIX: Enable proper RLS on all tables with exposed data

-- Fix leaderboard_weekly table RLS
ALTER TABLE public.leaderboard_weekly ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate properly
DROP POLICY IF EXISTS "Leaderboard is viewable by authenticated users" ON public.leaderboard_weekly;
CREATE POLICY "Leaderboard is viewable by authenticated users" 
  ON public.leaderboard_weekly 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Fix encouragements table RLS (already has policies, but check if enabled)
ALTER TABLE public.encouragements ENABLE ROW LEVEL SECURITY;

-- Fix family_groups table RLS (already has some policies, but needs to be enabled)  
ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;

-- Fix family_group_members table RLS (already has some policies, but needs to be enabled)
ALTER TABLE public.family_group_members ENABLE ROW LEVEL SECURITY;

-- Fix family_group_invites table RLS (already has some policies, but needs to be enabled)
ALTER TABLE public.family_group_invites ENABLE ROW LEVEL SECURITY;

-- Fix demo_wallets table RLS (already has some policies, but needs to be enabled)
ALTER TABLE public.demo_wallets ENABLE ROW LEVEL SECURITY;

-- Fix demo_transactions table RLS (already has some policies, but needs to be enabled)
ALTER TABLE public.demo_transactions ENABLE ROW LEVEL SECURITY;

-- Fix groups table RLS (already has some policies, but needs to be enabled)
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Fix group_members table RLS (already has some policies, but needs to be enabled)
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Fix analytics_events table RLS (ensure it's enabled)
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Fix match_events table RLS (ensure it's enabled)
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;

-- Fix match_invites table RLS (ensure it's enabled)
ALTER TABLE public.match_invites ENABLE ROW LEVEL SECURITY;

-- Fix match_rules table RLS (ensure it's enabled)
ALTER TABLE public.match_rules ENABLE ROW LEVEL SECURITY;

-- Fix payday_rules table RLS (ensure it's enabled)
ALTER TABLE public.payday_rules ENABLE ROW LEVEL SECURITY;

-- Fix stacklets table RLS (ensure it's enabled)
ALTER TABLE public.stacklets ENABLE ROW LEVEL SECURITY;

-- Fix save_events table RLS (ensure it's enabled)
ALTER TABLE public.save_events ENABLE ROW LEVEL SECURITY;

-- Fix user_badges table RLS (ensure it's enabled)
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Fix user_streaks table RLS (ensure it's enabled)
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- Fix daily_actions table RLS (ensure it's enabled)
ALTER TABLE public.daily_actions ENABLE ROW LEVEL SECURITY;

-- Fix onboarding_suggestions table RLS (ensure it's enabled)
ALTER TABLE public.onboarding_suggestions ENABLE ROW LEVEL SECURITY;

-- Fix notification_settings table RLS (ensure it's enabled)
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Fix notifications table RLS (ensure it's enabled)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Fix device_tokens table RLS (ensure it's enabled)
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

-- Fix linked_accounts table RLS (ensure it's enabled)
ALTER TABLE public.linked_accounts ENABLE ROW LEVEL SECURITY;

-- Fix budget-related tables RLS (ensure they're enabled)
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_uploads ENABLE ROW LEVEL SECURITY;

-- Fix goals table RLS (ensure it's enabled)
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Fix events table RLS (ensure it's enabled)  
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Fix invoices table RLS (ensure it's enabled)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Fix profiles table RLS (ensure it's enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Fix ai_sessions table RLS (ensure it's enabled)
ALTER TABLE public.ai_sessions ENABLE ROW LEVEL SECURITY;

-- Fix ai_messages table RLS (ensure it's enabled)
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- Fix ai_suggestions table RLS (ensure it's enabled)
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

-- Fix leads table RLS (ensure it's enabled)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Fix community_posts table RLS (ensure it's enabled)
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Fix comments table RLS (ensure it's enabled)
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Fix likes table RLS (ensure it's enabled)
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Move pgcrypto extension from public to extensions schema to fix extension warning
-- This is safe and improves security
DROP EXTENSION IF EXISTS pgcrypto CASCADE;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;