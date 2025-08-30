-- Ensure budget_items table exists for storing detailed budget line items
CREATE TABLE IF NOT EXISTS public.budget_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  planned_cents INTEGER NOT NULL DEFAULT 0,
  actual_cents INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on budget_items
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for budget_items
CREATE POLICY "Users can manage their own budget items" 
ON public.budget_items 
FOR ALL 
USING (
  budget_id IN (
    SELECT id FROM public.budgets WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  budget_id IN (
    SELECT id FROM public.budgets WHERE user_id = auth.uid()
  )
);

-- Add updated_at trigger for budget_items
CREATE TRIGGER update_budget_items_updated_at
BEFORE UPDATE ON public.budget_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();