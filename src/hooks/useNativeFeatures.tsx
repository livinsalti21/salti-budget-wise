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
      return;
    }

    try {
      await analytics.initialize();
      await notificationService.initialize();
      deepLinkHandler.initialize();

      notificationService.onMessage((notification) => {
        toast({
          title: notification.title || 'New Notification',
          description: notification.body || 'You have a new notification',
        });
      });
    } catch (error) {
      // Silent fail
    }
  }, [toast]);

  const requestNotificationPermission = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      const granted = await notificationService.requestPermission();
      
      if (granted) {
        await notificationService.getToken();
        
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
      return false;
    }
  }, [toast]);

  const trackAnalyticsEvent = useCallback(async (event: string, properties?: Record<string, any>) => {
    try {
      await analytics.track(event, properties);
    } catch (error) {
      // Silent fail
    }
  }, []);

  const identifyUser = useCallback(async (userId: string, traits?: Record<string, any>) => {
    try {
      await analytics.identify(userId, traits);
    } catch (error) {
      // Silent fail
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