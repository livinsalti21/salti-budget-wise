import { analytics } from '@/analytics/analytics';
import { SecurityLogger } from './securityLogger';
import { config } from '@/lib/config';

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export class ErrorLogger {
  static logError(
    error: Error | unknown,
    context: ErrorContext = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    // 1. Log to security audit (if security-related)
    if (context.component?.includes('Auth') || context.action?.includes('security')) {
      SecurityLogger.logEvent('application_error', severity, {
        error: errorMessage,
        stack: errorStack,
        ...context
      }, context.userId);
    }

    // 2. Track in analytics (for monitoring dashboards)
    analytics.track('error_occurred', {
      error_message: errorMessage,
      severity,
      component: context.component,
      action: context.action,
      ...context.metadata
    });

    // 3. Console error in development only
    if (config.logging.enableConsoleErrors) {
      console.error(`[${severity.toUpperCase()}] ${context.component || 'App'}:`, error, context);
    }
  }

  static logWarning(message: string, context: ErrorContext = {}) {
    analytics.track('warning_occurred', {
      warning_message: message,
      ...context
    });

    if (config.logging.enableConsoleErrors) {
      console.warn(`[WARNING] ${context.component || 'App'}:`, message, context);
    }
  }
}
