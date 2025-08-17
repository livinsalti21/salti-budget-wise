// Security utilities for HMAC signature generation and verification

const HMAC_SECRET = 'livin_salti_hmac_secret_2025'; // In production, store in env

export const generateHMACSignature = async (
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

export const verifyHMACSignature = async (
  amount_cents: number,
  source: string,
  push_id: string | null,
  expires_at: string,
  provided_sig: string
): Promise<boolean> => {
  const calculatedSig = await generateHMACSignature(amount_cents, source, push_id, expires_at);
  return calculatedSig === provided_sig;
};

export const generateSecureDeepLink = async (
  amount_cents: number,
  source: string,
  push_id?: string
): Promise<string> => {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
  const signature = await generateHMACSignature(amount_cents, source, push_id || null, expiresAt);
  
  const params = new URLSearchParams({
    amount_cents: amount_cents.toString(),
    source,
    expires_at: expiresAt,
    sig: signature
  });
  
  if (push_id) {
    params.set('push_id', push_id);
  }
  
  return `/app/save/confirm?${params.toString()}`;
};

// Audit logging helper
export const logSecurityEvent = async (
  eventType: string,
  eventDetails: Record<string, any>
) => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    await supabase.from('security_audit_log').insert({
      event_type: eventType,
      event_details: eventDetails,
      ip_address: null, // Frontend can't access real IP
      user_agent: navigator.userAgent
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};