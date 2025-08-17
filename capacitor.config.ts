import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a665e8b19f80459bbacecd4049038f69',
  appName: 'salti-budget-wise',
  webDir: 'dist',
  server: {
    url: 'https://a665e8b1-9f80-459b-bace-cd4049038f69.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;