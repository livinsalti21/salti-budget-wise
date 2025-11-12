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
      return;
    }

    try {
      await LocalNotifications.requestPermissions();
      this.setupPushListeners();
    } catch (error) {
      // Silent fail
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
        PushNotifications.addListener('registration', (token: Token) => {
          resolve(token.value);
        });
      });
    } catch (error) {
      return null;
    }
  }

  onMessage(callback: (notification: PushNotificationSchema) => void): void {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    PushNotifications.addListener('pushNotificationReceived', callback).then(listener => {
      this.listeners.push(() => listener.remove());
    });
  }

  async scheduleLocal(options: LocalNotificationOptions): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
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
      // Silent fail
    }
  }

  private setupPushListeners(): void {
    PushNotifications.addListener('registration', async (token: Token) => {
      await this.saveTokenToDatabase(token.value);
    });

    PushNotifications.addListener('registrationError', () => {
      // Silent fail
    });

    PushNotifications.addListener('pushNotificationReceived', () => {
      // Silent processing
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
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
      // Silent fail
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
    // No-op for web
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

// Daily savings reminder helper (7pm)
export const scheduleDailySaveReminder = async (): Promise<void> => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(19, 0, 0, 0); // 7 PM reminder

  await notificationService.scheduleLocal({
    title: "Time to Save n Stack! 💰",
    body: "Keep your momentum going - every save builds your future",
    id: Date.now(),
    schedule: { at: tomorrow },
    extra: { type: 'daily_save_reminder' }
  });
};

// Habit streak reminder helper
export const scheduleStreakReminder = async (streakDays: number): Promise<void> => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(19, 0, 0, 0); // 7 PM reminder

  await notificationService.scheduleLocal({
    title: `Keep your ${streakDays}-day streak alive! 🔥`,
    body: "Save a little today to keep building your financial future",
    id: Date.now(),
    schedule: { at: tomorrow },
    extra: { type: 'streak_reminder', streak_days: streakDays }
  });
};