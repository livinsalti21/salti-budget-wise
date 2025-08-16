import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    if (!user) {
      throw new Error('Unauthorized');
    }

    // Get user's recent transactions for analysis
    const { data: transactions } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!transactions || transactions.length === 0) {
      return new Response(JSON.stringify({ 
        suggestions: [],
        message: 'Not enough transaction data for analysis'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Analyze spending patterns with OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPEN AI KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `You are a financial advisor analyzing spending patterns. Provide 3-5 specific, actionable suggestions to reduce expenses. 
            For each suggestion, include:
            - Brief description of the cut
            - Category (food, transportation, entertainment, etc.)
            - Estimated monthly savings in dollars
            - Future value calculation if saved at 8% annual return over 20 years
            
            Format as JSON: {"suggestions": [{"text": "...", "category": "...", "monthly_savings": 50, "future_value_20yr": 2944}]}`
          },
          {
            role: 'user',
            content: `Analyze these transactions and suggest cuts: ${JSON.stringify(transactions.slice(0, 20))}`
          }
        ],
        max_completion_tokens: 1000,
      }),
    });

    const aiData = await openAIResponse.json();
    
    if (!openAIResponse.ok) {
      console.error('OpenAI API error:', aiData);
      throw new Error(`OpenAI API error: ${aiData.error?.message || 'Unknown error'}`);
    }

    const suggestions = JSON.parse(aiData.choices[0].message.content);

    // Store suggestions in database
    const suggestionPromises = suggestions.suggestions.map((suggestion: any) => 
      supabaseClient.from('ai_suggestions').insert({
        user_id: user.id,
        suggestion_text: suggestion.text,
        category: suggestion.category,
        potential_savings_cents: suggestion.monthly_savings * 100,
        future_value_projection: {
          monthly_savings: suggestion.monthly_savings,
          future_value_20yr: suggestion.future_value_20yr
        },
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      })
    );

    await Promise.all(suggestionPromises);

    return new Response(JSON.stringify({ 
      suggestions: suggestions.suggestions,
      message: 'AI analysis complete'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-expense-coach function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});