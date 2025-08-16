import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYDAY-RUNNER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Payday runner triggered");

    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const now = new Date();
    logStep("Current time", { now: now.toISOString() });

    // Get rules that are due to run
    const { data: dueRules, error: rulesError } = await supabaseServiceClient
      .from('payday_rules')
      .select('*')
      .eq('is_active', true)
      .lte('next_run_at', now.toISOString());

    if (rulesError) throw new Error(`Error fetching due rules: ${rulesError.message}`);
    if (!dueRules || dueRules.length === 0) {
      logStep("No rules due for execution");
      return new Response(JSON.stringify({ message: "No rules due" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Found due rules", { count: dueRules.length });

    let executedCount = 0;
    let errorCount = 0;

    // Process each rule
    for (const rule of dueRules) {
      try {
        logStep("Processing rule", { rule_id: rule.id, user_id: rule.user_id });

        // Create save event
        const { data: saveEvent, error: saveError } = await supabaseServiceClient
          .from('save_events')
          .insert({
            user_id: rule.user_id,
            stacklet_id: rule.stacklet_id,
            amount_cents: rule.amount_cents,
            source: 'payday_rule',
            note: 'Automatic payday rule save'
          })
          .select()
          .single();

        if (saveError) throw new Error(`Error creating save event: ${saveError.message}`);
        logStep("Created save event", { save_event_id: saveEvent.id });

        // Calculate next run time
        let nextRun = new Date(rule.next_run_at);
        switch (rule.trigger_cadence) {
          case 'weekly':
            nextRun.setDate(nextRun.getDate() + 7);
            break;
          case 'biweekly':
            nextRun.setDate(nextRun.getDate() + 14);
            break;
          case 'monthly':
            nextRun.setMonth(nextRun.getMonth() + 1);
            break;
        }

        // Update rule with next run time
        const { error: updateError } = await supabaseServiceClient
          .from('payday_rules')
          .update({
            next_run_at: nextRun.toISOString()
          })
          .eq('id', rule.id);

        if (updateError) throw new Error(`Error updating rule: ${updateError.message}`);
        logStep("Updated rule next run", { rule_id: rule.id, next_run: nextRun.toISOString() });

        // Trigger match engine for this save
        try {
          const matchEngineUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/match-engine`;
          const response = await fetch(matchEngineUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
            },
            body: JSON.stringify({
              save_event_id: saveEvent.id,
              user_id: rule.user_id,
              amount_cents: rule.amount_cents
            })
          });

          if (!response.ok) {
            logStep("Match engine call failed", { status: response.status });
          } else {
            logStep("Match engine triggered successfully");
          }
        } catch (matchError) {
          logStep("Error calling match engine", { error: matchError.message });
        }

        executedCount++;

      } catch (ruleError) {
        logStep("Error processing rule", { rule_id: rule.id, error: ruleError.message });
        errorCount++;
      }
    }

    logStep("Payday runner completed", { executedCount, errorCount });
    return new Response(JSON.stringify({ 
      message: "Payday runner completed",
      executed: executedCount,
      errors: errorCount
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in payday-runner", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});