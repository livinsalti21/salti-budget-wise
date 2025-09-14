import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

const HMAC_SECRET = Deno.env.get('HMAC_SECRET_KEY') || 'fallback_secret_for_dev';

const generateHMACSignature = async (
  amount_cents: number,
  source: string,
  push_id: string | null,
  expires_at: string
): Promise<string> => {
  const payload = `${amount_cents}|${source || ''}|${push_id || ''}|${expires_at || ''}`;
  
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(HMAC_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  );
  
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

const verifyHMACSignature = async (
  amount_cents: number,
  source: string,
  push_id: string | null,
  expires_at: string,
  provided_sig: string
): Promise<boolean> => {
  const calculatedSig = await generateHMACSignature(amount_cents, source, push_id, expires_at);
  return calculatedSig === provided_sig;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();

    if (action === 'generate') {
      const { amount_cents, source, push_id } = params;
      
      // Validate input
      if (!amount_cents || !source) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters: amount_cents, source' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
      const signature = await generateHMACSignature(amount_cents, source, push_id || null, expiresAt);
      
      const urlParams = new URLSearchParams({
        amount_cents: amount_cents.toString(),
        source,
        expires_at: expiresAt,
        sig: signature
      });
      
      if (push_id) {
        urlParams.set('push_id', push_id);
      }
      
      const deepLink = `/app/save/confirm?${urlParams.toString()}`;
      
      // Log security event
      await supabase.from('security_audit_log').insert({
        event_type: 'deep_link_generated',
        event_details: {
          amount_cents,
          source,
          has_push_id: !!push_id,
          expires_at: expiresAt
        },
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      });

      return new Response(
        JSON.stringify({ deepLink, expiresAt }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'verify') {
      const { amount_cents, source, push_id, expires_at, signature } = params;
      
      // Validate input
      if (!amount_cents || !source || !expires_at || !signature) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters for verification' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if expired
      if (new Date(expires_at) < new Date()) {
        await supabase.from('security_audit_log').insert({
          event_type: 'deep_link_verification_expired',
          event_details: { amount_cents, source, expires_at },
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown'
        });
        
        return new Response(
          JSON.stringify({ valid: false, reason: 'Link expired' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const isValid = await verifyHMACSignature(amount_cents, source, push_id || null, expires_at, signature);
      
      // Log verification attempt
      await supabase.from('security_audit_log').insert({
        event_type: isValid ? 'deep_link_verification_success' : 'deep_link_verification_failed',
        event_details: { amount_cents, source, expires_at, signature_provided: signature },
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      });

      return new Response(
        JSON.stringify({ valid: isValid }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use "generate" or "verify"' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-secure-deeplink function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});