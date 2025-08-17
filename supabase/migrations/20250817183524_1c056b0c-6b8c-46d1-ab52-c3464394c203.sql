-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the notification triggers to run every 15 minutes
SELECT cron.schedule(
  'notification-triggers',
  '*/15 * * * *',
  $$
  SELECT
    net.http_post(
        url:='https://vmpnajdvcipfuusnjnfr.supabase.co/functions/v1/notification-triggers',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtcG5hamR2Y2lwZnV1c25qbmZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NDEyMTYsImV4cCI6MjA3MDQxNzIxNn0.RyBNPUQBw6lNjA310fb7-qXn2IgQaiQzTKZHhFyTyzs"}'::jsonb,
        body:=concat('{"triggered_at": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);