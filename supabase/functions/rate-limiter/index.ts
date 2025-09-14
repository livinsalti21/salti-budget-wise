import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface RateLimitConfig {
  maxAttempts: number;
  windowMinutes: number;
  blockDurationMinutes?: number;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  'login_attempt': { maxAttempts: 5, windowMinutes: 15, blockDurationMinutes: 60 },
  'signup_attempt': { maxAttempts: 3, windowMinutes: 15, blockDurationMinutes: 30 },
  'password_reset': { maxAttempts: 3, windowMinutes: 60, blockDurationMinutes: 120 },
  'api_request': { maxAttempts: 100, windowMinutes: 15 },
  'save_event': { maxAttempts: 50, windowMinutes: 15 }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, identifier, type = 'api_request', userAgent, ip } = await req.json();
    
    if (!identifier || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: identifier, action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const config = DEFAULT_CONFIGS[type] || DEFAULT_CONFIGS['api_request'];
    const windowStart = new Date(Date.now() - config.windowMinutes * 60 * 1000);
    
    if (action === 'check') {
      // Check if rate limit exceeded
      const { data: attempts, error } = await supabase
        .from('security_audit_log')
        .select('created_at')
        .eq('event_type', type)
        .eq('event_details->identifier', identifier)
        .gte('created_at', windowStart.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error checking rate limit:', error);
        return new Response(
          JSON.stringify({ allowed: true, remaining: config.maxAttempts }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const attemptCount = attempts?.length || 0;
      const allowed = attemptCount < config.maxAttempts;
      const remaining = Math.max(0, config.maxAttempts - attemptCount);

      // Check if user is currently blocked
      if (!allowed && config.blockDurationMinutes) {
        const blockStart = new Date(Date.now() - config.blockDurationMinutes * 60 * 1000);
        const recentAttempts = attempts?.filter(a => new Date(a.created_at) > blockStart) || [];
        
        if (recentAttempts.length >= config.maxAttempts) {
          return new Response(
            JSON.stringify({ 
              allowed: false, 
              remaining: 0, 
              blocked: true,
              blockExpiresAt: new Date(Date.now() + config.blockDurationMinutes * 60 * 1000).toISOString()
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      return new Response(
        JSON.stringify({ allowed, remaining, blocked: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'record') {
      // Record the attempt
      const { error } = await supabase
        .from('security_audit_log')
        .insert({
          event_type: type,
          event_details: {
            identifier,
            user_agent: userAgent,
            timestamp: new Date().toISOString()
          },
          ip_address: ip || 'unknown',
          user_agent: userAgent || 'unknown'
        });

      if (error) {
        console.error('Error recording rate limit attempt:', error);
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use "check" or "record"' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in rate-limiter function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});