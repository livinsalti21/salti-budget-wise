-- Add phone verification fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verification_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verification_expires_at TIMESTAMPTZ;

-- Add phone field if it doesn't exist (it should already exist based on the schema)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;