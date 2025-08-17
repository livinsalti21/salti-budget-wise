import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export interface DeepLinkHandler {
  initialize(): void;
  handleDeepLink(url: string): void;
  cleanup(): void;
}

class CapacitorDeepLinkHandler implements DeepLinkHandler {
  private listeners: Array<() => void> = [];

  initialize(): void {
    if (!Capacitor.isNativePlatform()) {
      console.log('Deep links not available on web');
      return;
    }

    // Listen for app URL opens
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      console.log('App opened via deep link:', event.url);
      this.handleDeepLink(event.url);
    }).then(listener => {
      this.listeners.push(() => listener.remove());
    });

    // Handle the case where app was opened from a cold start with a URL
    App.getLaunchUrl().then((result) => {
      if (result?.url) {
        console.log('App launched with URL:', result.url);
        this.handleDeepLink(result.url);
      }
    });

    console.log('Deep link handler initialized');
  }

  handleDeepLink(url: string): void {
    try {
      const parsedUrl = new URL(url);
      
      // Handle custom scheme: save-n-stack://...
      if (parsedUrl.protocol === 'save-n-stack:') {
        this.handleCustomScheme(parsedUrl);
        return;
      }

      // Handle universal links: https://livinsalti.com/app/...
      if (parsedUrl.hostname === 'livinsalti.com' || parsedUrl.hostname.includes('lovableproject.com')) {
        this.handleUniversalLink(parsedUrl);
        return;
      }

      console.warn('Unhandled deep link:', url);
    } catch (error) {
      console.error('Failed to parse deep link URL:', error);
    }
  }

  private handleCustomScheme(url: URL): void {
    const path = url.pathname;
    
    switch (path) {
      case '/save/confirm':
        this.navigateToRoute('/app/save/confirm', url.searchParams);
        break;
      case '/save/choose':
        this.navigateToRoute('/app/save/choose', url.searchParams);
        break;
      case '/notify/snooze':
        this.navigateToRoute('/app/notify/snooze', url.searchParams);
        break;
      case '/match/accept':
        this.navigateToRoute('/app/match/accept', url.searchParams);
        break;
      default:
        this.navigateToRoute('/app');
        break;
    }
  }

  private handleUniversalLink(url: URL): void {
    const path = url.pathname;
    
    // Universal links should preserve the full path
    if (path.startsWith('/app/')) {
      this.navigateToRoute(path, url.searchParams);
    } else {
      // Fallback to main app
      this.navigateToRoute('/app');
    }
  }

  private navigateToRoute(path: string, searchParams?: URLSearchParams): void {
    const targetUrl = searchParams ? 
      `${path}?${searchParams.toString()}` : 
      path;

    // Use React Router navigation
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', targetUrl);
      
      // Trigger a popstate event to notify React Router
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }

  cleanup(): void {
    this.listeners.forEach(remove => remove());
    this.listeners = [];
  }
}

class WebDeepLinkHandler implements DeepLinkHandler {
  initialize(): void {
    console.log('Web deep link handler initialized (no-op)');
  }

  handleDeepLink(url: string): void {
    console.log('Web deep link handling (no-op):', url);
  }

  cleanup(): void {
    // No-op for web
  }
}

// Export singleton instance
export const deepLinkHandler: DeepLinkHandler = Capacitor.isNativePlatform() 
  ? new CapacitorDeepLinkHandler()
  : new WebDeepLinkHandler();

// Utility function to generate deep links
export const generateDeepLink = (path: string, params?: Record<string, string>): string => {
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://livinsalti.com';
  const url = new URL(`/app${path}`, baseUrl);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  return url.toString();
};

// Utility function to generate custom scheme links
export const generateCustomSchemeLink = (path: string, params?: Record<string, string>): string => {
  const scheme = import.meta.env.VITE_DEEP_LINK_SCHEME || 'save-n-stack';
  const url = new URL(`${scheme}:${path}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  return url.toString();
};