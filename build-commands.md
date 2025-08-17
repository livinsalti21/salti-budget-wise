# Livin Salti Mobile Build Commands

Complete instructions for building iOS and Android apps from the Livin Salti PWA.

## Prerequisites Verification

Before starting, verify you have all prerequisites installed:

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Verify Capacitor CLI
npx cap --version

# iOS only (macOS required)
xcode-select --version
pod --version

# Android only
java --version
echo $ANDROID_HOME
```

## Initial Setup (One-time)

```bash
# 1. Clone the repository
git clone https://github.com/livinsalti21/salti-budget-wise.git
cd salti-budget-wise

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your actual values

# 4. Build the web app
npm run build

# 5. Initialize Capacitor native projects
npx cap add ios
npx cap add android

# 6. Sync web build to native projects
npx cap sync
```

## Daily Development Workflow

```bash
# Make your code changes in src/

# Build and test web version
npm run dev
# Test at http://localhost:5173

# When ready to test on mobile:
npm run build
npx cap sync

# For iOS testing
npx cap open ios
# Then build and run in Xcode

# For Android testing  
npx cap open android
# Then build and run in Android Studio
```

## iOS Build Process

### Development Build (Testing)

```bash
# 1. Ensure latest web build
npm run build
npx cap sync ios

# 2. Open Xcode project
npx cap open ios

# 3. In Xcode:
# - Select your development team
# - Choose a simulator or connected device
# - Click the play button or press Cmd+R
```

### Release Build (App Store)

```bash
# 1. Ensure production build
npm run build
npx cap sync ios

# 2. Open Xcode project
npx cap open ios

# 3. In Xcode:
# - Select "Any iOS Device" as destination
# - Go to Product > Archive
# - Wait for archive to complete
# - In Organizer, select "Distribute App"
# - Choose "App Store Connect"
# - Follow upload wizard
```

### iOS Signing Setup

1. **Apple Developer Account**
   - Join Apple Developer Program ($99/year)
   - Create App ID: `com.livinsalti.savenstack`

2. **Certificates & Profiles**
   ```bash
   # In Xcode, go to:
   # Signing & Capabilities > Team > [Your Team]
   # Xcode will automatically manage certificates
   ```

3. **App Store Connect**
   - Create new app entry
   - Upload app metadata and screenshots
   - Set pricing and availability

## Android Build Process

### Development Build (Testing)

```bash
# 1. Ensure latest web build
npm run build
npx cap sync android

# 2. Open Android Studio project
npx cap open android

# 3. In Android Studio:
# - Wait for Gradle sync
# - Select device/emulator
# - Click Run button or press Shift+F10
```

### Release Build (Play Store)

```bash
# 1. Ensure production build
npm run build
npx cap sync android

# 2. Generate signing key (one-time setup)
keytool -genkey -v -keystore release-key.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias livin-salti-key

# 3. Configure gradle signing
# Edit android/app/build.gradle:
# Add signingConfigs and buildTypes sections

# 4. Build release AAB
cd android
./gradlew bundleRelease

# 5. Upload to Play Console
# File location: android/app/build/outputs/bundle/release/app-release.aab
```

### Android Signing Setup

1. **Create Keystore**
   ```bash
   keytool -genkey -v -keystore ~/livin-salti-release.keystore \
     -keyalg RSA -keysize 2048 -validity 10000 \
     -alias livin-salti
   ```

2. **Configure Build**
   Add to `android/app/build.gradle`:
   ```gradle
   android {
     signingConfigs {
       release {
         keyAlias 'livin-salti'
         keyPassword '[your-key-password]'
         storeFile file('/path/to/livin-salti-release.keystore')
         storePassword '[your-store-password]'
       }
     }
     buildTypes {
       release {
         signingConfig signingConfigs.release
         minifyEnabled true
         proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
       }
     }
   }
   ```

3. **Google Play Console**
   - Create new app
   - Upload AAB file
   - Complete store listing

## Environment Configuration

### Required Environment Variables

```bash
# Supabase (Required)
VITE_SUPABASE_URL=https://vmpnajdvcipfuusnjnfr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Firebase (Required for push notifications)
VITE_FCM_SENDER_ID=123456789
VITE_FCM_API_KEY=AIzaSyD...
VITE_FCM_PROJECT_ID=livin-salti
VITE_FCM_APP_ID=1:123456789:web:abc123

# Optional
VITE_STRIPE_PK=pk_live_...
VITE_PLAID_CLIENT_ID=...
VITE_ANALYTICS_PROVIDER=posthog
VITE_POSTHOG_KEY=phc_...
```

### Firebase Setup

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com
   - Create new project: "livin-salti"

2. **Add iOS App**
   - Bundle ID: `com.livinsalti.savenstack`
   - Download `GoogleService-Info.plist`
   - Place in `ios/App/App/`

3. **Add Android App**
   - Package name: `com.livinsalti.savenstack`
   - Download `google-services.json`
   - Place in `android/app/`

4. **Enable Cloud Messaging**
   - Go to Project Settings > Cloud Messaging
   - Generate server key for backend

## Testing Checklist

### Pre-Build Testing

- [ ] Web app builds without errors: `npm run build`
- [ ] No TypeScript errors: `npm run lint`
- [ ] All environment variables set
- [ ] Firebase configuration files in place

### iOS Testing

- [ ] App launches successfully
- [ ] All main features work (budget, stacklets, social)
- [ ] Push notifications request permission
- [ ] Deep links work (test with Safari)
- [ ] Offline mode functions properly
- [ ] No console errors in Safari Web Inspector

### Android Testing

- [ ] App launches successfully  
- [ ] All main features work
- [ ] Push notifications work
- [ ] Deep links work (test with Chrome)
- [ ] Offline mode functions
- [ ] No errors in Chrome DevTools (chrome://inspect)

### Release Testing

- [ ] Test on multiple device sizes
- [ ] Test with different OS versions
- [ ] Verify app store metadata matches app
- [ ] Test In-App Purchases (if applicable)
- [ ] Verify analytics tracking works

## Store Submission Checklist

### iOS App Store

- [ ] App builds and runs on device
- [ ] App Store Connect app created
- [ ] Screenshots uploaded (all required sizes)
- [ ] App description and metadata complete
- [ ] Privacy policy URL set
- [ ] Age rating appropriate
- [ ] Test with TestFlight before submission

### Google Play Store

- [ ] AAB file generated and tested
- [ ] Play Console app created
- [ ] Screenshots uploaded (all required sizes)
- [ ] Store listing complete
- [ ] Content rating completed
- [ ] Privacy policy link provided
- [ ] Release configuration set

## Common Issues & Solutions

### Build Failures

**Issue**: Capacitor sync fails
```bash
# Solution: Clean and rebuild
npx cap clean
npm run build
npx cap sync
```

**Issue**: iOS build fails with signing errors
```bash
# Solution: Reset signing in Xcode
# Go to Signing & Capabilities
# Uncheck and recheck "Automatically manage signing"
```

**Issue**: Android build fails with Gradle errors
```bash
# Solution: Clean Gradle cache
cd android
./gradlew clean
cd ..
npx cap sync android
```

### Runtime Issues

**Issue**: White screen on app launch
- Check web build completed: `npm run build`
- Check console for JavaScript errors
- Verify environment variables are set

**Issue**: Push notifications not working
- Verify Firebase configuration files
- Check device permissions
- Test notification from Firebase Console

**Issue**: Deep links not working
- Verify associated domains configured
- Test universal links from Safari/Chrome
- Check custom scheme registration

## Performance Optimization

### Bundle Size Optimization

```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Key optimizations:
# - Tree shake unused dependencies
# - Lazy load routes and components
# - Optimize images and assets
# - Use compression in production
```

### Runtime Performance

- Test on lower-end devices
- Profile with browser dev tools
- Optimize heavy computations
- Implement proper loading states
- Use virtual scrolling for long lists

## Maintenance

### Regular Updates

```bash
# Update dependencies monthly
npm update

# Update Capacitor
npm install @capacitor/core@latest @capacitor/cli@latest
npx cap sync

# Update native dependencies
cd ios && pod update && cd ..
cd android && ./gradlew clean && cd ..
```

### Security Updates

- Monitor for security advisories
- Update Supabase client regularly
- Keep Firebase SDK updated
- Review and update dependencies

This completes the comprehensive build and deployment guide for converting Livin Salti into mobile apps.