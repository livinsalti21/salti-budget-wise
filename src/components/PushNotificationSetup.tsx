import React, { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function PushNotificationSetup() {
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !user) return;

    initializePushNotifications();
  }, [user]);

  const initializePushNotifications = async () => {
    try {
      // Register for push notifications
      await PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success, token: ' + token.value);
        
        // Store token in database for sending notifications
        await supabase
          .from('profiles')
          .upsert({ 
            id: user?.id, 
            push_token: token.value 
          }, { 
            onConflict: 'id' 
          });
      });

      // Handle registration errors
      await PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration: ' + JSON.stringify(error));
      });

      // Handle incoming push notifications
      await PushNotifications.addListener('pushNotificationReceived', async (notification) => {
        console.log('Push notification received: ', notification);
        
        // Log delivery event
        if (notification.data?.push_id) {
          await supabase.functions.invoke('push-log', {
            body: { 
              push_id: notification.data.push_id, 
              event: 'delivered' 
            }
          });
        }

        // Show in-app notification if app is in foreground
        toast({
          title: notification.title || 'New Notification',
          description: notification.body || 'You have a new notification'
        });
      });

      // Handle notification action taps
      await PushNotifications.addListener('pushNotificationActionPerformed', async (notification) => {
        console.log('Push notification action performed: ', notification);
        
        const data = notification.notification.data;
        
        // Log open event
        if (data?.push_id) {
          await supabase.functions.invoke('push-log', {
            body: { 
              push_id: data.push_id, 
              event: 'opened' 
            }
          });
        }

        // Handle deep link navigation
        if (data?.deep_link) {
          // This would integrate with your router to navigate to the deep link
          window.location.href = data.deep_link;
        }
      });

    } catch (error) {
      console.error('Error setting up push notifications:', error);
    }
  };

  return null; // This is a service component, no UI needed
}