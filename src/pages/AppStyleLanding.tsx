import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  PiggyBank, Target, TrendingUp, Users, Calendar, Crown, 
  Coffee, Shield, Lock, CheckCircle, Award, Heart, 
  ArrowRight, Flame, ChevronRight, RefreshCw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileSafeArea } from "@/components/ui/mobile-safe-area";
import { TouchTarget } from "@/components/ui/mobile-helpers";

export default function AppStyleLanding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [dailySave, setDailySave] = useState([5]);
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimatedValue(prev => prev + Math.random() * 50);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const calculateFutureValue = (dailyAmount: number, years: number) => {
    const annualRate = 0.07;
    const dailyRate = annualRate / 365;
    const days = years * 365;
    return dailyAmount * (((1 + dailyRate) ** days - 1) / dailyRate);
  };

  const handleGetStarted = () => {
    if (user) {
      navigate("/app");
    } else {
      navigate("/auth");
    }
  };

  const formatCurrency = (cents: number) => (cents / 100).toFixed(2);

  // Demo data mimicking real app state
  const demoData = {
    totalSaved: Math.round(2547 + animatedValue) * 100,
    weeklyBalance: 1750, // $17.50
    savingsThisWeek: 1250, // $12.50
    savingStreak: 7,
    projectedNetWorth35Years: Math.round(calculateFutureValue(5, 35) + animatedValue * 100) * 100,
    friendsCount: Math.floor(animatedValue / 100) + 12
  };

  if (isMobile) {
    return (
      <MobileSafeArea className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        {/* App-style Header */}
        <div className="mobile-container py-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-sm">
              ✌🏽
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Livin Salti
              </h1>
              <p className="text-xs text-muted-foreground">Preview Mode</p>
            </div>
          </div>
          
          <TouchTarget asChild>
            <Button 
              size="sm" 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-primary to-accent text-white"
            >
              {user ? "Dashboard" : "Start Free"}
            </Button>
          </TouchTarget>
        </div>

        <div className="mobile-container space-y-4 pb-8">
          {/* 35-Year Projection Header - Just like the app */}
          <Card className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border-primary/30">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Crown className="h-5 w-5 text-primary" />
                <h2 className="text-sm font-semibold text-primary">Your Future Wealth</h2>
                <ChevronRight className="h-4 w-4 text-primary/60" />
              </div>
              <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ${Math.round(demoData.projectedNetWorth35Years / 100).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Your savings in 35 years at 7% growth
              </p>
            </CardContent>
          </Card>

          {/* Streak Display - If you started today */}
          <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Flame className="h-8 w-8 text-orange-500 animate-pulse" />
                <div>
                  <p className="text-3xl font-bold text-orange-500">{demoData.savingStreak}</p>
                  <p className="text-sm font-semibold text-orange-600">Day Streak!</p>
                </div>
                <Flame className="h-8 w-8 text-orange-500 animate-pulse" />
              </div>
              <p className="text-xs text-orange-700">This could be you in just one week! 🚀</p>
            </CardContent>
          </Card>

          {/* Hero Stats - 2x2 Grid exactly like the app */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 min-h-touch">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <PiggyBank className="h-5 w-5 text-primary" />
                    <ChevronRight className="h-3 w-3 text-primary/60" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">Total Saved</p>
                  <p className="text-lg font-bold text-primary">
                    ${formatCurrency(demoData.totalSaved)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20 min-h-touch">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <TrendingUp className="h-5 w-5 text-success" />
                    <ChevronRight className="h-3 w-3 text-success/60" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">Weekly Balance</p>
                  <p className="text-lg font-bold text-success">
                    ${formatCurrency(demoData.weeklyBalance)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 min-h-touch">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Calendar className="h-5 w-5 text-accent" />
                    <ChevronRight className="h-3 w-3 text-accent/60" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">This Week</p>
                  <p className="text-lg font-bold text-accent">
                    ${formatCurrency(demoData.savingsThisWeek)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20 min-h-touch">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Users className="h-5 w-5 text-warning" />
                    <ChevronRight className="h-3 w-3 text-warning/60" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">Friends</p>
                  <p className="text-lg font-bold text-warning">
                    {demoData.friendsCount}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Save Section - Just like the app */}
          <Card className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-orange-500/30 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5 text-orange-600" />
                  <h3 className="text-base font-bold text-orange-700 dark:text-orange-300">Quick Save</h3>
                </div>
                <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                  Try it now →
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {[500, 1000, 2000].map((cents) => (
                  <TouchTarget key={cents}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGetStarted}
                      className="w-full min-h-touch bg-orange-50/50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 hover:bg-orange-100/80 dark:hover:bg-orange-900/40 text-orange-700 dark:text-orange-300 font-semibold transition-all active:scale-95 hover:shadow-sm"
                    >
                      ${(cents / 100).toFixed(0)}
                    </Button>
                  </TouchTarget>
                ))}
              </div>
              
              <p className="text-xs text-orange-600/80 dark:text-orange-400/80 text-center mt-2">
                💡 Start saving in seconds
              </p>
            </CardContent>
          </Card>

          {/* Interactive Projection Tool */}
          <Card className="p-6 bg-gradient-to-br from-secondary/20 to-background">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-center">
                See Your <span className="text-primary">Impact</span>
              </CardTitle>
              <p className="text-center text-muted-foreground text-sm">Adjust to see your potential</p>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
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
                  {user ? "Go to Dashboard" : "Start Building Wealth"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </TouchTarget>
            </CardContent>
          </Card>

          {/* How It Works - App Style Cards */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center">How It Works</h2>
            
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto mb-3">
                  <Coffee className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Save n Stack</h3>
                <p className="text-sm text-muted-foreground">
                  Skip that coffee, celebrate the save, build your future
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent-light rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Match Your Save</h3>
                <p className="text-sm text-muted-foreground">
                  Friends match your saves, multiplying your impact
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-success to-success-light rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">See Your Future</h3>
                <p className="text-sm text-muted-foreground">
                  Watch today's decisions become tomorrow's freedom
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Security - Compact Grid */}
          <div className="space-y-4">
            <div className="text-center">
              <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
              <h2 className="text-lg font-bold">Bank-Grade Security</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3 border-primary/20">
                <div className="text-center">
                  <Lock className="w-6 h-6 text-primary mx-auto mb-1" />
                  <div className="text-sm font-semibold">AES-256</div>
                  <div className="text-xs text-muted-foreground">Encrypted</div>
                </div>
              </Card>
              
              <Card className="p-3 border-accent/20">
                <div className="text-center">
                  <CheckCircle className="w-6 h-6 text-accent mx-auto mb-1" />
                  <div className="text-sm font-semibold">Anonymous</div>
                  <div className="text-xs text-muted-foreground">Privacy First</div>
                </div>
              </Card>
            </div>
          </div>

          {/* Final CTA */}
          <div className="space-y-4 py-6">
            <TouchTarget>
              <Button 
                size="lg" 
                onClick={handleGetStarted} 
                className="w-full text-lg py-6 bg-gradient-to-r from-primary to-accent shadow-lg"
              >
                {user ? "Go to Dashboard" : "Start Free Today"}
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

            <div className="flex justify-center items-center space-x-2 text-sm text-muted-foreground">
              <span>Free forever</span>
              <span>•</span>
              <span>No credit card</span>
              <span>•</span>
              <span>Start in 30 seconds</span>
            </div>
          </div>
        </div>
      </MobileSafeArea>
    );
  }

  // Desktop version - similar app-like layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* App-style Header */}
      <header className="px-6 h-16 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-sm">
            ✌🏽
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Livin Salti
            </h1>
            <p className="text-xs text-muted-foreground">Preview Mode</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Bank-Grade Security
          </Badge>
          <Button onClick={handleGetStarted} size="lg">
            {user ? "Go to Dashboard" : "Start Free"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-6xl space-y-8">
        {/* Main Dashboard Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* 35-Year Projection Header */}
            <Card className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border-primary/30">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown className="h-6 w-6 text-primary" />
                  <h2 className="text-lg font-semibold text-primary">Your Future Wealth</h2>
                </div>
                <p className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  ${Math.round(demoData.projectedNetWorth35Years / 100).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Your potential savings in 35 years at 7% growth
                </p>
              </CardContent>
            </Card>

            {/* Hero Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-4 text-center">
                  <PiggyBank className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground font-medium">Total Saved</p>
                  <p className="text-xl font-bold text-primary">
                    ${formatCurrency(demoData.totalSaved)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground font-medium">Weekly Balance</p>
                  <p className="text-xl font-bold text-success">
                    ${formatCurrency(demoData.weeklyBalance)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                <CardContent className="p-4 text-center">
                  <Calendar className="h-8 w-8 text-accent mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground font-medium">This Week</p>
                  <p className="text-xl font-bold text-accent">
                    ${formatCurrency(demoData.savingsThisWeek)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 text-warning mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground font-medium">Friends</p>
                  <p className="text-xl font-bold text-warning">
                    {demoData.friendsCount}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Interactive Projection */}
            <Card className="p-6">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-center text-2xl">
                  Your <span className="text-primary">Impact Projection</span>
                </CardTitle>
                <p className="text-center text-muted-foreground">
                  See how daily saves create long-term wealth
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="mb-6">
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

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  {[1, 5, 10, 20, 30].map(years => (
                    <div key={years} className="text-center p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border">
                      <div className="text-lg font-bold text-primary">
                        ${calculateFutureValue(dailySave[0], years).toLocaleString('en-US', {
                          maximumFractionDigits: 0
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {years} year{years > 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <Button size="lg" className="mr-4" onClick={handleGetStarted}>
                    {user ? "Go to Dashboard" : "Start Building Wealth"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - How It Works & Security */}
          <div className="space-y-6">
            {/* Streak Display */}
            <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Flame className="h-8 w-8 text-orange-500 animate-pulse" />
                  <div>
                    <p className="text-3xl font-bold text-orange-500">{demoData.savingStreak}</p>
                    <p className="text-sm font-semibold text-orange-600">Day Streak!</p>
                  </div>
                  <Flame className="h-8 w-8 text-orange-500 animate-pulse" />
                </div>
                <p className="text-xs text-orange-700">This could be you in just one week! 🚀</p>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center flex-shrink-0">
                    <Coffee className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Save n Stack</h3>
                    <p className="text-sm text-muted-foreground">
                      Skip purchases, celebrate saves, build wealth
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-accent/5 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent-light rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Match Your Save</h3>
                    <p className="text-sm text-muted-foreground">
                      Friends match your saves, multiplying impact
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-success/5 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-success to-success-light rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">See Your Future</h3>
                    <p className="text-sm text-muted-foreground">
                      Visualize how today becomes tomorrow's freedom
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Bank-Grade Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <Lock className="w-6 h-6 text-primary mx-auto mb-1" />
                    <div className="text-sm font-semibold">AES-256</div>
                    <div className="text-xs text-muted-foreground">Encrypted</div>
                  </div>
                  
                  <div className="text-center p-3 bg-accent/5 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-accent mx-auto mb-1" />
                    <div className="text-sm font-semibold">Anonymous</div>
                    <div className="text-xs text-muted-foreground">Privacy First</div>
                  </div>
                  
                  <div className="text-center p-3 bg-success/5 rounded-lg">
                    <Shield className="w-6 h-6 text-success mx-auto mb-1" />
                    <div className="text-sm font-semibold">Tokenized</div>
                    <div className="text-xs text-muted-foreground">Bank API</div>
                  </div>
                  
                  <div className="text-center p-3 bg-warning/5 rounded-lg">
                    <Award className="w-6 h-6 text-warning mx-auto mb-1" />
                    <div className="text-sm font-semibold">GDPR</div>
                    <div className="text-xs text-muted-foreground">Compliant</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Final CTA */}
            <Card className="bg-gradient-to-r from-primary to-accent text-white">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2">Ready to start?</h3>
                <p className="text-white/80 mb-4">Join thousands building wealth together</p>
                
                <div className="space-y-3">
                  <Button 
                    size="lg" 
                    variant="secondary" 
                    onClick={handleGetStarted}
                    className="w-full"
                  >
                    {user ? "Go to Dashboard" : "Start Free Today"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full border-white text-white hover:bg-white hover:text-primary"
                    onClick={() => navigate('/sponsor-auth')}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Become a Sponsor
                  </Button>
                </div>

                <div className="flex justify-center items-center space-x-2 text-sm text-white/70 mt-4">
                  <span>Free forever</span>
                  <span>•</span>
                  <span>No credit card</span>
                  <span>•</span>
                  <span>Start in 30 seconds</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}