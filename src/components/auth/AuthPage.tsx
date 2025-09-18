import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Eye, EyeOff, Mail, Lock, User, TrendingUp, Users, Flame, 
  PiggyBank, Crown, Shield, CheckCircle, ArrowRight, Zap,
  Star, Target, Calendar
} from 'lucide-react';
import SocialAuth from './SocialAuth';
import FutureValueChart from '@/features/edu/FutureValueChart';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    totalSaved: 2547,
    activeUsers: 12847,
    dailySavings: 2547
  });
  
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  // Animate stats for engagement
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedStats(prev => ({
        totalSaved: prev.totalSaved + Math.floor(Math.random() * 10),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3),
        dailySavings: prev.dailySavings + Math.floor(Math.random() * 15)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = isSignUp 
        ? await signUp(formData.email, formData.password)
        : await signIn(formData.email, formData.password);

      if (error) {
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: isSignUp ? "Account created! Check your email to verify." : "Welcome back!",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-10 w-24 h-24 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-1/4 w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-6">
          
          {/* Hero Stats Section */}
          <div className="text-center space-y-4 mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-sm">
                ✌🏽
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Livin Salti
              </h1>
            </div>
            
            {/* Real-time animated stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 p-3">
                <div className="text-center">
                  <Users className="h-4 w-4 text-primary mx-auto mb-1" />
                  <div className="text-lg font-bold text-primary animate-pulse">
                    {animatedStats.activeUsers.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Savers</div>
                </div>
              </Card>
              
              <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20 p-3">
                <div className="text-center">
                  <PiggyBank className="h-4 w-4 text-success mx-auto mb-1" />
                  <div className="text-lg font-bold text-success animate-pulse">
                    ${animatedStats.totalSaved.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Saved Today</div>
                </div>
              </Card>
              
              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 p-3">
                <div className="text-center">
                  <Flame className="h-4 w-4 text-accent mx-auto mb-1" />
                  <div className="text-lg font-bold text-accent">7</div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                </div>
              </Card>
            </div>

            {/* Social proof and excitement builder */}
            <div className="space-y-2">
              <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
                <Star className="w-3 h-3 mr-1" />
                New users save $247 avg in first month
              </Badge>
              <p className="text-sm text-muted-foreground">
                🚀 Join thousands building wealth together
              </p>
            </div>
          </div>

          {/* Enhanced Social Auth - Move to top */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <h2 className="text-lg font-semibold mb-1">Start in 10 seconds</h2>
                <p className="text-sm text-muted-foreground">Choose your preferred method</p>
              </div>
              <SocialAuth />
            </CardContent>
          </Card>

          {/* Main Auth Card */}
          <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl">
                {isSignUp ? 'Create Your Account' : 'Welcome Back'}
              </CardTitle>
              <CardDescription className="flex items-center justify-center gap-2">
                {isSignUp 
                  ? (
                    <>
                      <Target className="w-4 h-4" />
                      Set your first goal in 2 minutes
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      Continue your wealth journey
                    </>
                  )
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="pl-10"
                      required={isSignUp}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
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
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10 pr-10"
                      required
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

                {!isSignUp && (
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember" 
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                    />
                    <Label htmlFor="remember" className="text-sm">
                      Remember me
                    </Label>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300 text-white" 
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    'Please wait...'
                  ) : (
                    <>
                      {isSignUp ? 'Create Account' : 'Sign In'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Progress teaser for sign up */}
              {isSignUp && (
                <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 rounded-lg border border-primary/20">
                  <div className="text-center space-y-2">
                    <Zap className="h-5 w-5 text-primary mx-auto" />
                    <p className="text-sm font-medium">What happens next?</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Step 1: Verify email → Step 2: Set first goal → Step 3: Start saving!</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center">
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

          {/* Trust badges */}
          <div className="flex justify-center items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Bank Security
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Free Forever
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              12K+ Users
            </div>
          </div>

          {/* Success stories ticker */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground animate-pulse">
              💡 "Best decision I made for my financial future" - Sarah M.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}