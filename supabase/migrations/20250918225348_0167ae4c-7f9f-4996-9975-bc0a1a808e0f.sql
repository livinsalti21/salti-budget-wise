-- Fix RLS policies for ai_sessions table
DROP POLICY IF EXISTS "Users can manage their own ai sessions" ON public.ai_sessions;
DROP POLICY IF EXISTS "Users can view their own ai sessions" ON public.ai_sessions;

-- Create new simplified policies for ai_sessions
CREATE POLICY "Users can manage their own ai sessions" 
ON public.ai_sessions 
FOR ALL 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Fix RLS policies for ai_messages table  
DROP POLICY IF EXISTS "Users can insert messages in their sessions" ON public.ai_messages;
DROP POLICY IF EXISTS "Users can read messages in their sessions" ON public.ai_messages;

-- Create new simplified policies for ai_messages
CREATE POLICY "Users can insert messages in their sessions" 
ON public.ai_messages 
FOR INSERT 
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM ai_sessions s 
  WHERE s.id = ai_messages.session_id 
  AND s.user_id = auth.uid()
));

CREATE POLICY "Users can read messages in their sessions" 
ON public.ai_messages 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM ai_sessions s 
  WHERE s.id = ai_messages.session_id 
  AND s.user_id = auth.uid()
));

-- Add admin policies separately for future use
CREATE POLICY "Admins can manage all ai sessions" 
ON public.ai_sessions 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all ai messages" 
ON public.ai_messages 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));