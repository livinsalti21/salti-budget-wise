import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error('User not authenticated');
    }

    const { input_text } = await req.json();

    if (!input_text) {
      throw new Error('Input text is required');
    }

    console.log('Processing budget input for user:', user.id);

    // Create AI prompt for budget extraction
    const systemPrompt = `You are the Livin Salti Budget Assistant. Extract financial information from user text into structured JSON format.

From any user input, extract:
1. Incomes (with amount and cadence)
2. Fixed expenses (rent, bills, subscriptions with amount and cadence)  
3. Variable preferences (save rate and category splits)
4. Savings goals (with target amount and due date)

Rules:
- Normalize all cadences to: weekly, biweekly, semimonthly, monthly, annual
- If splits missing, use defaults: groceries:0.4, gas:0.2, eating_out:0.2, fun:0.15, misc:0.05
- If save_rate missing, use 0.20 (20%)
- Infer reasonable values but don't invent amounts
- Due dates should be in YYYY-MM-DD format

Respond ONLY with valid JSON matching this schema:
{
  "incomes": [{"amount": number, "cadence": string, "source": string}],
  "fixed_expenses": [{"name": string, "amount": number, "cadence": string}],
  "variable_preferences": {"save_rate": number, "splits": {"groceries": number, "gas": number, "eating_out": number, "fun": number, "misc": number}},
  "goals": [{"name": string, "target_amount": number, "due_date": string}]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input_text }
        ],
        temperature: 0.1,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to process budget input');
    }

    const data = await response.json();
    const extractedContent = data.choices[0].message.content;

    console.log('AI extracted content:', extractedContent);

    // Parse the JSON response
    let budgetData;
    try {
      budgetData = JSON.parse(extractedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse budget information');
    }

    // Validate and clean the data
    const cleanedData = {
      incomes: budgetData.incomes || [],
      fixed_expenses: budgetData.fixed_expenses || [],
      variable_preferences: {
        save_rate: budgetData.variable_preferences?.save_rate || 0.20,
        splits: budgetData.variable_preferences?.splits || {
          groceries: 0.4,
          gas: 0.2,
          eating_out: 0.2,
          fun: 0.15,
          misc: 0.05
        }
      },
      goals: budgetData.goals || []
    };

    // Store the extracted data in budget_inputs table
    const { error: insertError } = await supabaseClient
      .from('budget_inputs')
      .insert({
        user_id: user.id,
        payload: cleanedData,
        input_method: 'ai'
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error('Failed to save budget data');
    }

    // Also create structured budget record for immediate viewing
    const weekStart = new Date();
    const dayOfWeek = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const { data: budget, error: budgetError } = await supabaseClient
      .from('budgets')
      .upsert({
        user_id: user.id,
        week_start_date: weekStartStr,
        title: `AI Budget - ${new Date().toLocaleDateString()}`
      })
      .select()
      .single();

    if (!budgetError && budget) {
      // Create budget items from AI data
      const budgetItems = [];
      
      // Add income items
      cleanedData.incomes.forEach((income, index) => {
        budgetItems.push({
          budget_id: budget.id,
          category: income.source || `Income ${index + 1}`,
          planned_cents: Math.round(income.amount * 100),
          actual_cents: 0
        });
      });

      // Add fixed expenses
      cleanedData.fixed_expenses.forEach(expense => {
        budgetItems.push({
          budget_id: budget.id,
          category: expense.name,
          planned_cents: Math.round(expense.amount * 100),
          actual_cents: 0
        });
      });

      // Add variable categories
      const variableCategories = [
        { name: 'Groceries', split: cleanedData.variable_preferences.splits.groceries },
        { name: 'Gas', split: cleanedData.variable_preferences.splits.gas },
        { name: 'Eating Out', split: cleanedData.variable_preferences.splits.eating_out },
        { name: 'Fun', split: cleanedData.variable_preferences.splits.fun },
        { name: 'Misc', split: cleanedData.variable_preferences.splits.misc }
      ];

      // Calculate remaining amount for variable spending
      const totalIncome = cleanedData.incomes.reduce((sum, income) => sum + income.amount, 0);
      const totalFixed = cleanedData.fixed_expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const remainder = Math.max(0, totalIncome - totalFixed);
      const saveAmount = remainder * cleanedData.variable_preferences.save_rate;
      const variableAmount = remainder - saveAmount;

      variableCategories.forEach(category => {
        budgetItems.push({
          budget_id: budget.id,
          category: category.name,
          planned_cents: Math.round(variableAmount * category.split * 100),
          actual_cents: 0
        });
      });

      // Add savings
      budgetItems.push({
        budget_id: budget.id,
        category: 'Save n Stack',
        planned_cents: Math.round(saveAmount * 100),
        actual_cents: 0
      });

      await supabaseClient.from('budget_items').insert(budgetItems);
    }

    // Generate coaching tips based on the data
    const tips = [];
    const totalIncome = cleanedData.incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalFixed = cleanedData.fixed_expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    if (totalFixed / totalIncome > 0.7) {
      tips.push("Your fixed expenses are over 70% of income. Consider reducing subscriptions or finding cheaper alternatives.");
    }
    
    if (cleanedData.variable_preferences.save_rate < 0.15) {
      tips.push("Try to save at least 15% of your income for long-term financial health.");
    }

    return new Response(
      JSON.stringify({
        extracted_data: cleanedData,
        tips: tips,
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in ai-budget-assistant function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});