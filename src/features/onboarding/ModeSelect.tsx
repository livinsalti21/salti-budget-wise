import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PiggyBank, GraduationCap, Banknote, TrendingUp, Brain, Shield, Users, Zap, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ModeSelectProps {
  onModeSelect: (mode: 'standard' | 'educational') => void;
}

export default function ModeSelect({ onModeSelect }: ModeSelectProps) {
  const [selectedMode, setSelectedMode] = useState<'standard' | 'educational' | null>(null);
  const [hoveredMode, setHoveredMode] = useState<'standard' | 'educational' | null>(null);

  const handleContinue = () => {
    if (selectedMode) {
      onModeSelect(selectedMode);
    }
  };

  const canContinue = !!selectedMode;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <PiggyBank className="h-12 w-12 text-primary animate-pulse" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-ping" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Livin Salti
            </h1>
          </div>
          <h2 className="text-3xl font-semibold mb-4 text-foreground">Your Wealth Journey Starts Here</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands who are building wealth through small, daily habits. Every financial success story starts with a single decision.
          </p>
          
          {/* Why This Matters Section */}
          <div className="bg-primary/5 rounded-lg p-6 mb-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-primary">Why Your Starting Mode Matters</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Psychology shows that <strong>starting with confidence</strong> leads to lasting success. Whether you dive in with real money or build confidence first, both paths create millionaires - the key is choosing what feels right for <em>you</em> today.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Real Money Mode */}
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
              selectedMode === 'standard' 
                ? 'ring-2 ring-primary border-primary shadow-lg shadow-primary/20 bg-gradient-to-br from-primary/5 to-primary/10' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => setSelectedMode('standard')}
            onMouseEnter={() => setHoveredMode('standard')}
            onMouseLeave={() => setHoveredMode(null)}
          >
            <CardHeader className="text-center pb-2">
              <div className={`w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 transition-transform ${
                hoveredMode === 'standard' || selectedMode === 'standard' ? 'scale-110' : ''
              }`}>
                <Banknote className="h-10 w-10 text-white" />
                {(hoveredMode === 'standard' || selectedMode === 'standard') && (
                  <div className="absolute animate-ping">
                    <Banknote className="h-10 w-10 text-white opacity-75" />
                  </div>
                )}
              </div>
              <CardTitle className="text-2xl mb-2">Ready for Real Money</CardTitle>
              <CardDescription className="text-base">
                Build actual wealth with real bank accounts and investments
              </CardDescription>
              
              {/* Why This Mode */}
              <div className="bg-primary/10 p-3 rounded-lg mt-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Why Real Money Mode?</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Research shows that <strong>real stakes create real results</strong>. When your actual money is growing, your brain releases dopamine that reinforces good habits faster.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-3 group">
                  <div className="w-3 h-3 bg-primary rounded-full group-hover:scale-125 transition-transform"></div>
                  <span className="text-sm font-medium">Link real bank accounts safely</span>
                  <Shield className="h-3 w-3 text-primary/60 ml-auto" />
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="w-3 h-3 bg-primary rounded-full group-hover:scale-125 transition-transform"></div>
                  <span className="text-sm font-medium">Save and invest real money</span>
                  <Zap className="h-3 w-3 text-accent/60 ml-auto" />
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="w-3 h-3 bg-primary rounded-full group-hover:scale-125 transition-transform"></div>
                  <span className="text-sm font-medium">Match with family & friends</span>
                  <Users className="h-3 w-3 text-success/60 ml-auto" />
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="w-3 h-3 bg-primary rounded-full group-hover:scale-125 transition-transform"></div>
                  <span className="text-sm font-medium">Track actual wealth growth</span>
                  <TrendingUp className="h-3 w-3 text-primary/60 ml-auto" />
                </div>
              </div>
              
              <Badge variant="default" className="w-full justify-center py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold">
                <Star className="h-3 w-3 mr-1" />
                Full Wealth Building Access
              </Badge>
              
              <div className="text-center">
                <p className="text-xs text-success font-medium">🎯 Chosen by 73% of successful savers</p>
              </div>
            </CardContent>
          </Card>

          {/* Educational Mode */}
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
              selectedMode === 'educational' 
                ? 'ring-2 ring-accent border-accent shadow-lg shadow-accent/20 bg-gradient-to-br from-accent/5 to-accent/10' 
                : 'hover:border-accent/50'
            }`}
            onClick={() => setSelectedMode('educational')}
            onMouseEnter={() => setHoveredMode('educational')}
            onMouseLeave={() => setHoveredMode(null)}
          >
            <CardHeader className="text-center pb-2">
              <div className={`w-20 h-20 bg-gradient-to-r from-accent to-success rounded-full flex items-center justify-center mx-auto mb-4 transition-transform ${
                hoveredMode === 'educational' || selectedMode === 'educational' ? 'scale-110' : ''
              }`}>
                <GraduationCap className="h-10 w-10 text-white" />
                {(hoveredMode === 'educational' || selectedMode === 'educational') && (
                  <div className="absolute animate-ping">
                    <GraduationCap className="h-10 w-10 text-white opacity-75" />
                  </div>
                )}
              </div>
              <CardTitle className="text-2xl mb-2">Practice & Learn First</CardTitle>
              <CardDescription className="text-base">
                Build confidence with demo accounts before risking real money
              </CardDescription>
              
              {/* Why This Mode */}
              <div className="bg-accent/10 p-3 rounded-lg mt-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-accent" />
                  <span className="font-semibold text-sm">Why Practice Mode?</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Studies show that <strong>confidence comes from practice</strong>. Master the habits risk-free, then transition to real money when you're ready to win.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-3 group">
                  <div className="w-3 h-3 bg-accent rounded-full group-hover:scale-125 transition-transform"></div>
                  <span className="text-sm font-medium">Demo wallet with virtual money</span>
                  <Shield className="h-3 w-3 text-accent/60 ml-auto" />
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="w-3 h-3 bg-accent rounded-full group-hover:scale-125 transition-transform"></div>
                  <span className="text-sm font-medium">Practice saving & budgeting</span>
                  <Brain className="h-3 w-3 text-success/60 ml-auto" />
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="w-3 h-3 bg-accent rounded-full group-hover:scale-125 transition-transform"></div>
                  <span className="text-sm font-medium">Family encouragement system</span>
                  <Users className="h-3 w-3 text-primary/60 ml-auto" />
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="w-3 h-3 bg-accent rounded-full group-hover:scale-125 transition-transform"></div>
                  <span className="text-sm font-medium">Real compound interest education</span>
                  <TrendingUp className="h-3 w-3 text-accent/60 ml-auto" />
                </div>
              </div>
              
              <Badge variant="outline" className="w-full justify-center py-2 border-accent text-accent font-semibold">
                <GraduationCap className="h-3 w-3 mr-1" />
                Safe Learning Environment
              </Badge>
              
              <div className="text-center">
                <p className="text-xs text-accent font-medium">🎓 Perfect for building confidence first</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Success Stories */}
        <div className="bg-muted/30 rounded-xl p-6 mb-8 max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold mb-4 text-center">Real Results from Real People</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-background/80 p-4 rounded-lg">
              <p className="text-muted-foreground mb-2">"Started with Educational mode for 2 weeks, then switched to Real Money. Now I've saved $2,847 in 6 months!"</p>
              <p className="font-semibold text-accent">- Sarah, Teacher</p>
            </div>
            <div className="bg-background/80 p-4 rounded-lg">
              <p className="text-muted-foreground mb-2">"Jumped straight into Real Money mode. The app helped me save $5,200 for my emergency fund in 8 months."</p>
              <p className="font-semibold text-primary">- Marcus, Engineer</p>
            </div>
          </div>
        </div>

        <div className="text-center space-y-6">
          <Button 
            onClick={handleContinue}
            disabled={!canContinue}
            size="lg"
            className={`min-w-[250px] py-3 text-lg font-semibold transition-all hover:scale-105 ${
              selectedMode === 'standard' 
                ? 'bg-gradient-to-r from-primary to-accent hover:shadow-lg' 
                : selectedMode === 'educational'
                ? 'bg-gradient-to-r from-accent to-success hover:shadow-lg'
                : ''
            }`}
          >
            {selectedMode ? (
              <>
                Start My {selectedMode === 'standard' ? 'Real Money' : 'Learning'} Journey
                <TrendingUp className="ml-2 h-5 w-5" />
              </>
            ) : (
              'Choose Your Path Above'
            )}
          </Button>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <Shield className="inline h-4 w-4 mr-1" />
              You can switch to Real Money mode anytime when you're ready
            </p>
            
            <p className="text-xs text-muted-foreground">
              By continuing you agree to our{' '}
              <a href="/legal/terms" className="text-primary hover:underline font-medium">Terms</a>{' '}
              and{' '}
              <a href="/legal/privacy" className="text-primary hover:underline font-medium">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}