-- Fix critical security issues

-- 1. Enable RLS on push_events table and create proper policies
ALTER TABLE public.push_events ENABLE ROW LEVEL SECURITY;

-- Users can only view their own push events
CREATE POLICY "Users can view their own push events" 
ON public.push_events 
FOR SELECT 
USING (user_id = auth.uid());

-- Users can insert their own push events
CREATE POLICY "Users can insert their own push events" 
ON public.push_events 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Users can update their own push events
CREATE POLICY "Users can update their own push events" 
ON public.push_events 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can delete their own push events
CREATE POLICY "Users can delete their own push events" 
ON public.push_events 
FOR DELETE 
USING (user_id = auth.uid());

-- 2. Move extensions from public schema to extensions schema
-- Move uuid-ossp extension
ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;

-- Move pgcrypto extension 
ALTER EXTENSION "pgcrypto" SET SCHEMA extensions;