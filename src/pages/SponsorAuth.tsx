import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Mail, ArrowRight, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SponsorAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/sponsor-dashboard');
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let authResult;
      
      if (isSignUp) {
        authResult = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/sponsor-dashboard`
          }
        });
      } else {
        authResult = await supabase.auth.signInWithPassword({
          email,
          password
        });
      }

      if (authResult.error) {
        toast({
          title: "Authentication Error",
          description: authResult.error.message,
          variant: "destructive"
        });
        return;
      }

      // Create or update sponsor record
      if (authResult.data.user) {
        const { error: sponsorError } = await supabase
          .from('sponsors')
          .upsert({
            email: authResult.data.user.email!
          });

        if (sponsorError) {
          console.error('Error creating sponsor record:', sponsorError);
        }
      }

      toast({
        title: isSignUp ? "Account Created!" : "Welcome Back!",
        description: isSignUp 
          ? "Please check your email to confirm your account."
          : "Redirecting to your sponsor dashboard..."
      });

      if (!isSignUp) {
        navigate('/sponsor-dashboard');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
              <span className="text-lg">✌🏽</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Livin Salti
            </h1>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Become a Sponsor</h2>
            <p className="text-muted-foreground">
              Help others save money and watch their wealth grow over time
            </p>
          </div>
        </div>

        {/* Benefits Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Why Sponsor?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Make a Real Impact</p>
                <p className="text-sm text-muted-foreground">Help young people build wealth for their future</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">See Your Impact</p>
                <p className="text-sm text-muted-foreground">Track exactly how much you're helping them save over 30+ years</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auth Form */}
        <Card>
          <CardHeader>
            <CardTitle>{isSignUp ? 'Create Account' : 'Sign In'}</CardTitle>
            <CardDescription>
              {isSignUp 
                ? 'Start sponsoring savings today'
                : 'Access your sponsor dashboard'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"
                }
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back to main app */}
        <div className="text-center">
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Main App
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SponsorAuth;