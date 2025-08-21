-- Update budgets table to use weekly periods instead of monthly
ALTER TABLE public.budgets 
RENAME COLUMN month TO week_start_date;

-- Update the data type and description for weekly budgeting
COMMENT ON COLUMN public.budgets.week_start_date IS 'Start date of the budget week (Monday)';

-- Update default title to reflect weekly budgeting
ALTER TABLE public.budgets 
ALTER COLUMN title SET DEFAULT 'Weekly Budget';

-- Create a function to get the start of the current week (Monday)
CREATE OR REPLACE FUNCTION get_week_start(input_date DATE DEFAULT CURRENT_DATE)
RETURNS DATE
LANGUAGE SQL
IMMUTABLE
AS $$
    SELECT (input_date - INTERVAL '1 day' * EXTRACT(DOW FROM input_date - 1))::DATE;
$$;

-- Create index for efficient weekly budget queries
CREATE INDEX IF NOT EXISTS idx_budgets_user_week ON public.budgets(user_id, week_start_date);

-- Update existing monthly budgets to be weekly budgets
-- Convert existing monthly budgets to the start of their respective weeks
UPDATE public.budgets 
SET week_start_date = get_week_start(week_start_date::DATE),
    title = CASE 
        WHEN title LIKE '%Monthly%' THEN REPLACE(title, 'Monthly', 'Weekly')
        ELSE 'Weekly Budget'
    END;