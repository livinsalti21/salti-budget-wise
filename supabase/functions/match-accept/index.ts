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
    const { invite_id, push_id } = body;

    if (!invite_id) {
      return new Response('Invite ID required', { status: 400, headers: corsHeaders });
    }

    // Get the invite and verify it belongs to the user
    const { data: invite, error: inviteError } = await supabase
      .from('match_invites')
      .select('*')
      .eq('id', invite_id)
      .eq('invitee_id', user.id)
      .eq('status', 'pending')
      .single();

    if (inviteError || !invite) {
      return new Response('Invite not found or already processed', { 
        status: 404, 
        headers: corsHeaders 
      });
    }

    // Check if invite has expired
    if (new Date(invite.expires_at) < new Date()) {
      await supabase
        .from('match_invites')
        .update({ status: 'expired' })
        .eq('id', invite_id);

      return new Response('Invite has expired', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Accept the invite
    const { error: updateError } = await supabase
      .from('match_invites')
      .update({ 
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('id', invite_id);

    if (updateError) throw updateError;

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
          action: 'open',
          action_data: { 
            invite_id,
            action: 'accepted'
          }
        });
    }

    // Create a coop push for the inviter
    const coopPayload = {
      type: 'match_coop',
      title: 'Match Accepted! 🎉',
      body: `Your match invite was accepted! Time to save $${(invite.amount_cents / 100).toFixed(2)} together.`,
      amount_cents: invite.amount_cents,
      invite_id: invite_id,
      actions: [
        {
          type: 'stack_now',
          label: 'Stack Now',
          deep_link: `/app/save/confirm?amount_cents=${invite.amount_cents}&source=match_coop&invite_id=${invite_id}`
        }
      ]
    };

    const { error: pushError } = await supabase
      .from('push_events')
      .insert({
        user_id: invite.inviter_id,
        type: 'match_invite',
        payload: coopPayload,
        scheduled_for: new Date().toISOString()
      });

    if (pushError) {
      console.error('Error creating coop push:', pushError);
      // Don't fail the main operation if push creation fails
    }

    console.log('Match invite accepted:', {
      invite_id,
      invitee_id: user.id,
      inviter_id: invite.inviter_id,
      amount_cents: invite.amount_cents
    });

    return new Response(
      JSON.stringify({ 
        status: 'accepted',
        invite: {
          ...invite,
          status: 'accepted'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in match-accept:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});