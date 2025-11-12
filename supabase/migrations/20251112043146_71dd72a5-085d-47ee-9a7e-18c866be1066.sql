-- Enable real-time updates for security_audit_log
ALTER TABLE public.security_audit_log REPLICA IDENTITY FULL;

-- Add the table to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_audit_log;