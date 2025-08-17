import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MATCH-ENGINE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Match engine triggered");

    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const body = await req.json();
    
    // Enhanced input validation with sanitization
    const { save_event_id, user_id, amount_cents } = body;
    
    if (!save_event_id || typeof save_event_id !== 'string') {
      throw new Error('Invalid save_event_id');
    }
    
    if (!user_id || typeof user_id !== 'string') {
      throw new Error('Invalid user_id');
    }
    
    if (!amount_cents || typeof amount_cents !== 'number' || amount_cents <= 0) {
      throw new Error('Invalid amount_cents');
    }

    // Validate UUIDs format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(save_event_id) || !uuidRegex.test(user_id)) {
      throw new Error('Invalid UUID format');
    }

    // Rate limiting check
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const { count: recentMatches } = await supabaseServiceClient
      .from('match_events')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_user_id', user_id)
      .gte('created_at', oneMinuteAgo);

    if (recentMatches && recentMatches > 10) {
      throw new Error('Rate limit exceeded for match events');
    }

    logStep("Processing save event", { save_event_id, user_id, amount_cents });

    // Get active match rules for this user
    const { data: matchRules, error: rulesError } = await supabaseServiceClient
      .from('match_rules')
      .select(`
        *,
        sponsors (*)
      `)
      .eq('recipient_user_id', user_id)
      .eq('status', 'active');

    if (rulesError) throw new Error(`Error fetching match rules: ${rulesError.message}`);
    if (!matchRules || matchRules.length === 0) {
      logStep("No active match rules found");
      return new Response(JSON.stringify({ message: "No match rules" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Found match rules", { count: matchRules.length });

    // Process each match rule
    for (const rule of matchRules) {
      try {
        logStep("Processing match rule", { rule_id: rule.id, percent: rule.percent });

        // Calculate match amount
        const matchAmount = Math.round((amount_cents * rule.percent) / 100);
        
        // Check weekly cap using secure RPC function with validated parameters
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
        weekStart.setHours(0, 0, 0, 0);

        const { data: weeklySpend, error: capError } = await supabaseServiceClient
          .rpc('get_weekly_match_spend', {
            rule_id: rule.id,
            week_start: weekStart.toISOString().split('T')[0]
          });

        if (capError) {
          logStep('Error checking weekly cap', capError);
          continue;
        }

        const remainingCap = rule.cap_cents_weekly - (weeklySpend || 0);
        const finalMatchAmount = Math.min(matchAmount, Math.max(0, remainingCap));

        logStep("Match calculation", {
          matchAmount,
          weeklySpend,
          remainingCap,
          finalMatchAmount
        });

        if (finalMatchAmount <= 0) {
          logStep("Weekly cap reached, skipping match");
          continue;
        }

        // Create match event
        const { data: matchEvent, error: matchError } = await supabaseServiceClient
          .from('match_events')
          .insert({
            match_rule_id: rule.id,
            save_event_id: save_event_id,
            sponsor_id: rule.sponsor_id,
            recipient_user_id: user_id,
            original_amount_cents: amount_cents,
            match_amount_cents: finalMatchAmount,
            charge_status: 'pending'
          })
          .select()
          .single();

        if (matchError) throw new Error(`Error creating match event: ${matchError.message}`);
        logStep("Created match event", { match_event_id: matchEvent.id });

        // Process Stripe payment
        if (rule.sponsors?.stripe_customer_id) {
          try {
            const paymentIntent = await stripe.paymentIntents.create({
              amount: finalMatchAmount,
              currency: 'usd',
              customer: rule.sponsors.stripe_customer_id,
              payment_method_types: ['card'],
              off_session: true,
              confirm: true,
              metadata: {
                match_event_id: matchEvent.id,
                recipient_user_id: user_id,
                original_save_amount: amount_cents.toString()
              }
            });

            logStep("Stripe payment created", { payment_intent_id: paymentIntent.id });

            // Update match event with payment intent
            await supabaseServiceClient
              .from('match_events')
              .update({
                stripe_payment_intent_id: paymentIntent.id,
                charge_status: paymentIntent.status === 'succeeded' ? 'succeeded' : 'pending'
              })
              .eq('id', matchEvent.id);

            if (paymentIntent.status === 'succeeded') {
              logStep("Payment succeeded immediately");
              
              // Log security event
              await supabaseServiceClient.from('security_audit_log').insert({
                user_id,
                event_type: 'match_processed',
                event_details: {
                  match_event_id: matchEvent.id,
                  amount_cents: finalMatchAmount,
                  rule_id: rule.id,
                  payment_intent_id: paymentIntent.id
                },
                user_agent: req.headers.get('User-Agent')
              });
              
              // If CASH match, transfer to recipient (would need Stripe Connect setup)
              if (rule.asset_type === 'CASH') {
                logStep("CASH match completed");
              } else if (rule.asset_type === 'BTC') {
                // Trigger BTC purchase
                logStep("Triggering BTC purchase for match");
                // Would call BTC auto-buy function here
              }
            }

          } catch (stripeError) {
            logStep("Stripe payment failed", { error: stripeError.message });
            
            await supabaseServiceClient
              .from('match_events')
              .update({
                charge_status: 'failed'
              })
              .eq('id', matchEvent.id);
          }
        }

      } catch (ruleError) {
        logStep("Error processing rule", { rule_id: rule.id, error: ruleError.message });
      }
    }

    logStep("Match engine completed");
    return new Response(JSON.stringify({ message: "Match processing completed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in match-engine", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});