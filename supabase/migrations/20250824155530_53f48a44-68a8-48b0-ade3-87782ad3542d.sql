-- Phase 1: Enhanced Database Schema for AI-Powered Weekly Budget

-- Update profiles table to include default splits for Pro users
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_splits JSONB DEFAULT '{"save_rate":0.20,"splits":{"groceries":0.4,"gas":0.2,"eating_out":0.2,"fun":0.15,"misc":0.05}}';

-- Create budget_inputs table to store AI-extracted data
CREATE TABLE IF NOT EXISTS budget_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  input_method TEXT DEFAULT 'form' CHECK (input_method IN ('ai', 'form'))
);

-- Create weekly_budgets table for comprehensive tracking
CREATE TABLE IF NOT EXISTS weekly_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  income_weekly NUMERIC NOT NULL DEFAULT 0,
  fixed_weekly NUMERIC NOT NULL DEFAULT 0,
  sinking_weekly NUMERIC NOT NULL DEFAULT 0,
  variable_total NUMERIC NOT NULL DEFAULT 0,
  save_n_stack NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create weekly_budget_lines for detailed breakdown
CREATE TABLE IF NOT EXISTS weekly_budget_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_budget_id UUID NOT NULL REFERENCES weekly_budgets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('fixed', 'variable', 'sinking', 'save')),
  name TEXT NOT NULL,
  weekly_amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS budget_inputs_user_created_idx ON budget_inputs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS weekly_budgets_user_week_idx ON weekly_budgets(user_id, week_start_date DESC);
CREATE INDEX IF NOT EXISTS weekly_budget_lines_wb_idx ON weekly_budget_lines(weekly_budget_id);

-- Enable RLS on new tables
ALTER TABLE budget_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_budget_lines ENABLE ROW LEVEL SECURITY;

-- RLS policies for budget_inputs
CREATE POLICY "Users can manage their own budget inputs" ON budget_inputs
  FOR ALL USING (user_id = auth.uid());

-- RLS policies for weekly_budgets
CREATE POLICY "Users can manage their own weekly budgets" ON weekly_budgets
  FOR ALL USING (user_id = auth.uid());

-- RLS policies for weekly_budget_lines
CREATE POLICY "Users can manage their own budget lines" ON weekly_budget_lines
  FOR ALL USING (
    weekly_budget_id IN (
      SELECT id FROM weekly_budgets WHERE user_id = auth.uid()
    )
  );

-- Create function to update weekly_budgets updated_at
CREATE OR REPLACE FUNCTION update_weekly_budgets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for weekly_budgets
CREATE TRIGGER update_weekly_budgets_updated_at
  BEFORE UPDATE ON weekly_budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_weekly_budgets_updated_at();