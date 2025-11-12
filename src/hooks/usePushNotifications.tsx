import React, { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

// Simple component to initialize push notifications
export default function usePushNotifications() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const initPush = async () => {
      try {
        await PushNotifications.addListener('registration', () => {
          // Silent registration
        });

        await PushNotifications.addListener('pushNotificationReceived', () => {
          // Silent receive
        });

        await PushNotifications.addListener('pushNotificationActionPerformed', () => {
          // Silent action
        });
      } catch (error) {
        // Silent fail
      }
    };

    initPush();
  }, []);

  return null;
}