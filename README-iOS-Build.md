# iOS App Store Build Instructions

This guide covers building and deploying the Livin Salti React app to iOS using Capacitor.

## Prerequisites

- macOS with Xcode 14+ installed
- Apple Developer Account ($99/year)
- Node.js 16+ and npm
- Capacitor CLI: `npm install -g @capacitor/cli`

## Initial Setup (One-time)

1. **Clone and Install Dependencies**
   ```bash
   git clone [your-repo-url]
   cd livin-salti
   npm install
   ```

2. **Configure Environment Variables**
   Create `.env.local` with your production values:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   # Add other production environment variables
   ```

3. **Initialize iOS Platform** (if not already done)
   ```bash
   npx cap add ios
   ```

## Build Process

### 1. Build the Web App
```bash
npm run build
```

### 2. Sync to iOS
```bash
npx cap copy ios
npx cap update ios
```

### 3. Open in Xcode
```bash
npx cap open ios
```

## Xcode Configuration

### 1. App Signing & Certificates
- In Xcode, select your app target
- Go to "Signing & Capabilities"
- Select your development team
- Ensure "Automatically manage signing" is checked
- Bundle Identifier should be: `app.lovable.a665e8b19f80459bbacecd4049038f69`

### 2. Add Required Capabilities
Add these capabilities in "Signing & Capabilities":
- **Push Notifications** (for daily save reminders)
- **Associated Domains** (for deep linking)
  - Add domains: `applinks:yourdomain.com`

### 3. Verify Info.plist Permissions
Ensure these usage descriptions are present in `Info.plist`:
- `NSUserNotificationsUsageDescription`
- `NSFaceIDUsageDescription` 
- `NSLocalNetworkUsageDescription`
- `NSCameraUsageDescription`
- `NSPhotoLibraryUsageDescription`
- `NSContactsUsageDescription`

## App Store Build

### 1. Archive the App
- In Xcode, select "Any iOS Device" as target
- Product → Archive
- Wait for archive to complete

### 2. Upload to App Store Connect
- When archive completes, Organizer opens
- Select your archive
- Click "Distribute App"
- Choose "App Store Connect"
- Follow the upload wizard

### 3. Submit for Review
- Log into [App Store Connect](https://appstoreconnect.apple.com)
- Select your app
- Create a new version if needed
- Add required metadata:
  - App name: "Livin Salti"
  - Description: Focus on savings habits and financial wellness
  - Keywords: savings, budget, finance, money, habit
  - Screenshots: Required for all device sizes
- Submit for review

## Development Workflow

For ongoing development:

```bash
# 1. Make code changes in src/
# 2. Test in browser
npm run dev

# 3. When ready for mobile testing
npm run build
npx cap copy ios

# 4. Test in iOS Simulator
npx cap run ios

# 5. For App Store release
# Repeat the Archive → Upload process above
```

## App Features Implemented

✅ **Native 4-Tab Navigation**: Home, Save n Stack, Budget, Profile
✅ **Native Share Integration**: Uses Capacitor Share API
✅ **Local Notifications**: Daily 7 PM "Save n Stack" reminders with toggle
✅ **Account Deletion**: Complete flow with success timeline
✅ **Privacy Compliance**: PrivacyInfo.xcprivacy and proper Info.plist

## Troubleshooting

### Build Failures
- Clean Xcode build folder: Product → Clean Build Folder
- Delete DerivedData: `rm -rf ~/Library/Developer/Xcode/DerivedData`
- Regenerate iOS platform: `npx cap add ios` (after backing up custom changes)

### Signing Issues
- Verify Apple Developer account is active
- Check certificates in Keychain Access
- Try "Automatically manage signing" toggle

### Push Notifications Not Working
- Verify APNs certificates in Apple Developer portal
- Check that Push Notifications capability is enabled
- Test on physical device (not simulator)

### App Rejected by Apple
- Common issues: Missing privacy policy, unclear app purpose, broken functionality
- Review Apple's App Store Review Guidelines
- Ensure all features work without crashes

## Production Checklist

Before final submission:

- [ ] Remove development server URL from capacitor.config.ts
- [ ] Test all core flows: save, budget, notifications, sharing
- [ ] Verify account deletion works completely
- [ ] Test on multiple iOS devices and screen sizes
- [ ] Privacy policy accessible and up-to-date
- [ ] App metadata complete in App Store Connect
- [ ] Screenshots for all required device sizes
- [ ] Age rating appropriate (likely 4+ or 9+)

## Support

For issues with this build process, check:
- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Apple Developer Documentation](https://developer.apple.com)
- Project issues/discussions

## Version History

- v1.0.0: Initial iOS App Store release
  - 4-tab native navigation
  - Daily save reminders
  - Native sharing
  - Account management