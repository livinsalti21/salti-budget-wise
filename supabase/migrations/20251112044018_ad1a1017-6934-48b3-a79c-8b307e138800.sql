-- Phase 1: Add missing foreign key constraint for payday_rules
-- This fixes the notification-triggers edge function error
ALTER TABLE public.payday_rules 
ADD CONSTRAINT payday_rules_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add index for better performance on foreign key lookups
CREATE INDEX IF NOT EXISTS idx_payday_rules_user_id ON public.payday_rules(user_id);

-- Phase 2: Fix function security by setting explicit search paths
-- Use ALTER FUNCTION to avoid dropping and recreating (which would break policies)
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = '';
ALTER FUNCTION public.is_parent_of(uuid) SET search_path = '';
ALTER FUNCTION public.is_group_member(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.is_family_group_member(uuid, uuid) SET search_path = '';

-- Add comment documenting the security fix
COMMENT ON CONSTRAINT payday_rules_user_id_fkey ON public.payday_rules IS 
'Foreign key ensuring referential integrity with profiles table. Added to fix notification-triggers edge function error.';