-- Add unique index on sponsors.email to prevent duplicate sponsors
CREATE UNIQUE INDEX IF NOT EXISTS sponsors_email_unique_idx ON public.sponsors (email);