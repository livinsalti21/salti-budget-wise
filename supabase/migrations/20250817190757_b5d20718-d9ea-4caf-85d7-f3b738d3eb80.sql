-- Add user settings table for projection rates and other preferences
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  projection_rate_percent DECIMAL(5,2) NOT NULL DEFAULT 7.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own settings" 
ON public.user_settings 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Add streak tracking for different types
CREATE TABLE public.streak_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  streak_type TEXT NOT NULL CHECK (streak_type IN ('self', 'friends', 'community', 'sponsors')),
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, streak_type)
);

-- Enable RLS
ALTER TABLE public.streak_types ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own streak types" 
ON public.streak_types 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Add template purchases table to track when dashboard should update
CREATE TABLE public.template_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  template_id UUID,
  purchase_type TEXT NOT NULL CHECK (purchase_type IN ('created', 'uploaded', 'purchased')),
  amount_cents INTEGER,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.template_purchases ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own purchases" 
ON public.template_purchases 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own purchases" 
ON public.template_purchases 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Update save_events table to include more detailed save information
ALTER TABLE public.save_events 
ADD COLUMN IF NOT EXISTS reason TEXT DEFAULT 'Manual Save',
ADD COLUMN IF NOT EXISTS future_value_cents INTEGER;

-- Add updated_at trigger to user_settings
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger to streak_types
CREATE TRIGGER update_streak_types_updated_at
BEFORE UPDATE ON public.streak_types
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger to template_purchases
CREATE TRIGGER update_template_purchases_updated_at
BEFORE UPDATE ON public.template_purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();