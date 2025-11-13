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

    console.log('Starting challenge score update...');

    // Get all active challenges
    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .select('*')
      .eq('status', 'active');

    if (challengesError) throw challengesError;

    console.log(`Found ${challenges?.length || 0} active challenges`);

    for (const challenge of challenges || []) {
      await updateChallengeScores(supabase, challenge);
      
      // Check if challenge has ended
      if (new Date(challenge.end_date) < new Date()) {
        await finalizeChallenge(supabase, challenge.id);
      }
    }

    // Activate upcoming challenges that should start
    const { data: upcomingChallenges } = await supabase
      .from('challenges')
      .select('id')
      .eq('status', 'upcoming')
      .lte('start_date', new Date().toISOString());

    for (const challenge of upcomingChallenges || []) {
      await supabase
        .from('challenges')
        .update({ status: 'active' })
        .eq('id', challenge.id);
      
      console.log(`Activated challenge ${challenge.id}`);
    }

    return new Response(
      JSON.stringify({ success: true, updated: challenges?.length || 0 }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Update challenge scores error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function updateChallengeScores(supabase: any, challenge: any) {
  const challengeStart = new Date(challenge.start_date);
  const challengeEnd = new Date(challenge.end_date);
  
  // Get all participants
  const { data: participants } = await supabase
    .from('challenge_participants')
    .select('id, user_id')
    .eq('challenge_id', challenge.id);

  for (const participant of participants || []) {
    // Get saves during challenge period
    const { data: saves } = await supabase
      .from('save_events')
      .select('amount_cents, created_at')
      .eq('user_id', participant.user_id)
      .gte('created_at', challengeStart.toISOString())
      .lte('created_at', challengeEnd.toISOString());

    // Calculate metrics
    const totalSavedCents = saves?.reduce((sum, s) => sum + s.amount_cents, 0) || 0;
    const saveCount = saves?.length || 0;

    // Calculate streak during challenge period
    const saveDates = new Set(
      saves?.map(s => new Date(s.created_at).toISOString().split('T')[0]) || []
    );
    const streakDays = calculateStreak(saveDates, challengeStart, challengeEnd);

    // Calculate score using the scoring function
    const { data: scoreResult } = await supabase.rpc('calculate_challenge_score', {
      p_total_saved_cents: totalSavedCents,
      p_save_count: saveCount,
      p_streak_days: streakDays,
      p_scoring_rules: challenge.scoring_rules,
    });

    const score = scoreResult || 0;

    // Update participant
    await supabase
      .from('challenge_participants')
      .update({
        total_saved_cents: totalSavedCents,
        save_count: saveCount,
        streak_days: streakDays,
        score: score,
        updated_at: new Date().toISOString(),
      })
      .eq('id', participant.id);
  }

  // Update rankings
  await supabase.rpc('update_challenge_rankings', {
    p_challenge_id: challenge.id,
  });

  console.log(`Updated scores for challenge ${challenge.id}`);
}

function calculateStreak(saveDates: Set<string>, startDate: Date, endDate: Date): number {
  let streak = 0;
  let maxStreak = 0;
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    if (saveDates.has(dateStr)) {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 0;
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return maxStreak;
}

async function finalizeChallenge(supabase: any, challengeId: string) {
  console.log(`Finalizing challenge ${challengeId}`);
  
  // Distribute rewards
  await supabase.rpc('distribute_challenge_rewards', {
    p_challenge_id: challengeId,
  });

  // Log winners
  const { data: winners } = await supabase
    .from('challenge_participants')
    .select('*, profiles (display_name)')
    .eq('challenge_id', challengeId)
    .gt('reward_cents', 0)
    .order('rank');

  for (const winner of winners || []) {
    await supabase
      .from('challenge_activities')
      .insert({
        challenge_id: challengeId,
        participant_id: winner.id,
        activity_type: 'won',
        amount_cents: winner.reward_cents,
        metadata: { rank: winner.rank },
      });
  }

  console.log(`Challenge ${challengeId} finalized with ${winners?.length || 0} winners`);
}
