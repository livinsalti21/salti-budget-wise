import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MobileSafeArea } from '@/components/ui/mobile-safe-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { track } from '@/analytics/analytics';
import { CheckCircle, TrendingUp, Users, Shield, ArrowRight, Sparkles } from 'lucide-react';

const InteractiveLanding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [step, setStep] = useState(1);
  const [dailyAmount, setDailyAmount] = useState(5);
  const [cadence, setCadence] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly'>('daily');
  const [animatedValue, setAnimatedValue] = useState(0);

  // Redirect authenticated users to main app
  useEffect(() => {
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

  const calculateFutureValue = (dailyAmount: number, years: number) => {
    const annualRate = 0.08; // 8% annual return
    const dailyRate = annualRate / 365;
    const totalDays = years * 365;
    
    return dailyAmount * (((1 + dailyRate) ** totalDays - 1) / dailyRate);
  };

  const getCadenceMultiplier = () => {
    switch (cadence) {
      case 'weekly': return 7;
      case 'biweekly': return 14;
      case 'monthly': return 30;
      default: return 1;
    }
  };

  const getAdjustedDailyAmount = () => {
    return cadence === 'daily' ? dailyAmount : dailyAmount / getCadenceMultiplier();
  };

  useEffect(() => {
    const target = Math.round(calculateFutureValue(getAdjustedDailyAmount(), 10));
    const duration = 1000;
    const increment = target / (duration / 50);
    
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setAnimatedValue(target);
        clearInterval(timer);
      } else {
        setAnimatedValue(Math.round(current));
      }
    }, 50);

    return () => clearInterval(timer);
  }, [dailyAmount, cadence]);

  const handleGetStarted = () => {
    track('interactive_landing_cta_clicked', { step, daily_amount: dailyAmount, cadence });
    navigate('/auth');
  };

  const nextStep = () => {
    track('interactive_landing_step_completed', { step, daily_amount: dailyAmount, cadence });
    setStep(step + 1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (user) return null;

  const content = (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Livin Salti</span>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Shield className="h-3 w-3" />
            Bank-grade security
          </Badge>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={(step / 3) * 100} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>Set Your Goal</span>
            <span>See Your Future</span>
            <span>Get Started</span>
          </div>
        </div>

        {/* Step 1: Goal Setting with Live Projections */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                Turn Small Saves Into Life-Changing Money
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See what happens when you save consistently. Set your goal and watch your future unfold.
              </p>
            </div>

            <Card className="max-w-2xl mx-auto border-2 border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Your Savings Goal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">How much do you want to save?</label>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-primary">$</span>
                      <Input
                        type="number"
                        value={dailyAmount}
                        onChange={(e) => setDailyAmount(Number(e.target.value))}
                        className="text-2xl font-bold text-center border-2 focus:border-primary"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">How often?</label>
                    <Select value={cadence} onValueChange={(value: any) => setCadence(value)}>
                      <SelectTrigger className="border-2 focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Every day</SelectItem>
                        <SelectItem value="weekly">Every week</SelectItem>
                        <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                        <SelectItem value="monthly">Every month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Live Projections */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Your Future Wealth</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-muted-foreground">1 Year</div>
                      <div className="text-lg font-bold text-primary">
                        {formatCurrency(calculateFutureValue(getAdjustedDailyAmount(), 1))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">5 Years</div>
                      <div className="text-lg font-bold text-primary">
                        {formatCurrency(calculateFutureValue(getAdjustedDailyAmount(), 5))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">10 Years</div>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(animatedValue)}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    *Assuming 8% annual growth through consistent investing
                  </p>
                </div>

                <Button onClick={nextStep} size="lg" className="w-full">
                  Show Me How This Works
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: How It Works */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">
                Here's How We'll Help You Reach 
                <span className="text-primary"> {formatCurrency(animatedValue)}</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Three simple habits that compound into life-changing wealth
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card className="text-center border-primary/20">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Save n Stack</h3>
                  <p className="text-muted-foreground">
                    Save your goal amount consistently. We'll track your streaks and help you build the habit.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-primary/20">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Match Your Save</h3>
                  <p className="text-muted-foreground">
                    Find accountability partners who save alongside you. Motivation through community.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-primary/20">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">See Your Future</h3>
                  <p className="text-muted-foreground">
                    Watch your wealth grow with real-time projections and celebrate every milestone.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  256-bit encryption
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  No account required to start
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Join 10,000+ savers
                </div>
              </div>

              <Button onClick={nextStep} size="lg" className="px-8">
                I'm Ready to Start Saving
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Get Started */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Build Your 
                <span className="text-primary"> {formatCurrency(animatedValue)}</span> Future?
              </h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of people who've already started their journey to financial freedom.
              </p>
            </div>

            <Card className="border-2 border-primary/20 shadow-lg">
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <span className="font-medium">Your Goal</span>
                    <span className="font-bold text-primary">
                      ${dailyAmount} {cadence.replace('biweekly', 'bi-weekly')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <span className="font-medium">10-Year Projection</span>
                    <span className="font-bold text-primary">{formatCurrency(animatedValue)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button onClick={handleGetStarted} size="lg" className="w-full text-lg py-6">
                    Start Saving Free Today
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    No credit card required • Get started in under 60 seconds
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => navigate('/sponsor/auth')}
                className="px-6"
              >
                I'm interested in sponsoring savers
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return isMobile ? <MobileSafeArea>{content}</MobileSafeArea> : content;
};

export default InteractiveLanding;