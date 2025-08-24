import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Coffee, Users, TrendingUp, Shield, ArrowRight, Star, Lock, CheckCircle, Target, Award, Heart, Sparkles, Zap, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { MobileSafeArea } from "@/components/ui/mobile-safe-area";
import { TouchTarget } from "@/components/ui/mobile-helpers";
import { useIsMobile } from "@/hooks/use-mobile";

export default function MobileLanding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [dailySave, setDailySave] = useState([5]);
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimatedValue(prev => prev + Math.random() * 100);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const calculateFutureValue = (dailyAmount: number, years: number) => {
    const annualRate = 0.07;
    const dailyRate = annualRate / 365;
    const days = years * 365;
    const futureValue = dailyAmount * (((1 + dailyRate) ** days - 1) / dailyRate);
    return futureValue;
  };

  const handleGetStarted = () => {
    if (user) {
      navigate("/app");
    } else {
      navigate("/auth");
    }
  };

  if (!isMobile) {
    // Fallback to regular landing page for desktop
    return null;
  }

  return (
    <MobileSafeArea className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Mobile Header */}
      <header className="mobile-container py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
            <Target className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Livin Salti
          </span>
        </div>
        <Badge variant="secondary" className="text-xs px-2 py-1">
          <Lock className="h-3 w-3 mr-1" />
          Secure
        </Badge>
      </header>

      <div className="mobile-container space-y-8 pb-8">
        {/* Hero Section */}
        <section className="text-center space-y-6 pt-4">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Build wealth together
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              Save smarter,{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                stack faster
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Transform small saves into lifelong gains with friends and family
            </p>
          </div>

          {/* Animated Stats Preview */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-secondary/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-center gap-2 text-base">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                Live Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <div className="text-xl font-bold text-primary">
                    ${(animatedValue + 2547).toFixed(0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Saved</div>
                </div>
                <div className="bg-accent/10 p-3 rounded-lg">
                  <div className="text-xl font-bold text-accent">
                    {Math.floor(animatedValue / 100) + 12}
                  </div>
                  <div className="text-xs text-muted-foreground">Friends</div>
                </div>
              </div>
              <div className="bg-success/10 p-3 rounded-lg">
                <div className="text-2xl font-bold text-success">
                  ${(calculateFutureValue(5, 10) + animatedValue * 10).toFixed(0)}
                </div>
                <div className="text-xs text-muted-foreground">10-Year Projection</div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <TouchTarget>
              <Button 
                size="lg" 
                onClick={handleGetStarted} 
                className="w-full text-lg py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg"
              >
                {user ? "Go to App" : "Start Free"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </TouchTarget>
            
            <TouchTarget>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full text-lg py-6 border-2 border-primary/20 hover:bg-primary/5"
                onClick={() => navigate('/sponsor-auth')}
              >
                <Heart className="mr-2 h-5 w-5" />
                Become a Sponsor
              </Button>
            </TouchTarget>
          </div>

          <p className="text-sm text-muted-foreground">
            <Shield className="inline h-4 w-4 mr-1" />
            Bank-grade security • No credit card required
          </p>
        </section>

        {/* How It Works */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-center">How It Works</h2>
          
          <div className="space-y-4">
            <Card className="group bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 touch-feedback">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto mb-3">
                  <Coffee className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Save n Stack</h3>
                <p className="text-sm text-muted-foreground">
                  Skip that coffee, celebrate the save, build your future wealth
                </p>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20 touch-feedback">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent-light rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Match Your Save</h3>
                <p className="text-sm text-muted-foreground">
                  Friends and sponsors match your saves, multiplying your impact
                </p>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-to-br from-success/5 to-success/10 border-success/20 touch-feedback">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-success to-success-light rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">See Your Future</h3>
                <p className="text-sm text-muted-foreground">
                  Watch today's small decision become tomorrow's freedom
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Interactive Projection */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">
              Your <span className="text-primary">Impact</span>
            </h2>
            <p className="text-muted-foreground">See how daily saves add up</p>
          </div>

          <Card className="p-6 bg-gradient-to-br from-secondary/20 to-background">
            <div className="space-y-6">
              <div>
                <label className="font-semibold mb-3 block">
                  Daily save amount
                </label>
                <div className="space-y-3">
                  <Slider 
                    value={dailySave} 
                    onValueChange={setDailySave} 
                    max={25} 
                    min={1} 
                    step={1} 
                    className="touch-manipulation"
                  />
                  <div className="text-center">
                    <span className="text-2xl font-bold text-primary">
                      ${dailySave[0]} per day
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[1, 5, 10, 20].map(years => (
                  <div key={years} className="bg-primary/5 p-3 rounded-lg text-center">
                    <div className="font-bold text-primary">
                      ${calculateFutureValue(dailySave[0], years).toLocaleString('en-US', {
                        maximumFractionDigits: 0
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {years} year{years > 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>

              <TouchTarget>
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-primary to-accent"
                  onClick={handleGetStarted}
                >
                  Start Saving Now
                  <Zap className="ml-2 h-4 w-4" />
                </Button>
              </TouchTarget>
            </div>
          </Card>
        </section>

        {/* Security Features */}
        <section className="space-y-6">
          <div className="text-center">
            <Shield className="w-12 h-12 text-primary mx-auto mb-3" />
            <h2 className="text-2xl font-bold mb-2">Your Data is Secure</h2>
            <p className="text-muted-foreground">Bank-grade protection always</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3 border-primary/20">
              <div className="text-center">
                <Lock className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-sm font-semibold">AES-256</div>
                <div className="text-xs text-muted-foreground">Encrypted</div>
              </div>
            </Card>
            
            <Card className="p-3 border-accent/20">
              <div className="text-center">
                <Shield className="w-8 h-8 text-accent mx-auto mb-2" />
                <div className="text-sm font-semibold">Tokenized</div>
                <div className="text-xs text-muted-foreground">Bank API</div>
              </div>
            </Card>
            
            <Card className="p-3 border-success/20">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                <div className="text-sm font-semibold">Anonymous</div>
                <div className="text-xs text-muted-foreground">Privacy First</div>
              </div>
            </Card>
            
            <Card className="p-3 border-warning/20">
              <div className="text-center">
                <Award className="w-8 h-8 text-warning mx-auto mb-2" />
                <div className="text-sm font-semibold">GDPR</div>
                <div className="text-xs text-muted-foreground">Compliant</div>
              </div>
            </Card>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center space-y-6 py-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Start stacking your future today
            </h2>
            <p className="text-muted-foreground">
              Join thousands building wealth together
            </p>
          </div>

          <div className="space-y-3">
            <TouchTarget>
              <Button 
                size="lg" 
                onClick={handleGetStarted} 
                className="w-full text-lg py-6 bg-gradient-to-r from-primary to-accent shadow-lg"
              >
                {user ? "Go to Dashboard" : "Sign Up Free"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </TouchTarget>
            
            <TouchTarget>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full text-lg py-6"
                onClick={() => navigate('/sponsor-auth')}
              >
                <Heart className="mr-2 h-5 w-5" />
                Become a Sponsor
              </Button>
            </TouchTarget>
          </div>

          <div className="flex justify-center items-center space-x-2 text-sm text-muted-foreground">
            <span>Free to start</span>
            <span>•</span>
            <span>No credit card</span>
            <span>•</span>
            <span>Cancel anytime</span>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-6 border-t">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
              <Target className="h-3 w-3 text-white" />
            </div>
            <span className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Livin Salti
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2024 Livin Salti. All rights reserved.
          </p>
        </footer>
      </div>
    </MobileSafeArea>
  );
}