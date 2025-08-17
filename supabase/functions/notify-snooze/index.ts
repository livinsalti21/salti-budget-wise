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
    const { push_id, duration_hours = 24 } = body;

    if (!push_id) {
      return new Response('Push ID required', { status: 400, headers: corsHeaders });
    }

    // Calculate snooze until time
    const snoozeUntil = new Date();
    snoozeUntil.setHours(snoozeUntil.getHours() + duration_hours);

    // Mark push as acted
    const { error: pushError } = await supabase
      .from('push_events')
      .update({ 
        status: 'acted',
        acted_at: new Date().toISOString()
      })
      .eq('id', push_id)
      .eq('user_id', user.id);

    if (pushError) throw pushError;

    // Log the snooze action
    const { error: logError } = await supabase
      .from('push_action_logs')
      .insert({
        push_event_id: push_id,
        user_id: user.id,
        action: 'snooze',
        action_data: { 
          duration_hours,
          snooze_until: snoozeUntil.toISOString()
        }
      });

    if (logError) throw logError;

    // TODO: Schedule a new push notification for the snooze time
    // This would typically involve a background job or scheduler
    // For MVP, we'll just log the snooze and rely on daily trigger checks

    console.log('Notification snoozed:', {
      user_id: user.id,
      push_id,
      duration_hours,
      snooze_until: snoozeUntil.toISOString()
    });

    return new Response(
      JSON.stringify({ 
        status: 'ok',
        snooze_until: snoozeUntil.toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in notify-snooze:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});