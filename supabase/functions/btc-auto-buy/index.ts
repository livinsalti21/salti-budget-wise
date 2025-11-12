import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { EdgeFunctionLogger } from '../_shared/logger.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const logger = new EdgeFunctionLogger('btc-auto-buy');

  try {

    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { amount_cents, user_id, stacklet_id, match_event_id } = await req.json();
    logger.info('BTC auto-buy initiated', { amount_cents, user_id, stacklet_id, match_event_id });

    // Mock BTC purchase for now - would integrate with Strike/River/Zero Hash API
    const mockBtcPrice = 45000; // $45,000 per BTC
    const usdAmount = amount_cents / 100;
    const btcQuantity = usdAmount / mockBtcPrice;
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const tradeResult = {
      trade_id: `btc_${Date.now()}`,
      quantity: btcQuantity,
      price_usd: mockBtcPrice,
      status: 'completed'
    };

    logger.debug('BTC purchase completed', tradeResult);

    // Update match event if provided
    if (match_event_id) {
      const { error: updateError } = await supabaseServiceClient
        .from('match_events')
        .update({
          btc_trade_id: tradeResult.trade_id,
          btc_quantity: tradeResult.quantity,
          btc_price_usd: tradeResult.price_usd,
          charge_status: 'succeeded'
        })
        .eq('id', match_event_id);

      if (updateError) throw new Error(`Error updating match event: ${updateError.message}`);
      logger.info('Match event updated with BTC trade data', { match_event_id });
    }

    return new Response(JSON.stringify({
      success: true,
      trade: tradeResult,
      message: `Purchased ${btcQuantity.toFixed(8)} BTC at $${mockBtcPrice}`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('BTC auto-buy failed', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});