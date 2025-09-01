-- Create budget_inputs table to store raw budget data for AI processing
CREATE TABLE public.budget_inputs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_data jsonb NOT NULL,
  source text NOT NULL DEFAULT 'manual',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for budget_inputs
ALTER TABLE public.budget_inputs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for budget_inputs
CREATE POLICY "Users can manage their own budget inputs" 
ON public.budget_inputs 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create budget_uploads table to track file uploads
CREATE TABLE public.budget_uploads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_data jsonb NOT NULL,
  processing_status text NOT NULL DEFAULT 'pending',
  processing_result jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for budget_uploads
ALTER TABLE public.budget_uploads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for budget_uploads
CREATE POLICY "Users can manage their own uploads" 
ON public.budget_uploads 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Add missing columns to budget_items if not exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='budget_items' AND column_name='item_type') THEN
    ALTER TABLE public.budget_items ADD COLUMN item_type text DEFAULT 'expense';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='budget_items' AND column_name='frequency') THEN
    ALTER TABLE public.budget_items ADD COLUMN frequency text DEFAULT 'weekly';
  END IF;
END $$;

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER budget_inputs_updated_at
  BEFORE UPDATE ON public.budget_inputs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER budget_uploads_updated_at
  BEFORE UPDATE ON public.budget_uploads
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();