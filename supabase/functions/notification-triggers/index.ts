import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { EdgeFunctionLogger } from '../_shared/logger.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  const logger = new EdgeFunctionLogger('notification-triggers');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    logger.info('Running notification triggers');

    const now = new Date();
    const currentHour = now.getHours();

    await checkPaydayTriggers(supabase, now, logger);
    await checkRoundupTriggers(supabase, logger);

    if (currentHour >= 18 && currentHour <= 20) {
      await checkStreakGuardTriggers(supabase, now, logger);
    }

    await cleanupExpiredInvites(supabase, logger);

    logger.info('Notification triggers completed successfully');

    return new Response(
      JSON.stringify({ status: 'success', timestamp: now.toISOString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logger.error('Error in notification triggers', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function checkPaydayTriggers(supabase: any, now: Date, logger: any) {
  logger.info('Checking payday triggers');

  const { data: paydayRules, error } = await supabase
    .from('payday_rules')
    .select(`
      *,
      user:profiles!inner(id, timezone),
      stacklet:stacklets(id, title)
    `)
    .eq('is_active', true)
    .lte('next_run_at', now.toISOString());

  if (error) {
    logger.error('Error fetching payday rules', error);
    return;
  }

  for (const rule of paydayRules || []) {
    try {
      await createPaydayPush(supabase, rule, logger);
      
      const nextRun = calculateNextRun(rule.trigger_cadence, now);
      await supabase
        .from('payday_rules')
        .update({ next_run_at: nextRun })
        .eq('id', rule.id);

    } catch (error) {
      logger.error(`Error creating payday push for rule ${rule.id}`, error);
    }
  }
}

async function createPaydayPush(supabase: any, rule: any, logger: any) {
  const suggestedAmount = Math.max(500, Math.min(rule.amount_cents, 5000));
  const impact30Year = calculateImpact(suggestedAmount);

  const payload = {
    type: 'payday',
    title: 'Payday just hit 🎉',
    body: `Stack 5% ($${(suggestedAmount / 100).toFixed(2)}) → +$${impact30Year.toLocaleString()} in 30 yrs`,
    amount_cents: suggestedAmount,
    stacklet_id: rule.stacklet_id,
    actions: [
      {
        type: 'stack_now',
        label: 'Stack Now',
        deep_link: `/app/save/confirm?amount_cents=${suggestedAmount}&source=payday&stacklet_id=${rule.stacklet_id}`
      },
      {
        type: 'choose_amount',
        label: 'Choose Amount',
        deep_link: `/app/save/choose?default_cents=${suggestedAmount}&source=payday&stacklet_id=${rule.stacklet_id}`
      },
      {
        type: 'snooze',
        label: 'Snooze 24h',
        deep_link: `/app/notify/snooze?duration_hours=24`
      }
    ]
  };

  const { error } = await supabase
    .from('push_events')
    .insert({
      user_id: rule.user_id,
      type: 'payday',
      payload,
      scheduled_for: new Date().toISOString()
    });

  if (error) throw error;
  logger.info(`Created payday push for user ${rule.user_id}`);
}

async function checkRoundupTriggers(supabase: any, logger: any) {
  logger.info('Checking roundup triggers');

  const { data: roundups, error } = await supabase
    .from('roundup_accumulator')
    .select('*')
    .gte('accumulated_cents', 500)
    .eq('auto_convert_enabled', false);

  if (error) {
    logger.error('Error fetching roundups', error);
    return;
  }

  for (const roundup of roundups || []) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: todaySaves } = await supabase
        .from('save_events')
        .select('id')
        .eq('user_id', roundup.user_id)
        .gte('created_at', `${today}T00:00:00Z`);

      if (todaySaves && todaySaves.length > 0) {
        logger.debug(`User ${roundup.user_id} already saved today, skipping roundup trigger`);
        continue;
      }

      await createRoundupPush(supabase, roundup, logger);

    } catch (error) {
      logger.error(`Error creating roundup push for user ${roundup.user_id}`, error);
    }
  }
}

async function createRoundupPush(supabase: any, roundup: any, logger: any) {
  const payload = {
    type: 'roundup',
    title: 'Round-ups Ready! 💰',
    body: `Your round-ups hit $${(roundup.accumulated_cents / 100).toFixed(2)}. Convert to a stack in one tap.`,
    amount_cents: roundup.accumulated_cents,
    actions: [
      {
        type: 'stack_now',
        label: `Stack $${(roundup.accumulated_cents / 100).toFixed(2)}`,
        deep_link: `/app/save/confirm?amount_cents=${roundup.accumulated_cents}&source=roundup`
      },
      {
        type: 'auto_convert',
        label: 'Auto-convert On',
        deep_link: `/app/settings/roundups?auto_convert=true`
      },
      {
        type: 'snooze',
        label: 'Snooze',
        deep_link: `/app/notify/snooze?duration_hours=24`
      }
    ]
  };

  const { error } = await supabase
    .from('push_events')
    .insert({
      user_id: roundup.user_id,
      type: 'roundup',
      payload,
      scheduled_for: new Date().toISOString()
    });

  if (error) throw error;
  logger.info(`Created roundup push for user ${roundup.user_id}`);
}

async function checkStreakGuardTriggers(supabase: any, now: Date, logger: any) {
  logger.info('Checking streak guard triggers');

  const today = new Date().toISOString().split('T')[0];
  
  const { data: streaks, error } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('is_active', true)
    .gt('consecutive_days', 0);

  if (error) {
    logger.error('Error fetching streaks', error);
    return;
  }

  for (const streak of streaks || []) {
    try {
      const { data: todaySaves } = await supabase
        .from('save_events')
        .select('id')
        .eq('user_id', streak.user_id)
        .gte('created_at', `${today}T00:00:00Z`);

      if (todaySaves && todaySaves.length > 0) {
        continue;
      }

      await createStreakGuardPush(supabase, streak, logger);

    } catch (error) {
      logger.error(`Error creating streak guard push for user ${streak.user_id}`, error);
    }
  }
}

async function createStreakGuardPush(supabase: any, streak: any, logger: any) {
  const payload = {
    type: 'streak_guard',
    title: 'Protect Your Streak! 🔥',
    body: `Don't break your ${streak.consecutive_days}-day streak—stack any amount.`,
    streak_days: streak.consecutive_days,
    actions: [
      {
        type: 'stack_now',
        label: 'Stack $5',
        deep_link: `/app/save/confirm?amount_cents=500&source=streak_guard`
      },
      {
        type: 'choose_amount',
        label: 'Choose',
        deep_link: `/app/save/choose?default_cents=500&source=streak_guard`
      },
      {
        type: 'snooze',
        label: 'Snooze',
        deep_link: `/app/notify/snooze?duration_hours=4`
      }
    ]
  };

  const { error } = await supabase
    .from('push_events')
    .insert({
      user_id: streak.user_id,
      type: 'streak_guard',
      payload,
      scheduled_for: new Date().toISOString()
    });

  if (error) throw error;
  logger.info(`Created streak guard push for user ${streak.user_id}`);
}

async function cleanupExpiredInvites(supabase: any, logger: any) {
  logger.info('Cleaning up expired invites');

  const { error } = await supabase
    .from('match_invites')
    .update({ status: 'expired' })
    .eq('status', 'pending')
    .lt('expires_at', new Date().toISOString());

  if (error) {
    logger.error('Error cleaning up expired invites', error);
  }
}

function calculateNextRun(cadence: string, from: Date): string {
  const next = new Date(from);
  
  switch (cadence) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      next.setDate(next.getDate() + 7); // Default to weekly
  }
  
  return next.toISOString();
}

function calculateImpact(cents: number): number {
  const monthlyAmount = cents / 100;
  const years = 30;
  const rate = 0.08;
  const monthlyContributions = 12;
  
  const futureValue = monthlyAmount * monthlyContributions * 
    (((1 + rate) ** years - 1) / rate);
  
  return Math.round(futureValue);
}