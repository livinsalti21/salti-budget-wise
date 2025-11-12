import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { EdgeFunctionLogger } from "../_shared/logger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const logger = new EdgeFunctionLogger("generate-save-caption");

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Authentication failed");
    }

    logger.info("Generating save caption", { user_id: user.id });

    const { amount_cents, note, photo_url } = await req.json();

    if (!amount_cents || typeof amount_cents !== "number") {
      throw new Error("Invalid amount_cents");
    }

    // Calculate 40-year projection (using 10% annual return)
    const years = 40;
    const rate = 0.10;
    const amount_dollars = amount_cents / 100;
    const future_value = amount_dollars * Math.pow(1 + rate, years);

    // Build context for AI
    const context = `
A user just saved $${amount_dollars.toFixed(2)}.
${note ? `Their note: "${note}"` : ""}
${photo_url ? "They attached a photo to commemorate this save." : ""}

This save could grow to $${future_value.toFixed(2)} in 40 years with 10% annual returns.

Generate a SHORT, motivational caption (1-2 sentences max) that:
- Celebrates this specific save moment
- References the 40-year impact naturally
- Feels personal and encouraging
- Is concise and shareable

Examples of good captions:
"☕ That coffee money just became $64,000 in future wealth. Small choices, massive impact."
"🎯 $5.50 saved today = freedom fund of tomorrow. Keep stacking!"
"💪 Every dollar is a soldier in your wealth army. This one's worth $11,636 in 40 years."
`;

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a financial motivation expert. Create SHORT, punchy captions that inspire action. Be enthusiastic but authentic. Use emojis sparingly. Maximum 2 sentences."
          },
          {
            role: "user",
            content: context
          }
        ],
        max_tokens: 100,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      logger.error("AI gateway error", { status: aiResponse.status, error: errorText });
      
      // Fallback caption
      return new Response(
        JSON.stringify({
          caption: `💰 $${amount_dollars.toFixed(2)} saved today could become $${future_value.toFixed(2)} in 40 years. Your future self thanks you! 🚀`,
          future_value_40y: Math.round(future_value * 100),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const caption = aiData.choices?.[0]?.message?.content?.trim() || 
      `💰 $${amount_dollars.toFixed(2)} saved today could become $${future_value.toFixed(2)} in 40 years. Your future self thanks you! 🚀`;

    logger.info("Caption generated successfully");

    return new Response(
      JSON.stringify({
        caption,
        future_value_40y: Math.round(future_value * 100),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    logger.error("Error generating caption", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
