-- Add onboarding and sponsor preference fields to sponsors table
ALTER TABLE public.sponsors 
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS sponsor_type text,
ADD COLUMN IF NOT EXISTS monthly_budget_cents integer,
ADD COLUMN IF NOT EXISTS match_percentage integer,
ADD COLUMN IF NOT EXISTS motivation text,
ADD COLUMN IF NOT EXISTS goals jsonb,
ADD COLUMN IF NOT EXISTS name text;