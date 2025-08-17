import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AES-256-GCM encryption utilities
const encrypt = async (plaintext: string, key: CryptoKey): Promise<{encrypted: string, iv: string}> => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );
  
  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv))
  };
};

const getEncryptionKey = async (): Promise<CryptoKey> => {
  // In production, retrieve from secure vault
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode("secure_key_32_chars_long_12345"),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
  return keyMaterial;
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

    const { public_token } = await req.json();

    // Validate input
    if (!public_token || typeof public_token !== 'string') {
      throw new Error('Invalid public token provided');
    }

    // Exchange public token for access token with Plaid
    const plaidResponse = await fetch('https://production.plaid.com/link/token/exchange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: Deno.env.get('PLAID_CLIENT_ID'),
        secret: Deno.env.get('PLAID_SECRET'),
        public_token: public_token,
      }),
    });

    const plaidData = await plaidResponse.json();

    if (!plaidResponse.ok) {
      console.error('Plaid exchange error:', plaidData);
      throw new Error(`Plaid API error: ${plaidData.error_message || 'Unknown error'}`);
    }

    const { access_token, item_id } = plaidData;

    // Get account information
    const accountsResponse = await fetch('https://production.plaid.com/accounts/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: Deno.env.get('PLAID_CLIENT_ID'),
        secret: Deno.env.get('PLAID_SECRET'),
        access_token: access_token,
      }),
    });

    const accountsData = await accountsResponse.json();

    if (!accountsResponse.ok) {
      console.error('Plaid accounts error:', accountsData);
      throw new Error(`Failed to fetch accounts: ${accountsData.error_message || 'Unknown error'}`);
    }

    // Get institution info
    const institutionResponse = await fetch('https://production.plaid.com/institutions/get_by_id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: Deno.env.get('PLAID_CLIENT_ID'),
        secret: Deno.env.get('PLAID_SECRET'),
        institution_id: accountsData.item.institution_id,
        country_codes: ['US'],
      }),
    });

    const institutionData = await institutionResponse.json();
    const institutionName = institutionData.institution?.name || 'Unknown Institution';

    // Encrypt the access token
    const encryptionKey = await getEncryptionKey();
    const { encrypted, iv } = await encrypt(access_token, encryptionKey);

    // Store accounts in database with encrypted tokens
    const accountPromises = accountsData.accounts.map((account: any) => 
      supabaseClient.from('linked_accounts').insert({
        user_id: user.id,
        account_id: account.account_id,
        encrypted_access_token: encrypted,
        token_iv: iv,
        // Remove plaintext access_token field
        institution_name: institutionName,
        account_name: account.name,
        account_type: account.type,
        balance_cents: Math.round((account.balances.current || 0) * 100),
        last_sync: new Date().toISOString()
      })
    );

    await Promise.all(accountPromises);

    // Log security event
    await supabaseClient.from('security_audit_log').insert({
      user_id: user.id,
      event_type: 'account_linked',
      event_details: {
        institution: institutionName,
        accounts_count: accountsData.accounts.length,
        ip_address: req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For')
      },
      user_agent: req.headers.get('User-Agent')
    });

    return new Response(JSON.stringify({ 
      success: true,
      accounts: accountsData.accounts.length,
      institution: institutionName
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in link-account function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});