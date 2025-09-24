import { supabase } from '@/integrations/supabase/client';

interface SecurityEventDetails {
  [key: string]: any;
}

export class SecurityLogger {
  /**
   * Log a security event with enhanced context
   */
  static async logEvent(
    eventType: string,
    severity: 'info' | 'low' | 'medium' | 'high' | 'critical' = 'info',
    eventDetails: SecurityEventDetails = {},
    userId?: string
  ) {
    try {
      // Enhanced event details with browser/device context
      const enhancedDetails = {
        ...eventDetails,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        sessionId: this.getSessionId(),
        deviceFingerprint: this.getDeviceFingerprint()
      };

      const { error } = await supabase.rpc('log_security_event', {
        p_event_type: eventType,
        p_severity: severity,
        p_event_details: enhancedDetails,
        p_user_id: userId || undefined
      });

      if (error) {
        console.error('Failed to log security event:', error);
        // Fallback to local logging if remote fails
        this.logToConsole(eventType, severity, enhancedDetails);
      }

      // Log to browser storage for offline scenarios
      this.logToLocalStorage(eventType, severity, enhancedDetails);

    } catch (error) {
      console.error('Security logging error:', error);
      this.logToConsole(eventType, severity, eventDetails);
    }
  }

  /**
   * Log authentication events
   */
  static logAuth(
    action: 'login' | 'logout' | 'signup' | 'password_reset' | 'email_verify',
    success: boolean,
    details: SecurityEventDetails = {}
  ) {
    const severity = success ? 'info' : 'medium';
    const eventType = `auth_${action}_${success ? 'success' : 'failure'}`;
    
    this.logEvent(eventType, severity, {
      ...details,
      action,
      success,
      method: details.method || 'email'
    });
  }

  /**
   * Log financial transaction security events
   */
  static logFinancial(
    action: 'save_event' | 'match_event' | 'account_link' | 'payment',
    amountCents: number,
    details: SecurityEventDetails = {}
  ) {
    const severity = amountCents > 100000 ? 'medium' : 'info'; // Flag large amounts
    
    this.logEvent(`financial_${action}`, severity, {
      ...details,
      amount_cents: amountCents,
      action
    });
  }

  /**
   * Log suspicious activity
   */
  static logSuspicious(
    activityType: string,
    riskLevel: 'low' | 'medium' | 'high' | 'critical',
    details: SecurityEventDetails = {}
  ) {
    this.logEvent(`suspicious_${activityType}`, riskLevel, {
      ...details,
      activity_type: activityType,
      risk_level: riskLevel,
      requires_review: riskLevel === 'high' || riskLevel === 'critical'
    });
  }

  /**
   * Log data access events
   */
  static logDataAccess(
    dataType: string,
    operation: 'read' | 'write' | 'delete',
    recordCount: number = 1,
    details: SecurityEventDetails = {}
  ) {
    const severity = operation === 'delete' ? 'medium' : 'info';
    
    this.logEvent(`data_access_${dataType}`, severity, {
      ...details,
      data_type: dataType,
      operation,
      record_count: recordCount
    });
  }

  /**
   * Get or create session ID for tracking
   */
  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('security_session_id');
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('security_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Generate basic device fingerprint
   */
  private static getDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('Security fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Simple hash of fingerprint data
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `fp_${Math.abs(hash).toString(36)}`;
  }

  /**
   * Fallback console logging
   */
  private static logToConsole(
    eventType: string,
    severity: string,
    details: SecurityEventDetails
  ) {
    const logData = {
      timestamp: new Date().toISOString(),
      eventType,
      severity,
      details
    };

    if (severity === 'critical' || severity === 'high') {
      console.error('🚨 Security Event:', logData);
    } else if (severity === 'medium') {
      console.warn('⚠️ Security Event:', logData);
    } else {
      console.info('ℹ️ Security Event:', logData);
    }
  }

  /**
   * Store security events in local storage for offline analysis
   */
  private static logToLocalStorage(
    eventType: string,
    severity: string,
    details: SecurityEventDetails
  ) {
    try {
      const key = 'security_events_offline';
      const existing = localStorage.getItem(key);
      const events = existing ? JSON.parse(existing) : [];
      
      events.push({
        timestamp: new Date().toISOString(),
        eventType,
        severity,
        details
      });
      
      // Keep only last 100 events to prevent storage bloat
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem(key, JSON.stringify(events));
    } catch (error) {
      // Ignore localStorage errors (quota exceeded, etc.)
      console.warn('Failed to store security event locally:', error);
    }
  }

  /**
   * Get offline security events (for debugging/analysis)
   */
  static getOfflineEvents(): any[] {
    try {
      const events = localStorage.getItem('security_events_offline');
      return events ? JSON.parse(events) : [];
    } catch (error) {
      console.warn('Failed to retrieve offline security events:', error);
      return [];
    }
  }

  /**
   * Clear offline security events
   */
  static clearOfflineEvents() {
    localStorage.removeItem('security_events_offline');
  }
}
