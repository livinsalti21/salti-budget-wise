import { supabase } from '@/integrations/supabase/client';

export const generateSecureDeepLink = async (
  amount_cents: number,
  source: string,
  push_id?: string
): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-secure-deeplink', {
      body: {
        action: 'generate',
        amount_cents,
        source,
        push_id
      }
    });

    if (error) {
      console.error('Error generating secure deep link:', error);
      throw new Error('Failed to generate secure deep link');
    }

    return data.deepLink;
  } catch (error) {
    console.error('Error in generateSecureDeepLink:', error);
    throw error;
  }
};

export const verifySecureDeepLink = async (
  amount_cents: number,
  source: string,
  push_id: string | null,
  expires_at: string,
  signature: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-secure-deeplink', {
      body: {
        action: 'verify',
        amount_cents,
        source,
        push_id,
        expires_at,
        signature
      }
    });

    if (error) {
      console.error('Error verifying deep link:', error);
      return false;
    }

    return data.valid;
  } catch (error) {
    console.error('Error in verifySecureDeepLink:', error);
    return false;
  }
};

// Audit logging helper
export const logSecurityEvent = async (
  eventType: string,
  eventDetails: Record<string, any>
) => {
  try {
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