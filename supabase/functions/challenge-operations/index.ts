import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, ...payload } = await req.json();

    switch (action) {
      case 'join_challenge':
        return await joinChallenge(supabase, user.id, payload);
      case 'claim_reward':
        return await claimReward(supabase, user.id, payload);
      case 'get_my_challenges':
        return await getMyChallenges(supabase, user.id);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Challenge operations error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function joinChallenge(supabase: any, userId: string, payload: any) {
  const { challengeId } = payload;

  // Get challenge details
  const { data: challenge, error: challengeError } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', challengeId)
    .single();

  if (challengeError || !challenge) {
    return new Response(JSON.stringify({ error: 'Challenge not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Check if challenge is joinable
  if (challenge.status !== 'upcoming' && challenge.status !== 'active') {
    return new Response(JSON.stringify({ error: 'Challenge is not available for joining' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Check if user has already joined
  const { data: existing } = await supabase
    .from('challenge_participants')
    .select('id')
    .eq('challenge_id', challengeId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    return new Response(JSON.stringify({ error: 'Already joined this challenge' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Check participant limit
  if (challenge.current_participants >= challenge.max_participants) {
    return new Response(JSON.stringify({ error: 'Challenge is full' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Get user balance
  const { data: account } = await supabase
    .from('user_accounts')
    .select('current_balance_cents')
    .eq('user_id', userId)
    .single();

  const userBalance = account?.current_balance_cents || 0;

  // Check if user has enough balance for entry fee
  if (userBalance < challenge.entry_fee_cents) {
    return new Response(JSON.stringify({ error: 'Insufficient balance for entry fee' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Deduct entry fee from user account (if entry fee > 0)
  if (challenge.entry_fee_cents > 0) {
    const { error: ledgerError } = await supabase
      .from('user_ledger')
      .insert({
        user_id: userId,
        transaction_type: 'CHALLENGE_ENTRY',
        amount_cents: -challenge.entry_fee_cents,
        running_balance_cents: userBalance - challenge.entry_fee_cents,
        description: `Entry fee for challenge: ${challenge.title}`,
        reference_id: challengeId,
      });

    if (ledgerError) throw ledgerError;

    // Update user account balance
    await supabase
      .from('user_accounts')
      .update({ current_balance_cents: userBalance - challenge.entry_fee_cents })
      .eq('user_id', userId);
  }

  // Join the challenge
  const { data: participant, error: joinError } = await supabase
    .from('challenge_participants')
    .insert({
      challenge_id: challengeId,
      user_id: userId,
      entry_fee_paid_cents: challenge.entry_fee_cents,
    })
    .select()
    .single();

  if (joinError) throw joinError;

  // Log activity
  await supabase
    .from('challenge_activities')
    .insert({
      challenge_id: challengeId,
      participant_id: participant.id,
      activity_type: 'joined',
      amount_cents: challenge.entry_fee_cents,
    });

  return new Response(
    JSON.stringify({ success: true, participant }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function claimReward(supabase: any, userId: string, payload: any) {
  const { challengeId } = payload;

  // Get participant data
  const { data: participant, error: participantError } = await supabase
    .from('challenge_participants')
    .select('*')
    .eq('challenge_id', challengeId)
    .eq('user_id', userId)
    .single();

  if (participantError || !participant) {
    return new Response(JSON.stringify({ error: 'Participant not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Check if already claimed
  if (participant.reward_claimed) {
    return new Response(JSON.stringify({ error: 'Reward already claimed' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Check if there's a reward to claim
  if (participant.reward_cents <= 0) {
    return new Response(JSON.stringify({ error: 'No reward available' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Get current balance
  const { data: account } = await supabase
    .from('user_accounts')
    .select('current_balance_cents')
    .eq('user_id', userId)
    .single();

  const currentBalance = account?.current_balance_cents || 0;
  const newBalance = currentBalance + participant.reward_cents;

  // Add reward to user ledger
  await supabase
    .from('user_ledger')
    .insert({
      user_id: userId,
      transaction_type: 'CHALLENGE_REWARD',
      amount_cents: participant.reward_cents,
      running_balance_cents: newBalance,
      description: `Challenge reward claimed`,
      reference_id: challengeId,
    });

  // Update user account balance
  await supabase
    .from('user_accounts')
    .update({ current_balance_cents: newBalance })
    .eq('user_id', userId);

  // Mark reward as claimed
  await supabase
    .from('challenge_participants')
    .update({ reward_claimed: true })
    .eq('id', participant.id);

  // Log activity
  await supabase
    .from('challenge_activities')
    .insert({
      challenge_id: challengeId,
      participant_id: participant.id,
      activity_type: 'claimed_reward',
      amount_cents: participant.reward_cents,
    });

  return new Response(
    JSON.stringify({ success: true, reward_cents: participant.reward_cents }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function getMyChallenges(supabase: any, userId: string) {
  const { data: challenges, error } = await supabase
    .from('challenge_participants')
    .select(`
      *,
      challenges (*)
    `)
    .eq('user_id', userId)
    .order('joined_at', { ascending: false });

  if (error) throw error;

  return new Response(
    JSON.stringify({ challenges }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
