import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PiggyBank, Loader2, Mail, ArrowRight, CheckCircle, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'signin' | 'signup' | 'magic';

function formatAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) return 'Incorrect email or password.';
  if (lower.includes('email not confirmed')) return 'Please verify your email before signing in.';
  if (lower.includes('user already registered')) return 'An account with this email already exists. Try signing in.';
  if (lower.includes('rate limit') || lower.includes('too many')) return 'Too many attempts. Please wait a moment and try again.';
  if (lower.includes('password') && lower.includes('least')) return 'Password must be at least 6 characters.';
  if (lower.includes('email_address_invalid') || lower.includes('invalid email')) return 'Please enter a valid email address.';
  return message;
}

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { sendVerificationEmail, signIn, signUp, signInWithGoogle, signInWithApple, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/app');
    return null;
  }

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fn = authMode === 'signin' ? signIn : signUp;
    const { error: err } = await fn(email, password);
    if (err) {
      setError(formatAuthError(err.message));
    }
    setLoading(false);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await sendVerificationEmail(email);
    if (err) {
      setError(formatAuthError(err.message));
    } else {
      setEmailSent(true);
    }
    setLoading(false);
  };

  const handleSocialAuth = async (provider: 'google' | 'apple') => {
    setError(null);
    setSocialLoading(true);
    const fn = provider === 'google' ? signInWithGoogle : signInWithApple;
    const { error: err } = await fn();
    if (err) {
      setError(formatAuthError(err.message));
    }
    setSocialLoading(false);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle>Check Your Email</CardTitle>
              <CardDescription>
                We sent a verification link to <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg text-center space-y-2">
                <Mail className="h-5 w-5 text-primary mx-auto" />
                <p className="text-sm font-medium">What's Next?</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>1. Check your email inbox</div>
                  <div>2. Click the verification link</div>
                  <div>3. Start your savings journey!</div>
                </div>
              </div>
              <Button variant="outline" onClick={() => { setEmailSent(false); setAuthMode('signin'); }} className="w-full">
                Back to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <PiggyBank className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Livin Salti</h1>
          </div>
          <p className="text-sm text-muted-foreground">Save. Match. Grow — Together.</p>
        </div>

        <Card>
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg">
              {authMode === 'signin' ? 'Welcome Back' : authMode === 'signup' ? 'Create Account' : 'Magic Link'}
            </CardTitle>
            <CardDescription>
              {authMode === 'signin'
                ? 'Sign in to continue saving'
                : authMode === 'signup'
                ? 'Create your account to get started'
                : 'Get a secure link sent to your email'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Inline error */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Social auth */}
            <div className="space-y-2">
              <Button
                type="button"
                onClick={() => handleSocialAuth('google')}
                disabled={socialLoading}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {socialLoading ? 'Signing in...' : 'Continue with Google'}
              </Button>

              <Button
                type="button"
                onClick={() => handleSocialAuth('apple')}
                disabled={socialLoading}
                className="w-full bg-foreground text-background hover:bg-foreground/90"
                size="lg"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                {socialLoading ? 'Signing in...' : 'Continue with Apple'}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            {/* Email form */}
            <form onSubmit={authMode === 'magic' ? handleMagicLink : handlePasswordAuth} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="flex items-center gap-1.5 text-sm">
                  <Mail className="h-3.5 w-3.5" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  required
                />
              </div>

              {authMode !== 'magic' && (
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="flex items-center gap-1.5 text-sm">
                    <Lock className="h-3.5 w-3.5" /> Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(null); }}
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {authMode === 'magic' ? 'Sending...' : authMode === 'signin' ? 'Signing In...' : 'Creating Account...'}</>
                ) : (
                  <>{authMode === 'magic' ? 'Send Magic Link' : authMode === 'signin' ? 'Sign In' : 'Create Account'} <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </form>

            {/* Mode switchers */}
            <div className="flex flex-col items-center gap-1 text-sm">
              {authMode === 'signin' && (
                <>
                  <Button variant="link" size="sm" onClick={() => { setAuthMode('signup'); setError(null); }}>
                    Don't have an account? <span className="text-primary ml-1">Sign up</span>
                  </Button>
                  <Button variant="link" size="sm" className="text-muted-foreground" onClick={() => { setAuthMode('magic'); setError(null); }}>
                    Use magic link instead
                  </Button>
                </>
              )}
              {authMode === 'signup' && (
                <Button variant="link" size="sm" onClick={() => { setAuthMode('signin'); setError(null); }}>
                  Already have an account? <span className="text-primary ml-1">Sign in</span>
                </Button>
              )}
              {authMode === 'magic' && (
                <Button variant="link" size="sm" onClick={() => { setAuthMode('signin'); setError(null); }}>
                  Back to password sign in
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
