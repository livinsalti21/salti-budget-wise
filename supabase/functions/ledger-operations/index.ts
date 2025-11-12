import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { EdgeFunctionLogger } from '../_shared/logger.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  const logger = new EdgeFunctionLogger('ledger-operations');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      logger.error('Auth error', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { operation, amount_cents, transaction_type, description, reference_id, limit = 50, offset = 0, sponsor_id, recipient_user_id, match_event_id } = await req.json()

    if (operation === 'create_ledger_entry') {
      const annualRate = 0.08
      const years = 40
      const futureValue40yr = Math.round(amount_cents * Math.pow(1 + annualRate, years))

      const { data: currentAccount } = await supabase
        .from('user_accounts')
        .select('current_balance_cents')
        .eq('user_id', user.id)
        .single()

      const currentBalance = currentAccount?.current_balance_cents || 0
      const newBalance = currentBalance + amount_cents

      const { data: ledgerEntry, error: ledgerError } = await supabase
        .from('user_ledger')
        .insert({
          user_id: user.id,
          transaction_type,
          amount_cents,
          running_balance_cents: newBalance,
          description,
          reference_id,
          future_value_40yr_cents: futureValue40yr
        })
        .select()
        .single()

      if (ledgerError) {
        logger.error('Ledger error', ledgerError);
        return new Response(JSON.stringify({ error: 'Failed to create ledger entry' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const { data: updatedAccount } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('user_id', user.id)
        .single()

      logger.info('Created ledger entry', { ledger_entry_id: ledgerEntry.id });
      
      return new Response(JSON.stringify({ 
        success: true, 
        ledger_entry: ledgerEntry,
        account_summary: updatedAccount
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (operation === 'get_ledger_history') {
      const { data: ledgerHistory, error: historyError } = await supabase
        .from('user_ledger')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (historyError) {
        logger.error('History error', historyError);
        return new Response(JSON.stringify({ error: 'Failed to fetch ledger history' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ 
        success: true, 
        ledger_history: ledgerHistory
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (operation === 'create_sponsor_ledger_entry') {
      const { data: sponsorAccount } = await supabase
        .from('sponsor_accounts')
        .select('current_outstanding_cents')
        .eq('sponsor_id', sponsor_id)
        .single()

      const currentBalance = sponsorAccount?.current_outstanding_cents || 0
      const newBalance = currentBalance + amount_cents

      const { data: sponsorLedgerEntry, error: sponsorLedgerError } = await supabase
        .from('sponsor_ledger')
        .insert({
          sponsor_id,
          transaction_type,
          amount_cents,
          running_balance_cents: newBalance,
          recipient_user_id,
          match_event_id,
          description
        })
        .select()
        .single()

      if (sponsorLedgerError) {
        logger.error('Sponsor ledger error', sponsorLedgerError);
        return new Response(JSON.stringify({ error: 'Failed to create sponsor ledger entry' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      logger.info('Created sponsor ledger entry', { sponsor_ledger_entry_id: sponsorLedgerEntry.id });
      
      return new Response(JSON.stringify({ 
        success: true, 
        sponsor_ledger_entry: sponsorLedgerEntry
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid operation' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    logger.error('Function error', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})