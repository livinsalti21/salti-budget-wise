import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') ?? '' }
        }
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const body = await req.json();
    const { amount_cents, source = 'manual', push_id, idempotency_key } = body;

    if (!amount_cents || amount_cents <= 0) {
      return new Response('Invalid amount', { status: 400, headers: corsHeaders });
    }

    // Check for existing save with same idempotency key
    if (idempotency_key) {
      const { data: existingSave } = await supabase
        .from('save_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('note', `idempotency:${idempotency_key}`)
        .single();

      if (existingSave) {
        console.log('Returning existing save for idempotency key:', idempotency_key);
        return new Response(
          JSON.stringify({ save: existingSave, status: 'existing' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get user's active stacklet or create default
    let { data: stacklet } = await supabase
      .from('stacklets')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!stacklet) {
      // Create default stacklet
      const { data: newStacklet, error: stackletError } = await supabase
        .from('stacklets')
        .insert({
          user_id: user.id,
          title: 'General Savings',
          emoji: '💰',
          target_cents: 50000 // $500 default target
        })
        .select()
        .single();

      if (stackletError) throw stackletError;
      stacklet = newStacklet;
    }

    // Create the save event
    const { data: saveEvent, error: saveError } = await supabase
      .from('save_events')
      .insert({
        user_id: user.id,
        stacklet_id: stacklet.id,
        amount_cents,
        source,
        note: idempotency_key ? `idempotency:${idempotency_key}` : null
      })
      .select()
      .single();

    if (saveError) throw saveError;

    // Mark push as acted if provided
    if (push_id) {
      await supabase
        .from('push_events')
        .update({ 
          status: 'acted',
          acted_at: new Date().toISOString()
        })
        .eq('id', push_id)
        .eq('user_id', user.id);

      // Log the action
      await supabase
        .from('push_action_logs')
        .insert({
          push_event_id: push_id,
          user_id: user.id,
          action: 'save',
          action_data: { save_event_id: saveEvent.id, amount_cents }
        });
    }

    console.log('Save confirmed:', {
      user_id: user.id,
      save_id: saveEvent.id,
      amount_cents,
      source,
      push_id
    });

    return new Response(
      JSON.stringify({ 
        save: saveEvent, 
        stacklet,
        status: 'created' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in save-confirm:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});