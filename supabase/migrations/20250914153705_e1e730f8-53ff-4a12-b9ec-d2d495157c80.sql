-- Fix infinite recursion in RLS policies by creating security definer functions

-- Create security definer function to check group membership without recursion
CREATE OR REPLACE FUNCTION public.is_group_member(target_group_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM group_members 
    WHERE group_id = target_group_id AND user_id = target_user_id
  );
$$;

-- Create security definer function to check family group membership without recursion  
CREATE OR REPLACE FUNCTION public.is_family_group_member(target_group_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM family_group_members 
    WHERE group_id = target_group_id AND user_id = target_user_id
  );
$$;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Group members can view membership" ON group_members;
DROP POLICY IF EXISTS "members_select_self_group" ON family_group_members;

-- Create new non-recursive policies for group_members
CREATE POLICY "Group members can view membership"
ON group_members
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR 
  is_group_member(group_id, auth.uid())
);

-- Create new non-recursive policies for family_group_members  
CREATE POLICY "members_select_self_group"
ON family_group_members
FOR SELECT  
TO authenticated
USING (
  user_id = auth.uid() OR
  is_family_group_member(group_id, auth.uid())
);

-- Tighten public data access - restrict budget templates to authenticated users
DROP POLICY IF EXISTS "Templates are viewable by everyone" ON budget_templates;
CREATE POLICY "Templates are viewable by authenticated users"
ON budget_templates
FOR SELECT
TO authenticated
USING (is_active = true);

-- Tighten public data access - restrict badges to authenticated users  
DROP POLICY IF EXISTS "Badges are viewable by everyone" ON badges;
CREATE POLICY "Badges are viewable by authenticated users"
ON badges
FOR SELECT
TO authenticated
USING (true);

-- Add additional security policies for sponsors table to prevent email exposure
DROP POLICY IF EXISTS "Sponsors can view their own data" ON sponsors;
CREATE POLICY "Sponsors can view their own data"
ON sponsors
FOR SELECT
TO authenticated
USING (email = auth.email());

CREATE POLICY "System can create sponsor records"
ON sponsors
FOR INSERT
TO authenticated
WITH CHECK (email = auth.email());

CREATE POLICY "Sponsors can update their own data"
ON sponsors
FOR UPDATE
TO authenticated
USING (email = auth.email())
WITH CHECK (email = auth.email());