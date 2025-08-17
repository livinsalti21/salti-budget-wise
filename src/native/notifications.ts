import { PushNotifications, PushNotificationSchema, ActionPerformed, Token } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

export interface NotificationService {
  requestPermission(): Promise<boolean>;
  getToken(): Promise<string | null>;
  onMessage(callback: (notification: PushNotificationSchema) => void): void;
  scheduleLocal(options: LocalNotificationOptions): Promise<void>;
  initialize(): Promise<void>;
}

export interface LocalNotificationOptions {
  title: string;
  body: string;
  id: number;
  schedule?: {
    at: Date;
  };
  extra?: Record<string, any>;
}

class CapacitorNotificationService implements NotificationService {
  private listeners: Array<() => void> = [];

  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Not on native platform, skipping push notification setup');
      return;
    }

    try {
      // Request permissions for local notifications
      await LocalNotifications.requestPermissions();

      // Set up push notification listeners
      this.setupPushListeners();
      
      console.log('Push notification service initialized');
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      const result = await PushNotifications.requestPermissions();
      return result.receive === 'granted';
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    if (!Capacitor.isNativePlatform()) {
      return null;
    }

    try {
      await PushNotifications.register();
      return new Promise((resolve) => {
        const tokenListener = PushNotifications.addListener('registration', (token: Token) => {
          tokenListener.remove();
          resolve(token.value);
        });
      });
    } catch (error) {
      console.error('Failed to get push token:', error);
      return null;
    }
  }

  onMessage(callback: (notification: PushNotificationSchema) => void): void {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const listener = PushNotifications.addListener('pushNotificationReceived', callback);
    this.listeners.push(() => listener.remove());
  }

  async scheduleLocal(options: LocalNotificationOptions): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Local notifications not available on web');
      return;
    }

    try {
      await LocalNotifications.schedule({
        notifications: [{
          title: options.title,
          body: options.body,
          id: options.id,
          schedule: options.schedule,
          extra: options.extra
        }]
      });
    } catch (error) {
      console.error('Failed to schedule local notification:', error);
    }
  }

  private setupPushListeners(): void {
    // Handle registration success
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('Push registration success, token: ' + token.value);
      await this.saveTokenToDatabase(token.value);
    });

    // Handle registration errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Handle incoming notifications when app is in foreground
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push notification received: ', notification);
    });

    // Handle notification action
    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('Push notification action performed: ', notification);
      
      // Handle deep link navigation
      if (notification.notification.data?.deep_link) {
        window.location.href = notification.notification.data.deep_link;
      }
    });
  }

  private async saveTokenToDatabase(token: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const platform = Capacitor.getPlatform();
        await supabase
          .from('device_tokens')
          .upsert({
            user_id: user.id,
            platform,
            token,
            created_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,platform'
          });
      }
    } catch (error) {
      console.error('Failed to save token to database:', error);
    }
  }

  cleanup(): void {
    this.listeners.forEach(remove => remove());
    this.listeners = [];
  }
}

// Web fallback service
class WebNotificationService implements NotificationService {
  async initialize(): Promise<void> {
    console.log('Web notification service initialized (no-op)');
  }

  async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  async getToken(): Promise<string | null> {
    return null;
  }

  onMessage(callback: (notification: PushNotificationSchema) => void): void {
    // Web service worker messaging could go here
  }

  async scheduleLocal(options: LocalNotificationOptions): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(options.title, {
        body: options.body,
        icon: '/icon-192x192.png'
      });
    }
  }
}

// Export singleton instance
export const notificationService: NotificationService = Capacitor.isNativePlatform() 
  ? new CapacitorNotificationService()
  : new WebNotificationService();

// Habit streak reminder helper
export const scheduleStreakReminder = async (streakDays: number): Promise<void> => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0); // 10 AM reminder

  await notificationService.scheduleLocal({
    title: `Keep your ${streakDays}-day streak alive! 🔥`,
    body: "Save a little today to keep building your financial future",
    id: Date.now(),
    schedule: { at: tomorrow },
    extra: { type: 'streak_reminder', streak_days: streakDays }
  });
};