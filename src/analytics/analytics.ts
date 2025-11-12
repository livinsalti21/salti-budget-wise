import { Capacitor } from '@capacitor/core';
import { config } from '@/lib/config';

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  user_id?: string;
}

export interface AnalyticsService {
  initialize(): Promise<void>;
  track(event: string, properties?: Record<string, any>): Promise<void>;
  identify(userId: string, traits?: Record<string, any>): Promise<void>;
  page(name: string, properties?: Record<string, any>): Promise<void>;
  reset(): Promise<void>;
}

class PostHogAnalytics implements AnalyticsService {
  private posthog: any = null;

  async initialize(): Promise<void> {
    const apiKey = import.meta.env.VITE_POSTHOG_KEY;
    const host = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

    if (!apiKey) {
      return;
    }

    try {
      const { default: posthog } = await import('posthog-js');
      
      posthog.init(apiKey, {
        api_host: host,
        person_profiles: 'identified_only',
        capture_pageview: false,
        autocapture: false,
      });

      this.posthog = posthog;
    } catch (error) {
      if (config.logging.enableConsoleErrors) {
        console.error('Failed to initialize PostHog:', error);
      }
    }
  }

  async track(event: string, properties?: Record<string, any>): Promise<void> {
    if (this.posthog) {
      this.posthog.capture(event, {
        ...properties,
        platform: Capacitor.getPlatform(),
        is_native: Capacitor.isNativePlatform()
      });
    }
  }

  async identify(userId: string, traits?: Record<string, any>): Promise<void> {
    if (this.posthog) {
      this.posthog.identify(userId, traits);
    }
  }

  async page(name: string, properties?: Record<string, any>): Promise<void> {
    if (this.posthog) {
      this.posthog.capture('$pageview', {
        $current_url: window.location.href,
        page_name: name,
        ...properties,
        platform: Capacitor.getPlatform()
      });
    }
  }

  async reset(): Promise<void> {
    if (this.posthog) {
      this.posthog.reset();
    }
  }
}

class FirebaseAnalytics implements AnalyticsService {
  async initialize(): Promise<void> {
    // Firebase Analytics stub for native platforms
  }

  async track(event: string, properties?: Record<string, any>): Promise<void> {
    // Placeholder for Firebase implementation
  }

  async identify(userId: string, traits?: Record<string, any>): Promise<void> {
    // Placeholder for Firebase implementation
  }

  async page(name: string, properties?: Record<string, any>): Promise<void> {
    // Placeholder for Firebase implementation
  }

  async reset(): Promise<void> {
    // Placeholder for Firebase implementation
  }
}

class NoOpAnalytics implements AnalyticsService {
  async initialize(): Promise<void> {}
  async track(event: string, properties?: Record<string, any>): Promise<void> {}
  async identify(userId: string, traits?: Record<string, any>): Promise<void> {}
  async page(name: string, properties?: Record<string, any>): Promise<void> {}
  async reset(): Promise<void> {}
}

// Create analytics instance based on environment
function createAnalyticsService(): AnalyticsService {
  const provider = import.meta.env.VITE_ANALYTICS_PROVIDER;

  switch (provider) {
    case 'posthog':
      return new PostHogAnalytics();
    case 'firebase':
      return new FirebaseAnalytics();
    default:
      return new NoOpAnalytics();
  }
}

export const analytics = createAnalyticsService();

// Standard events to use across the app
export const EVENTS = {
  auth_login: 'auth_login',
  goal_set: 'goal_set',
  onboarding_complete: 'onboarding_complete',
  save_started: 'save_started',
  save_confirmed: 'save_confirmed',
  streak_tick: 'streak_tick',
  budget_upload: 'budget_upload',
  save_completed: 'save_completed',
  streak_milestone: 'streak_milestone',
  budget_created: 'budget_created',
  wealth_projection_updated: 'wealth_projection_updated',
  
  // Pro feature events
  pro_upsell_view: 'pro_upsell_view',
  pro_upsell_click_cta: 'pro_upsell_click_cta',
  pro_enabled: 'pro_enabled',
};

// Simple track helper that works with current system
export function track(event: string, properties: Record<string, any> = {}) {
  try {
    analytics.track(event, properties);
  } catch (error) {
    // Silent fail in production
  }
}

// Helper functions for common events
export const trackSave = async (amount: number, source: string) => {
  await track(EVENTS.save_completed, {
    amount_cents: amount,
    source,
    timestamp: Date.now()
  });
};

export const trackStreakMilestone = async (days: number) => {
  await track(EVENTS.streak_milestone, {
    streak_days: days,
    timestamp: Date.now()
  });
};

export const trackBudgetCreated = async (categories: number) => {
  await track(EVENTS.budget_created, {
    category_count: categories,
    timestamp: Date.now()
  });
};

export const trackOnboardingComplete = async (steps: number) => {
  await track(EVENTS.onboarding_complete, {
    steps_completed: steps,
    timestamp: Date.now()
  });
};