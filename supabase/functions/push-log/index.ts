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
    const { push_id, event } = body;

    const validEvents = ['delivered', 'opened', 'save_confirmed'];
    if (!push_id || !validEvents.includes(event)) {
      return new Response('Invalid request', { status: 400, headers: corsHeaders });
    }

    // Insert the metric
    const { error: insertError } = await supabase
      .from('push_metrics')
      .insert({
        profile_id: user.id,
        push_id,
        event
      });

    if (insertError) throw insertError;

    console.log('Push metric logged:', {
      profile_id: user.id,
      push_id,
      event
    });

    return new Response(
      JSON.stringify({ status: 'ok' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in push-log:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});