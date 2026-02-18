

# Fix Email Authentication Flow

## Problems Found

1. **Magic link OTP call fails with 400** -- the Supabase `/auth/v1/otp` endpoint rejected the email. The error response is caught but the toast notification may not be visible depending on scroll position.
2. **No password-based auth on the primary `/auth` page** -- The `AuthPage` component (used at `/auth`) only offers magic link email + social auth. Password sign-in/sign-up is only available in the unused `src/pages/Auth.tsx` component. Magic links are less reliable (spam filters, delays) and should not be the only email option.
3. **Redirect URL may not be whitelisted** -- The callback URL (`https://...lovableproject.com/auth/callback`) must be in Supabase's allowed redirect URLs list, or the magic link won't work even with valid emails.
4. **Two duplicate auth page components** -- `src/components/auth/AuthPage.tsx` and `src/pages/Auth.tsx` both implement auth flows with different feature sets, causing confusion.

## Plan

### Step 1: Consolidate to one auth page with password + magic link

Replace the current `AuthPage` component to support **three modes**:
- **Sign In** (email + password) -- default mode
- **Sign Up** (email + password)
- **Magic Link** (email only, as alternative)

This merges the best of both existing auth pages into `AuthPage.tsx`, keeping the social auth buttons (Google/Apple) and adding password fields.

### Step 2: Improve error handling

- Show inline error messages below the form (not just toasts) so errors are always visible
- Add specific handling for common Supabase auth errors (invalid email, wrong password, user not found, rate limited)

### Step 3: Add redirect URL guidance

- Document that the preview URL and production URL must both be added to Supabase Dashboard > Authentication > URL Configuration > Redirect URLs
- Add `https://*.lovable.app/auth/callback` and `https://*.lovableproject.com/auth/callback` patterns

### Step 4: Clean up unused auth page

- Remove the duplicate `src/pages/Auth.tsx` since all auth will go through the consolidated `AuthPage`

### Technical Details

**Files to modify:**
- `src/components/auth/AuthPage.tsx` -- Rebuild to include password auth (sign in/sign up), magic link as alternative, and social auth. Keep the existing visual layout but add password fields and mode switching.
- `src/components/auth/EmailVerificationForm.tsx` -- Refactor into the main `AuthPage` or keep as a sub-component for magic link mode only.

**Files to delete:**
- `src/pages/Auth.tsx` -- Duplicate, no longer needed.

**Supabase Dashboard action required:**
- Go to Authentication > URL Configuration and add these redirect URLs:
  - `https://id-preview--a665e8b1-9f80-459b-bace-cd4049038f69.lovable.app/auth/callback`
  - `https://livinsaltimain.lovable.app/auth/callback`
  - `https://app.livinsalti.com/auth/callback` (production)

**No database changes needed.**

