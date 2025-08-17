# Mobile App Setup Guide

This guide walks you through setting up and building the Livin Salti mobile app for iOS and Android using Capacitor.

## Prerequisites

### Required Software
- **Node.js 18+** (check with `node --version`)
- **npm or yarn** (included with Node.js)
- **Git** for version control

### iOS Development (macOS only)
- **Xcode 14+** from the Mac App Store
- **Xcode Command Line Tools**: `xcode-select --install`
- **CocoaPods**: `sudo gem install cocoapods`

### Android Development
- **Android Studio** with:
  - Android SDK (API level 24+)
  - Android SDK Build-Tools
  - Android SDK Platform-Tools
- **Java Development Kit 11** (JDK 11)

## Initial Setup

1. **Clone and install dependencies**:
   ```bash
   git clone https://github.com/livinsalti21/salti-budget-wise.git
   cd salti-budget-wise
   npm install
   ```

2. **Set up environment variables**:
   Copy `.env.example` to `.env.local` and fill in your keys:
   ```bash
   cp .env.example .env.local
   ```
   
   Required variables:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `VITE_FCM_SENDER_ID` - Firebase sender ID for push notifications
   - `VITE_FCM_API_KEY` - Firebase API key
   - `VITE_FCM_PROJECT_ID` - Firebase project ID
   - `VITE_FCM_APP_ID` - Firebase app ID

3. **Initialize Capacitor native projects**:
   ```bash
   npm run mobile:init
   ```

4. **Build the web app and sync to native**:
   ```bash
   npm run build
   npm run mobile:sync
   ```

## iOS Development

1. **Open the iOS project**:
   ```bash
   npm run ios:open
   ```

2. **Configure signing**:
   - In Xcode, select your project in the navigator
   - Go to "Signing & Capabilities"
   - Select your development team
   - Ensure bundle identifier is `com.livinsalti.savenstack`

3. **Add push notification capability**:
   - In "Signing & Capabilities", click "+ Capability"
   - Add "Push Notifications"
   - Add "Associated Domains" with value: `applinks:livinsalti.com`

4. **Run on simulator**:
   - Select a simulator from the device list
   - Press the play button or `Cmd+R`

5. **Run on device**:
   - Connect your iOS device via USB
   - Select your device from the device list
   - Press play (may require enabling Developer Mode on device)

## Android Development

1. **Open the Android project**:
   ```bash
   npm run android:open
   ```

2. **Configure app links**:
   - Verify `android/app/src/main/res/values/strings.xml` contains the correct host
   - Check `android/app/src/main/AndroidManifest.xml` for intent filters

3. **Run on emulator**:
   - Start an Android emulator from Android Studio
   - Click the green play button or use `Shift+F10`

4. **Run on device**:
   - Enable Developer Options and USB Debugging on your Android device
   - Connect via USB
   - Select your device and run

## Development Workflow

### Making Changes
1. Make changes to your React code in `src/`
2. Test in web browser: `npm run dev`
3. Build and sync: `npm run build && npm run mobile:sync`
4. Test on mobile devices

### Push Notifications Setup

1. **Firebase Setup**:
   - Create a Firebase project at https://console.firebase.google.com
   - Add iOS and Android apps to the project
   - Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
   - Place files in respective native project directories

2. **APNs Setup (iOS)**:
   - Generate APNs certificates in Apple Developer portal
   - Upload to Firebase Cloud Messaging

3. **Test Notifications**:
   - Use Firebase Console to send test notifications
   - Verify device tokens are saved to Supabase `device_tokens` table

## Building for Release

### Android Release

1. **Generate signing key**:
   ```bash
   keytool -genkey -v -keystore my-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
   ```

2. **Configure gradle signing** in `android/app/build.gradle`

3. **Build AAB**:
   ```bash
   npm run android:build
   ```

### iOS Release

1. **Configure signing** for distribution in Xcode
2. **Archive the app**: Product → Archive
3. **Export for App Store** or TestFlight

## Troubleshooting

### Common Issues

**Build fails with Capacitor errors**:
- Ensure you ran `npm run mobile:sync` after code changes
- Clean build folders: `npx cap clean`

**Push notifications not working**:
- Verify Firebase configuration files are in correct locations
- Check device tokens are being saved to database
- Ensure certificates are properly configured

**App won't open deep links**:
- Verify associated domains are configured
- Check that web links redirect to custom scheme as fallback

**iOS simulator shows white screen**:
- Check console for JavaScript errors
- Ensure web build succeeded: `npm run build`

### Logs and Debugging

- **iOS**: Use Safari Web Inspector (Develop → Simulator → Your App)
- **Android**: Use Chrome DevTools (chrome://inspect)
- **Console logs**: Check Xcode Console (iOS) or Android Studio Logcat (Android)

## Store Submission

### iOS App Store
1. Archive build in Xcode
2. Upload via Xcode Organizer or Transporter
3. Submit through App Store Connect

### Google Play Store
1. Generate signed AAB: `npm run android:build`
2. Upload via Google Play Console
3. Complete store listing and publish

For detailed store submission requirements, see `/store/` folder for assets and descriptions.

## Environment Variables Reference

```bash
# Supabase (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Firebase/FCM (Required for push notifications)
VITE_FCM_SENDER_ID=123456789
VITE_FCM_API_KEY=your-api-key
VITE_FCM_PROJECT_ID=your-project-id
VITE_FCM_APP_ID=1:123456789:web:abcdef

# Optional integrations
VITE_STRIPE_PK=pk_test_...
VITE_PLAID_CLIENT_ID=your-plaid-client-id
VITE_PLAID_ENV=sandbox
VITE_OPENAI_KEY=your-openai-key

# Analytics (Optional)
VITE_ANALYTICS_PROVIDER=posthog
VITE_POSTHOG_KEY=your-posthog-key
VITE_POSTHOG_HOST=https://app.posthog.com

# App Configuration
VITE_APP_URL=https://livinsalti.com
VITE_DEEP_LINK_SCHEME=save-n-stack
```

## Support

For issues specific to this setup:
1. Check the troubleshooting section above
2. Review Capacitor documentation: https://capacitorjs.com/docs
3. Check Firebase documentation for push notification setup
4. Contact the development team with detailed error messages and steps to reproduce