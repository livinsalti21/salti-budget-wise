-- Create device_tokens table for push notification tokens
CREATE TABLE public.device_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own device tokens" 
ON public.device_tokens 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own device tokens" 
ON public.device_tokens 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own device tokens" 
ON public.device_tokens 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own device tokens" 
ON public.device_tokens 
FOR DELETE 
USING (user_id = auth.uid());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_device_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_device_tokens_updated_at
  BEFORE UPDATE ON public.device_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_device_tokens_updated_at();

-- Create unique constraint to prevent duplicate tokens per user/platform
CREATE UNIQUE INDEX idx_device_tokens_user_platform 
ON public.device_tokens (user_id, platform) 
WHERE is_active = true;