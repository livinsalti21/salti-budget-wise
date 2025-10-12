import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowRight, CheckCircle, PiggyBank } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function EmailVerificationForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const { sendVerificationEmail, signInWithGoogle, signInWithApple } = useAuth();
  const { toast } = useToast();

  const handleSocialAuth = async (provider: 'google' | 'apple') => {
    setSocialLoading(true);
    try {
      const signInFn = provider === 'google' ? signInWithGoogle : signInWithApple;
      const { error } = await signInFn();
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSocialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await sendVerificationEmail(email);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setEmailSent(true);
        toast({
          title: "Email Sent!",
          description: "Check your inbox for the verification link.",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-xl">Check Your Email</CardTitle>
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
            onClick={() => setEmailSent(false)}
            className="w-full"
          >
            Use Different Email
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-2xl">
      <CardHeader className="text-center pb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
          <PiggyBank className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-xl">Start Your Savings Journey</CardTitle>
        <CardDescription>
          Enter your email to get started. We'll send you a secure verification link.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Social Auth Buttons */}
        <div className="space-y-3">
          <Button 
            type="button"
            onClick={() => handleSocialAuth('google')}
            disabled={socialLoading}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
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
            className="w-full bg-black hover:bg-gray-900 text-white"
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="Enter your preferred email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10" 
              required 
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300 text-white" 
            disabled={loading}
            size="lg"
          >
            {loading ? 'Sending...' : (
              <>
                Send Verification Email
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 rounded-lg border border-primary/20">
          <div className="text-center space-y-2">
            <CheckCircle className="h-5 w-5 text-primary mx-auto" />
            <p className="text-sm font-medium">Why Email Verification?</p>
            <div className="text-xs text-muted-foreground">
              We keep your account secure and send you important savings updates.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}