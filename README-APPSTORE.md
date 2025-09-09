# App Store Deployment Guide

## ✅ Completed Security Fixes

The following critical security issues have been resolved:
- ✅ Fixed all Function Search Path Mutable warnings (10+ functions updated)
- ✅ Updated Capacitor configuration with proper bundle ID: `com.livinsalti.savenstack`
- ✅ Removed development server configuration from capacitor.config.ts
- ✅ Fixed leaderboard_weekly view to use correct table references

## ⚠️ Remaining Manual Steps Required

### Critical: Supabase Dashboard Configuration

The following security settings **MUST** be configured in your Supabase dashboard before App Store submission:

#### 1. Enable Leaked Password Protection
- Go to: [Authentication > Settings](https://supabase.com/dashboard/project/vmpnajdvcipfuusnjnfr/auth/providers)
- Enable "Leaked Password Protection"
- This prevents users from using commonly compromised passwords

#### 2. Reduce OTP Expiry Time
- Go to: [Authentication > Settings](https://supabase.com/dashboard/project/vmpnajdvcipfuusnjnfr/auth/providers)
- Set OTP expiry to maximum 24 hours (recommended: 1 hour)
- Current setting exceeds security thresholds

#### 3. Upgrade Postgres Version
- Go to: [Settings > Database](https://supabase.com/dashboard/project/vmpnajdvcipfuusnjnfr/settings/database)
- Upgrade to latest Postgres version to apply security patches

#### 4. Move Extensions from Public Schema
- Go to: [SQL Editor](https://supabase.com/dashboard/project/vmpnajdvcipfuusnjnfr/sql/new)
- Run: `ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;`
- Run: `ALTER EXTENSION "pgcrypto" SET SCHEMA extensions;`

## 📱 Next Steps for App Store Submission

### Phase 1: Complete iOS Project Setup (2-3 hours)
1. **Apple Developer Account**: Ensure you have an active Apple Developer Program membership ($99/year)
2. **App Store Connect**: Create app record with bundle ID `com.livinsalti.savenstack`
3. **Certificates & Provisioning**: 
   - Create iOS Distribution Certificate
   - Create App Store Distribution Provisioning Profile
4. **App Icons**: Generate all required icon sizes (see `assets/mobile/icon-generator.md`)
5. **Screenshots**: Prepare App Store screenshots per `store/app-store-listing.md`

### Phase 2: Build & Deploy (1 hour)
```bash
# 1. Build production version
npm run build

# 2. Sync to iOS
npx cap sync ios

# 3. Open in Xcode
npx cap open ios

# 4. Archive and upload to App Store Connect
```

### Phase 3: App Store Review (24-48 hours)
- Submit app metadata from `store/app-store-listing.md`
- Wait for Apple review process

## 🔒 Security Status

| Security Check | Status | Action Required |
|---------------|--------|-----------------|
| Function Search Paths | ✅ Fixed | None |
| Bundle ID Configuration | ✅ Fixed | None |
| Security Definer Views | ⚠️ Supabase Managed | None (vault system view) |
| Extension Placement | ❌ Manual Fix | Move to extensions schema |
| Password Protection | ❌ Manual Fix | Enable in dashboard |
| OTP Expiry | ❌ Manual Fix | Reduce in dashboard |
| Postgres Version | ❌ Manual Fix | Upgrade in dashboard |

## 📞 Support

- **Capacitor Issues**: Check [build-commands.md](./build-commands.md)
- **iOS Build Issues**: Check [docs/mobile-setup.md](./docs/mobile-setup.md)
- **App Store Guidelines**: Review [store/app-store-listing.md](./store/app-store-listing.md)

## 🎯 Timeline Estimate

- **Security fixes (dashboard)**: 30 minutes
- **iOS project setup**: 2-3 hours  
- **Build & submit**: 1 hour
- **Apple review**: 24-48 hours
- **Total**: 3-5 days

Your app is now **90% ready** for App Store submission!