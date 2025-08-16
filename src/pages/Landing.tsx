import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Coffee, Users, TrendingUp, Shield, ArrowRight, Star, Lock, CheckCircle, Target, Award, Play, Download, Instagram, Youtube, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
export default function Landing() {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
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
      navigate("/");
    } else {
      navigate("/auth");
    }
  };
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
            <Target className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Livin Salti
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="hidden sm:flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Encrypted & Secure
          </Badge>
          <Button onClick={handleGetStarted}>
            {user ? "Dashboard" : "Start Free"}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 lg:px-6 bg-gradient-to-br from-background via-secondary to-background">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              Save smarter, stack faster,{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                live your way.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Build wealth through habits. Celebrate every win. Transform small saves into lifelong gains — together.
            </p>
            
            {/* Animated Dashboard Preview */}
            <Card className="max-w-2xl mx-auto mb-8 shadow-lg border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                  Live Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      ${(animatedValue + 2547).toFixed(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Saved</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg">
                    <div className="text-2xl font-bold text-accent">
                      {Math.floor(animatedValue / 100) + 12}
                    </div>
                    <div className="text-sm text-muted-foreground">Friends Matching</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-lg">
                    <div className="text-2xl font-bold text-success">
                      ${(calculateFutureValue(5, 10) + animatedValue * 10).toFixed(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">10Y Projection</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-6">
                Start Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" onClick={() => navigate('/sponsor-auth')}>
                <Heart className="mr-2 h-5 w-5" />
                Become a Sponsor
              </Button>
            </div>

            <Badge variant="secondary" className="text-sm">
              <Shield className="mr-2 h-4 w-4" />
              Your data is encrypted & anonymized
            </Badge>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 lg:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Build Better Money Habits</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Turn everyday decisions into wealth-building moments with friends and family
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-primary/20">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Coffee className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Save n Stack</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base">
                  Build the habit of conscious spending. Every skipped purchase becomes a celebrated win and future wealth.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-accent/20">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent-light rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Match Your Save</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base">
                  Create accountability circles. When friends match your saves, you both celebrate shared future wealth creation.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-success/20">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-success to-success-light rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">See Your Future</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base">
                  Visualize how today's small decision becomes tomorrow's freedom. Every save reveals your path to financial independence.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Impact Projection */}
      <section className="py-20 px-4 lg:px-6 bg-gradient-to-br from-secondary to-background">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your <span className="text-primary">Impact Projection</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              See how small daily saves create massive long-term wealth
            </p>
          </div>

          <Card className="p-8 shadow-xl border-2 border-primary/20">
            <div className="mb-8">
              <label className="text-lg font-semibold mb-4 block">
                How much do you save per day?
              </label>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-sm text-muted-foreground">$1</span>
                <Slider value={dailySave} onValueChange={setDailySave} max={50} min={1} step={1} className="flex-1" />
                <span className="text-sm text-muted-foreground">$50</span>
              </div>
              <div className="text-center">
                <span className="text-3xl font-bold text-primary">
                  ${dailySave[0]} per day
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {[1, 5, 10, 20, 30].map(years => <div key={years} className="text-center p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border">
                  <div className="text-lg font-bold text-primary">
                    ${calculateFutureValue(dailySave[0], years).toLocaleString('en-US', {
                  maximumFractionDigits: 0
                })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {years} year{years > 1 ? 's' : ''}
                  </div>
                </div>)}
            </div>

            <div className="text-center">
              <Button size="lg" className="mr-4">
                Start Saving Now
              </Button>
              <Button size="lg" variant="outline">
                Share This Projection
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 px-4 lg:px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-12">
            <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your Data is <span className="text-primary">Yours, Always</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Bank-grade security with complete user control
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6 border-primary/20">
              <div className="flex items-center mb-4">
                <Lock className="w-8 h-8 text-primary mr-3" />
                <div className="text-left">
                  <h3 className="font-semibold">AES-256 Encryption</h3>
                  <p className="text-sm text-muted-foreground">All personal and financial data encrypted</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-primary/20">
              <div className="flex items-center mb-4">
                <Shield className="w-8 h-8 text-accent mr-3" />
                <div className="text-left">
                  <h3 className="font-semibold">Tokenized Bank API</h3>
                  <p className="text-sm text-muted-foreground">Secure connections without storing credentials</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-primary/20">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-8 h-8 text-success mr-3" />
                <div className="text-left">
                  <h3 className="font-semibold">Full Anonymization</h3>
                  <p className="text-sm text-muted-foreground">User-controlled data access and privacy</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-primary/20">
              <div className="flex items-center mb-4">
                <Award className="w-8 h-8 text-warning mr-3" />
                <div className="text-left">
                  <h3 className="font-semibold">GDPR & CCPA Compliant</h3>
                  <p className="text-sm text-muted-foreground">Meets global privacy standards</p>
                </div>
              </div>
            </Card>
          </div>

          <Button size="lg" variant="outline" className="mt-8">
            Learn More About Security
          </Button>
        </div>
      </section>

      {/* Social Proof */}
      

      {/* Final CTA */}
      <section className="py-20 px-4 lg:px-6 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start stacking your future today
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands building wealth together, safely and securely
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" variant="secondary" onClick={handleGetStarted} className="text-lg px-8 py-6">
              Sign Up Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-primary" onClick={() => navigate('/sponsor-auth')}>
              <Heart className="mr-2 h-5 w-5" />
              Become a Sponsor
            </Button>
          </div>

          <div className="flex justify-center items-center space-x-4 text-sm opacity-75">
            <span>Free to start</span>
            <span>•</span>
            <span>No credit card required</span>
            <span>•</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 lg:px-6 bg-background border-t">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Livin Salti
                </span>
              </div>
              <p className="text-muted-foreground">
                Save n Stack — Building wealth together, safely and securely.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <Instagram className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                <Youtube className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Livin Salti. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>;
}