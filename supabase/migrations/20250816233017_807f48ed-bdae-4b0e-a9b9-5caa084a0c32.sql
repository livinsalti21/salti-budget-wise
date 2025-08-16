-- Create budgets table
CREATE TABLE public.budgets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month date NOT NULL, -- use first of month
  title text DEFAULT 'Monthly Budget',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month)
);

-- Create budget_items table  
CREATE TABLE public.budget_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id uuid NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  category text NOT NULL,
  planned_cents integer NOT NULL CHECK (planned_cents >= 0),
  actual_cents integer NOT NULL DEFAULT 0 CHECK (actual_cents >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for budgets
CREATE POLICY "Users can manage their own budgets" 
ON public.budgets 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

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

-- Create trigger for updating timestamps
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budget_items_updated_at
  BEFORE UPDATE ON public.budget_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();