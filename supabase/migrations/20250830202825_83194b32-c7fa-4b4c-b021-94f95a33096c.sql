-- Update budget_uploads table to support CSV processing tracking
ALTER TABLE public.budget_uploads 
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN IF NOT EXISTS processed_budget_id UUID NULL REFERENCES public.budgets(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_budget_uploads_processed 
ON public.budget_uploads(user_id, processed_at DESC);

-- Update budget_uploads table structure for better CSV handling
ALTER TABLE public.budget_uploads 
ALTER COLUMN file_data TYPE JSONB USING file_data::JSONB;