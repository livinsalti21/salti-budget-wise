import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check for friend streaks that just hit milestones
    const milestones = [7, 14, 30, 50, 100];
    let notificationsSent = 0;
    
    for (const milestone of milestones) {
      const { data: streaks } = await supabase
        .from('friend_streaks')
        .select(`
          *,
          user_profile:profiles!friend_streaks_user_id_fkey(display_name, email),
          friend_profile:profiles!friend_streaks_friend_user_id_fkey(display_name, email)
        `)
        .eq('current_streak', milestone)
        .eq('is_active', true);

      for (const streak of streaks || []) {
        // Create push notification for user
        const { error } = await supabase
          .from('push_events')
          .insert({
            user_id: streak.user_id,
            type: 'friend_streak_milestone',
            payload: {
              title: `🔥 ${milestone}-Day Friend Streak!`,
              body: `You and ${streak.friend_profile?.display_name || 'your friend'} have saved together for ${milestone} days!`,
              data: {
                friend_id: streak.friend_user_id,
                streak_days: milestone,
                deep_link: `/app/match`
              }
            },
            scheduled_for: new Date().toISOString()
          });
          
        if (!error) notificationsSent++;
      }
    }

    console.log(`Friend streak milestone notifications sent: ${notificationsSent}`);

    return new Response(
      JSON.stringify({ success: true, notifications_sent: notificationsSent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in friend-streak-notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
