-- Create saves table for tracking skipped purchases
CREATE TABLE public.saves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount_cents INTEGER NOT NULL,
  reason TEXT NOT NULL,
  convert_to_btc BOOLEAN NOT NULL DEFAULT false,
  btc_sats BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;

-- Create policies for saves
CREATE POLICY "Users can view their own saves" 
ON public.saves 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own saves" 
ON public.saves 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own saves" 
ON public.saves 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own saves" 
ON public.saves 
FOR DELETE 
USING (user_id = auth.uid());

-- Create save_matches table for social matching functionality
CREATE TABLE public.save_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  save_id UUID NOT NULL,
  matcher_user_id UUID NOT NULL,
  amount_cents INTEGER NOT NULL,
  btc_sats BIGINT,
  status TEXT NOT NULL DEFAULT 'pledged', -- pledged, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for save_matches
ALTER TABLE public.save_matches ENABLE ROW LEVEL SECURITY;

-- Create policies for save_matches
CREATE POLICY "Users can view their own matches" 
ON public.save_matches 
FOR SELECT 
USING (matcher_user_id = auth.uid());

CREATE POLICY "Users can create their own matches" 
ON public.save_matches 
FOR INSERT 
WITH CHECK (matcher_user_id = auth.uid());

CREATE POLICY "Users can update their own matches" 
ON public.save_matches 
FOR UPDATE 
USING (matcher_user_id = auth.uid());

CREATE POLICY "Users can delete their own matches" 
ON public.save_matches 
FOR DELETE 
USING (matcher_user_id = auth.uid());

-- Create save_likes table for social engagement
CREATE TABLE public.save_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  save_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for save_likes
ALTER TABLE public.save_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for save_likes
CREATE POLICY "Users can like saves" 
ON public.save_likes 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their own save likes" 
ON public.save_likes 
FOR DELETE 
USING (user_id = auth.uid());

-- Create save_comments table for social engagement
CREATE TABLE public.save_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  save_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for save_comments
ALTER TABLE public.save_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for save_comments
CREATE POLICY "Users can create their own save comments" 
ON public.save_comments 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own save comments" 
ON public.save_comments 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own save comments" 
ON public.save_comments 
FOR DELETE 
USING (user_id = auth.uid());

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_saves_updated_at
BEFORE UPDATE ON public.saves
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_save_matches_updated_at
BEFORE UPDATE ON public.save_matches
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_save_comments_updated_at
BEFORE UPDATE ON public.save_comments
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();