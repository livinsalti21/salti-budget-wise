import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.livinsalti.savenstack',
  appName: 'Livin Salti',
  webDir: 'dist',
  server: {
    url: 'https://livinsalti.com',
    cleartext: true
  },
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