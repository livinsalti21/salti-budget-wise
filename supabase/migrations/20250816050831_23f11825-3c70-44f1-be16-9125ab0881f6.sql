-- Create budget_templates table for premium templates
CREATE TABLE public.budget_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 399, -- $3.99
  template_data JSONB NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create template_purchases table to track purchases
CREATE TABLE public.template_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  template_id UUID NOT NULL REFERENCES public.budget_templates(id),
  purchase_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  amount_cents INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'completed'
);

-- Create budget_uploads table for CSV/Sheets uploads
CREATE TABLE public.budget_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  filename TEXT NOT NULL,
  file_data JSONB NOT NULL,
  upload_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'processed'
);

-- Create linked_accounts table for Plaid integration
CREATE TABLE public.linked_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  account_id TEXT NOT NULL, -- Plaid account ID
  access_token TEXT NOT NULL, -- Encrypted Plaid access token
  institution_name TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  balance_cents INTEGER,
  last_sync TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create ai_suggestions table for expense coaching
CREATE TABLE public.ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  suggestion_text TEXT NOT NULL,
  category TEXT NOT NULL,
  potential_savings_cents INTEGER,
  future_value_projection JSONB,
  is_applied BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.budget_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linked_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for budget_templates (public read)
CREATE POLICY "Templates are viewable by everyone" 
ON public.budget_templates FOR SELECT USING (is_active = true);

-- RLS Policies for template_purchases
CREATE POLICY "Users can view their own purchases" 
ON public.template_purchases FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own purchases" 
ON public.template_purchases FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for budget_uploads
CREATE POLICY "Users can manage their own uploads" 
ON public.budget_uploads FOR ALL USING (user_id = auth.uid());

-- RLS Policies for linked_accounts
CREATE POLICY "Users can manage their own accounts" 
ON public.linked_accounts FOR ALL USING (user_id = auth.uid());

-- RLS Policies for ai_suggestions
CREATE POLICY "Users can view their own suggestions" 
ON public.ai_suggestions FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create suggestions" 
ON public.ai_suggestions FOR INSERT WITH CHECK (true);

-- Insert sample budget templates
INSERT INTO public.budget_templates (name, description, price_cents, template_data, category) VALUES
('College Student Budget', 'Perfect for managing income, tuition, textbooks, and social life', 399, 
 '{"categories": ["Tuition", "Textbooks", "Food", "Entertainment", "Transportation", "Savings"], "monthly_budget": 1500}', 'student'),
('Young Professional', 'Ideal for entry-level professionals managing rent, career growth, and savings', 399,
 '{"categories": ["Rent", "Groceries", "Transportation", "Career Development", "Emergency Fund", "Retirement"], "monthly_budget": 4000}', 'professional'),
('Side Hustle Tracker', 'Track multiple income streams and business expenses', 399,
 '{"categories": ["Primary Income", "Side Income", "Business Expenses", "Taxes", "Reinvestment", "Personal"], "monthly_budget": 2500}', 'entrepreneur');

-- Create triggers for updated_at
CREATE TRIGGER update_budget_templates_updated_at
  BEFORE UPDATE ON public.budget_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_linked_accounts_updated_at
  BEFORE UPDATE ON public.linked_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();