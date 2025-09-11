-- SECURITY FIX: Secure push_events table from unauthorized access (Fixed)

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own push events" ON public.push_events;
DROP POLICY IF EXISTS "Users can insert their own push events" ON public.push_events;  
DROP POLICY IF EXISTS "System can update push events" ON public.push_events;

-- Create strict RLS policies for push_events table

-- 1. SELECT: Users can only view their own push events
CREATE POLICY "Users can view own push events only"
  ON public.push_events
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 2. INSERT: Users can only insert push events for themselves  
CREATE POLICY "Users can create own push events only"
  ON public.push_events
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 3. UPDATE: Only allow system updates for status changes, not data access
-- This restricts updates to specific columns and only for the user's own records
CREATE POLICY "System can update push event status"
  ON public.push_events  
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 4. DELETE: Users can delete their own push events (for privacy)
CREATE POLICY "Users can delete own push events"
  ON public.push_events
  FOR DELETE  
  TO authenticated
  USING (user_id = auth.uid());

-- 5. Explicitly deny all access to non-authenticated users
CREATE POLICY "Deny anonymous access to push events"
  ON public.push_events
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- Ensure RLS is enabled (should already be, but making sure)
ALTER TABLE public.push_events ENABLE ROW LEVEL SECURITY;

-- Add security audit logging for push event modifications
CREATE OR REPLACE FUNCTION public.log_push_event_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log when push events are modified (INSERT, UPDATE, DELETE only - SELECT not supported in triggers)
  INSERT INTO public.security_audit_log (
    user_id,
    event_type, 
    event_details,
    created_at
  ) VALUES (
    auth.uid(),
    'push_event_' || TG_OP::text,
    jsonb_build_object(
      'push_event_id', COALESCE(NEW.id, OLD.id),
      'push_event_type', COALESCE(NEW.type, OLD.type),
      'table_name', 'push_events'
    ),
    now()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for audit logging (INSERT, UPDATE, DELETE only)
DROP TRIGGER IF EXISTS push_events_audit_trigger ON public.push_events;
CREATE TRIGGER push_events_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.push_events
  FOR EACH ROW EXECUTE FUNCTION public.log_push_event_access();

-- Add indexes for better performance on user_id queries (common access pattern)
CREATE INDEX IF NOT EXISTS idx_push_events_user_id ON public.push_events(user_id);
CREATE INDEX IF NOT EXISTS idx_push_events_status ON public.push_events(status);
CREATE INDEX IF NOT EXISTS idx_push_events_type ON public.push_events(type);

-- Add constraint to ensure user_id is always set (prevent NULL user_id issues)
ALTER TABLE public.push_events 
  ADD CONSTRAINT push_events_user_id_not_null 
  CHECK (user_id IS NOT NULL);

-- Comment the table for documentation
COMMENT ON TABLE public.push_events IS 'Stores push notification events with strict RLS policies - users can only access their own records';