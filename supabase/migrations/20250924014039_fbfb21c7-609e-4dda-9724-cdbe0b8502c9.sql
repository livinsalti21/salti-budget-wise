-- CRITICAL SECURITY FIXES: Remove policy bypasses and enhance security

-- Fix match_events table - remove system bypass, add proper service authentication
DROP POLICY IF EXISTS "System can manage match events" ON public.match_events;

-- Create more secure policy for system operations
CREATE POLICY "Service role can manage match events" 
ON public.match_events 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Restrict regular operations to proper users
CREATE POLICY "Match events strict access control" 
ON public.match_events 
FOR ALL 
TO authenticated
USING (
  recipient_user_id = auth.uid() OR 
  (sponsor_id IN (SELECT id FROM sponsors WHERE email = auth.email()) AND has_role(auth.uid(), 'admin'::app_role))
)
WITH CHECK (
  recipient_user_id = auth.uid() OR 
  (sponsor_id IN (SELECT id FROM sponsors WHERE email = auth.email()) AND has_role(auth.uid(), 'admin'::app_role))
);

-- Fix ai_suggestions table - remove system bypass
DROP POLICY IF EXISTS "System can create suggestions" ON public.ai_suggestions;

-- Create secure policy for AI suggestions
CREATE POLICY "Service role can create suggestions" 
ON public.ai_suggestions 
FOR INSERT 
TO service_role
WITH CHECK (true);

CREATE POLICY "AI suggestions admin management" 
ON public.ai_suggestions 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Enhance security_audit_log for better monitoring
ALTER TABLE public.security_audit_log 
ADD COLUMN IF NOT EXISTS severity text DEFAULT 'info',
ADD COLUMN IF NOT EXISTS automated_response boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS resolved_at timestamp with time zone;

-- Create index for security monitoring performance
CREATE INDEX IF NOT EXISTS idx_security_audit_severity_created 
ON public.security_audit_log(severity, created_at);

-- Create security alerts table for real-time monitoring
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  user_id uuid REFERENCES auth.users(id),
  event_details jsonb NOT NULL,
  resolved boolean DEFAULT false,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on security_alerts
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- Only admins can manage security alerts
CREATE POLICY "Admins can manage security alerts" 
ON public.security_alerts 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for security alerts
CREATE OR REPLACE FUNCTION public.update_security_alerts_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_security_alerts_updated_at
  BEFORE UPDATE ON public.security_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_security_alerts_timestamp();

-- Enhance linked_accounts security with additional encryption metadata
ALTER TABLE public.linked_accounts 
ADD COLUMN IF NOT EXISTS encryption_version integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS key_rotation_date timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS security_flags jsonb DEFAULT '{}';

-- Add index for security monitoring on linked accounts
CREATE INDEX IF NOT EXISTS idx_linked_accounts_security 
ON public.linked_accounts(user_id, is_active, key_rotation_date);

-- Create function for enhanced security logging
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_severity text DEFAULT 'info',
  p_event_details jsonb DEFAULT '{}',
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    severity,
    event_details,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_event_type,
    p_severity,
    p_event_details,
    NULL, -- Will be filled by application layer
    NULL  -- Will be filled by application layer
  );
  
  -- Create alert for high severity events
  IF p_severity IN ('high', 'critical') THEN
    INSERT INTO public.security_alerts (
      alert_type,
      severity,
      user_id,
      event_details
    ) VALUES (
      p_event_type,
      p_severity,
      p_user_id,
      p_event_details
    );
  END IF;
END;
$$;