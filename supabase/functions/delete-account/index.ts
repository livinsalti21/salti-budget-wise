import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { EdgeFunctionLogger } from '../_shared/logger.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const logger = new EdgeFunctionLogger('delete-account');

  try {
    // Authenticate the user first
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create client with user's auth to verify identity
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()
    
    if (authError || !user) {
      logger.warn('Auth failed', { error: authError });
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { user_id } = await req.json()

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify the authenticated user can only delete their own account
    if (user_id !== user.id) {
      logger.warn('Unauthorized deletion attempt', { requester: user.id, target: user_id });
      return new Response(
        JSON.stringify({ error: 'Forbidden - Can only delete your own account' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Now use service role client for actual deletion
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Delete user data in order (respecting foreign key constraints)
    const tables = [
      'user_settings',
      'saves', 
      'streaks_daily',
      'streak_windows',
      'budgets',
      'budget_items',
      'profiles',
      'group_members',
      'referrals'
    ]

    // Delete from each table
    for (const table of tables) {
      const { error } = await supabaseClient
        .from(table)
        .delete()
        .eq('user_id', user_id)
      
      if (error) {
        logger.warn(`Failed to delete from ${table}`, { table, error });
        // Continue with other tables even if one fails
      }
    }

    // Delete the auth user (this will cascade delete remaining references)
    const { error: authError } = await supabaseClient.auth.admin.deleteUser(user_id)
    
    if (authError) {
      logger.error('Failed to delete auth user', authError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete user account' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    logger.info('Account deleted', { user_id });

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    logger.error('Delete account failed', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})