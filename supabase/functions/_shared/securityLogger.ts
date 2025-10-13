// ============================================
// PHASE 5: Enhanced Security Monitoring
// ============================================
// Security event logging for edge functions
// Creates comprehensive audit trail

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface SecurityEventDetails {
  amount_cents?: number;
  match_event_id?: string;
  sponsor_id?: string;
  invite_id?: string;
  save_event_id?: string;
  ip_address?: string;
  user_agent?: string;
  [key: string]: any;
}

/**
 * Logs security events to security_audit_log table
 * @param supabaseClient - Supabase client instance (use admin client for service role)
 * @param eventType - Type of event (e.g., 'large_save_event', 'match_invite_accepted')
 * @param severity - Severity level: 'info' | 'low' | 'medium' | 'high' | 'critical'
 * @param details - Event details object
 * @param userId - User ID (optional, defaults to authenticated user)
 */
export async function logSecurityEvent(
  supabaseClient: SupabaseClient,
  eventType: string,
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical',
  details: SecurityEventDetails,
  userId?: string
) {
  try {
    const { error } = await supabaseClient.from('security_audit_log').insert({
      user_id: userId || null,
      event_type: eventType,
      severity,
      event_details: details,
      ip_address: details.ip_address || null,
      user_agent: details.user_agent || null,
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error('Failed to log security event:', error);
    }
  } catch (error) {
    // Silently fail - don't break edge function execution
    console.error('Security logging error:', error);
  }
}

/**
 * Logs authentication events
 * @param supabaseClient - Supabase client
 * @param action - Auth action type
 * @param success - Whether action succeeded
 * @param details - Additional details
 * @param userId - User ID
 */
export async function logAuthEvent(
  supabaseClient: SupabaseClient,
  action: 'login' | 'logout' | 'signup' | 'password_reset' | 'email_verify',
  success: boolean,
  details: SecurityEventDetails = {},
  userId?: string
) {
  const severity = success ? 'info' : 'medium';
  const eventType = `auth_${action}_${success ? 'success' : 'failure'}`;
  
  await logSecurityEvent(supabaseClient, eventType, severity, {
    ...details,
    action,
    success
  }, userId);
}

/**
 * Logs financial transaction events
 * @param supabaseClient - Supabase client
 * @param action - Transaction action
 * @param amountCents - Amount in cents
 * @param details - Additional details
 * @param userId - User ID
 */
export async function logFinancialEvent(
  supabaseClient: SupabaseClient,
  action: 'save_event' | 'match_event' | 'account_link' | 'payment',
  amountCents: number,
  details: SecurityEventDetails = {},
  userId?: string
) {
  // Flag large amounts as medium severity
  const severity = amountCents > 100000 ? 'medium' : 'info';
  
  await logSecurityEvent(supabaseClient, `financial_${action}`, severity, {
    ...details,
    amount_cents: amountCents,
    action
  }, userId);
}

/**
 * Logs suspicious activity
 * @param supabaseClient - Supabase client
 * @param activityType - Type of suspicious activity
 * @param riskLevel - Risk level
 * @param details - Activity details
 * @param userId - User ID
 */
export async function logSuspiciousActivity(
  supabaseClient: SupabaseClient,
  activityType: string,
  riskLevel: 'low' | 'medium' | 'high' | 'critical',
  details: SecurityEventDetails = {},
  userId?: string
) {
  await logSecurityEvent(supabaseClient, `suspicious_${activityType}`, riskLevel, {
    ...details,
    activity_type: activityType,
    risk_level: riskLevel,
    requires_review: riskLevel === 'high' || riskLevel === 'critical'
  }, userId);
}
