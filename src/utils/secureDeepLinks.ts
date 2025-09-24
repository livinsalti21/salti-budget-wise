import { supabase } from '@/integrations/supabase/client';
import { SecurityLogger } from './securityLogger';

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
      SecurityLogger.logEvent('deeplink_generation_error', 'medium', { 
        error: error.message, 
        amount_cents, 
        source 
      });
      throw new Error('Failed to generate secure deep link');
    }

    SecurityLogger.logEvent('deeplink_generated', 'info', { 
      amount_cents, 
      source, 
      has_push_id: !!push_id 
    });

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
      SecurityLogger.logSuspicious('deeplink_verification_error', 'high', {
        error: error.message,
        amount_cents,
        source,
        expires_at
      });
      return false;
    }

    const isValid = data.valid;
    SecurityLogger.logEvent('deeplink_verified', isValid ? 'info' : 'medium', {
      amount_cents,
      source,
      valid: isValid,
      expires_at
    });

    return isValid;
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