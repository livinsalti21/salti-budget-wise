import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PiggyBank, Loader2, Mail, ArrowRight, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'magic'>('signin');
  const [emailSent, setEmailSent] = useState(false);
  const { sendVerificationEmail, signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (user) {
    navigate('/app');
    return null;
  }

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const authFunction = authMode === 'signin' ? signIn : signUp;
    const { error } = await authFunction(email, password);
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: authMode === 'signin' ? "Welcome back!" : "Account created!",
        description: authMode === 'signin' ? "Taking you to your dashboard..." : "Your account has been created successfully.",
      });
      // AuthContext will handle the redirect via AuthGateway
    }
    
    setIsLoading(false);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await sendVerificationEmail(email);
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setEmailSent(true);
      toast({
        title: "Email Sent!",
        description: "Check your inbox for the verification link.",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <PiggyBank className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Livin Salti
            </h1>
          </div>
          <p className="text-muted-foreground">
            Save. Match. Grow — Together.
          </p>
        </div>

        {emailSent ? (
          <Card>
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Check Your Email</CardTitle>
              <CardDescription>
                We sent a verification link to <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 rounded-lg border border-primary/20">
                <div className="text-center space-y-2">
                  <Mail className="h-5 w-5 text-primary mx-auto" />
                  <p className="text-sm font-medium">What's Next?</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>1. Check your email inbox</div>
                    <div>2. Click the verification link</div>
                    <div>3. Start your savings journey!</div>
                  </div>
                </div>
              </div>

              <Button 
                variant="outline" 
                onClick={() => {
                  setEmailSent(false);
                  setAuthMode('signin');
                }}
                className="w-full"
              >
                Back to Sign In
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="text-center pb-4">
              <CardTitle>
                {authMode === 'signin' ? 'Welcome Back' : authMode === 'signup' ? 'Create Account' : 'Magic Link Sign In'}
              </CardTitle>
              <CardDescription>
                {authMode === 'signin' 
                  ? 'Sign in to your account to continue saving' 
                  : authMode === 'signup'
                  ? 'Create your account to start your savings journey'
                  : 'Enter your email to get a secure verification link'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {authMode === 'magic' ? (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300 text-white" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Magic Link
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handlePasswordAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300 text-white" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {authMode === 'signin' ? 'Signing In...' : 'Creating Account...'}
                      </>
                    ) : (
                      <>
                        {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}

              <div className="mt-6 space-y-3">
                {authMode !== 'magic' && (
                  <div className="text-center">
                    <Button
                      variant="link"
                      onClick={() => setAuthMode('magic')}
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      Prefer magic link? Sign in with email only
                    </Button>
                  </div>
                )}

                <div className="text-center">
                  {authMode === 'signin' ? (
                    <Button
                      variant="link"
                      onClick={() => setAuthMode('signup')}
                      className="text-sm"
                    >
                      Don't have an account? <span className="text-primary ml-1">Sign up</span>
                    </Button>
                  ) : authMode === 'signup' ? (
                    <Button
                      variant="link"
                      onClick={() => setAuthMode('signin')}
                      className="text-sm"
                    >
                      Already have an account? <span className="text-primary ml-1">Sign in</span>
                    </Button>
                  ) : (
                    <Button
                      variant="link"
                      onClick={() => setAuthMode('signin')}
                      className="text-sm"
                    >
                      Back to password sign in
                    </Button>
                  )}
                </div>
              </div>

              {authMode !== 'magic' && (
                <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 rounded-lg border border-primary/20 mt-4">
                  <div className="text-center space-y-2">
                    <CheckCircle className="h-5 w-5 text-primary mx-auto" />
                    <p className="text-sm font-medium">Quick & Secure</p>
                    <div className="text-xs text-muted-foreground">
                      Instant access with password. No email verification needed!
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Auth;