import { useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { notificationService } from '@/native/notifications';
import { deepLinkHandler } from '@/native/deeplinks';
import { analytics } from '@/analytics/analytics';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useNativeFeatures = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const initializeServices = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Native features not available on web platform');
      return;
    }

    try {
      // Initialize analytics
      await analytics.initialize();

      // Initialize notifications
      await notificationService.initialize();

      // Initialize deep links
      deepLinkHandler.initialize();

      // Set up notification handler
      notificationService.onMessage((notification) => {
        toast({
          title: notification.title || 'New Notification',
          description: notification.body || 'You have a new notification',
        });
      });

      console.log('Native services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize native services:', error);
    }
  }, [toast]);

  const requestNotificationPermission = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      const granted = await notificationService.requestPermission();
      
      if (granted) {
        const token = await notificationService.getToken();
        console.log('Push notification permission granted, token:', token);
        
        toast({
          title: "Notifications enabled! 🔔",
          description: "We'll help you stay on track with your savings goals",
        });
      } else {
        toast({
          title: "Notifications disabled",
          description: "You can still use all features, but won't receive reminders",
          variant: "destructive",
        });
      }
      
      return granted;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }, [toast]);

  const trackAnalyticsEvent = useCallback(async (event: string, properties?: Record<string, any>) => {
    try {
      await analytics.track(event, properties);
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }, []);

  const identifyUser = useCallback(async (userId: string, traits?: Record<string, any>) => {
    try {
      await analytics.identify(userId, traits);
    } catch (error) {
      console.error('Failed to identify user:', error);
    }
  }, []);

  // Initialize services on mount
  useEffect(() => {
    initializeServices();

    // Cleanup on unmount
    return () => {
      if (Capacitor.isNativePlatform()) {
        deepLinkHandler.cleanup();
      }
    };
  }, [initializeServices]);

  // Identify user when authenticated
  useEffect(() => {
    if (user?.id) {
      identifyUser(user.id, {
        email: user.email,
        created_at: user.created_at,
      });
    } else {
      analytics.reset();
    }
  }, [user, identifyUser]);

  return {
    isNative: Capacitor.isNativePlatform(),
    platform: Capacitor.getPlatform(),
    requestNotificationPermission,
    trackAnalyticsEvent,
    scheduleLocalNotification: notificationService.scheduleLocal,
  };
};