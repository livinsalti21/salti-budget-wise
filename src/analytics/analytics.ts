import { Capacitor } from '@capacitor/core';

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
      console.warn('PostHog API key not found, analytics disabled');
      return;
    }

    try {
      // Dynamically import PostHog to avoid build issues
      const { default: posthog } = await import('posthog-js');
      
      posthog.init(apiKey, {
        api_host: host,
        person_profiles: 'identified_only',
        capture_pageview: false, // We'll handle this manually
        autocapture: false,
      });

      this.posthog = posthog;
      console.log('PostHog analytics initialized');
    } catch (error) {
      console.error('Failed to initialize PostHog:', error);
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
  private analytics: any = null;

  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Firebase Analytics only available on native platforms');
      return;
    }

    try {
      // This would be implemented with Firebase Analytics Capacitor plugin
      console.log('Firebase Analytics would be initialized here');
    } catch (error) {
      console.error('Failed to initialize Firebase Analytics:', error);
    }
  }

  async track(event: string, properties?: Record<string, any>): Promise<void> {
    // Implementation would go here
    console.log('Firebase track:', event, properties);
  }

  async identify(userId: string, traits?: Record<string, any>): Promise<void> {
    // Implementation would go here
    console.log('Firebase identify:', userId, traits);
  }

  async page(name: string, properties?: Record<string, any>): Promise<void> {
    // Implementation would go here
    console.log('Firebase page:', name, properties);
  }

  async reset(): Promise<void> {
    // Implementation would go here
    console.log('Firebase reset');
  }
}

class NoOpAnalytics implements AnalyticsService {
  async initialize(): Promise<void> {
    console.log('Analytics disabled (no-op)');
  }

  async track(event: string, properties?: Record<string, any>): Promise<void> {
    console.log('Analytics track (no-op):', event, properties);
  }

  async identify(userId: string, traits?: Record<string, any>): Promise<void> {
    console.log('Analytics identify (no-op):', userId, traits);
  }

  async page(name: string, properties?: Record<string, any>): Promise<void> {
    console.log('Analytics page (no-op):', name, properties);
  }

  async reset(): Promise<void> {
    console.log('Analytics reset (no-op)');
  }
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

// Helper functions for common events
export const trackSave = async (amount: number, source: string) => {
  await analytics.track('save_completed', {
    amount_cents: amount,
    source,
    timestamp: Date.now()
  });
};

export const trackStreakMilestone = async (days: number) => {
  await analytics.track('streak_milestone', {
    streak_days: days,
    timestamp: Date.now()
  });
};

export const trackBudgetCreated = async (categories: number) => {
  await analytics.track('budget_created', {
    category_count: categories,
    timestamp: Date.now()
  });
};

export const trackOnboardingComplete = async (steps: number) => {
  await analytics.track('onboarding_completed', {
    steps_completed: steps,
    timestamp: Date.now()
  });
};