import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { user_id } = await req.json();

    // Validate that the requesting user matches the user_id
    if (user.id !== user_id) {
      throw new Error('Unauthorized: User ID mismatch');
    }

    // Get user profile for Plaid Link configuration
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('email, name')
      .eq('id', user.id)
      .single();

    // Create Plaid Link token
    const plaidResponse = await fetch('https://production.plaid.com/link/token/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: Deno.env.get('PLAID_CLIENT_ID'),
        secret: Deno.env.get('PLAID_SECRET'),
        client_name: 'Livin Salti',
        country_codes: ['US'],
        language: 'en',
        user: {
          client_user_id: user.id,
          legal_name: profile?.name || user.email?.split('@')[0] || 'User',
          email_address: user.email,
        },
        products: ['transactions'],
        required_if_supported_products: ['identity'],
        optional_products: ['assets', 'liabilities'],
        redirect_uri: `${req.headers.get('origin')}/app`,
        webhook: `${Deno.env.get('SUPABASE_URL')}/functions/v1/plaid-webhook`,
        account_filters: {
          depository: {
            account_type: ['checking', 'savings'],
          },
          credit: {
            account_type: ['credit card'],
          },
        },
      }),
    });

    const plaidData = await plaidResponse.json();

    if (!plaidResponse.ok) {
      console.error('Plaid create link token error:', plaidData);
      throw new Error(`Plaid API error: ${plaidData.error_message || 'Unknown error'}`);
    }

    // Log security event
    await supabaseClient.from('security_audit_log').insert({
      user_id: user.id,
      event_type: 'plaid_link_token_created',
      event_details: {
        expiration: plaidData.expiration,
        ip_address: req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For')
      },
      user_agent: req.headers.get('User-Agent')
    });

    return new Response(JSON.stringify({ 
      link_token: plaidData.link_token,
      expiration: plaidData.expiration,
      request_id: plaidData.request_id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-link-token function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});