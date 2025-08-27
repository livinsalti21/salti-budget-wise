import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a665e8b19f80459bbacecd4049038f69',
  appName: 'livinsaltimain',
  webDir: 'dist',
  // Remove server config for production builds
  // server: {
  //   url: 'https://a665e8b1-9f80-459b-bace-cd4049038f69.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav"
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ff6e40",
      showSpinner: false
    }
  },
  ios: {
    scheme: "Livin Salti"
  },
  android: {
    allowMixedContent: true
  }
};

export default config;