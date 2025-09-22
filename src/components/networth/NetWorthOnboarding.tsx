import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp,
  Calculator,
  PiggyBank,
  Zap,
  Target,
  Crown,
  BarChart3
} from 'lucide-react';

interface NetWorthOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

const steps = [
  {
    icon: <TrendingUp className="w-8 h-8 text-primary" />,
    title: "Welcome to Future Wealth",
    description: "See how your saves become life-changing money",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Crown className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Your Net Worth page shows the incredible power of compound growth over time.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <Calculator className="w-5 h-5 text-primary mb-2" />
            <p className="text-sm font-medium">Smart Math</p>
            <p className="text-xs text-muted-foreground">Compound calculations</p>
          </div>
          <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
            <BarChart3 className="w-5 h-5 text-accent mb-2" />
            <p className="text-sm font-medium">Visual Growth</p>
            <p className="text-xs text-muted-foreground">See your trajectory</p>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: <Zap className="w-8 h-8 text-warning" />,
    title: "The Magic of Compound Growth",
    description: "Why small saves become big wealth",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Zap className="w-12 h-12 text-warning mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Compound growth means your money earns money, which then earns more money.
          </p>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-success/10 rounded-lg border border-success/20">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Year 1</span>
              <span className="text-sm font-bold text-success">$1,300</span>
            </div>
            <p className="text-xs text-muted-foreground">Your saves: $1,300 + growth: $0</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Year 10</span>
              <span className="text-sm font-bold text-primary">$18,750</span>
            </div>
            <p className="text-xs text-muted-foreground">Your saves: $13,000 + growth: $5,750</p>
          </div>
          <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Year 30</span>
              <span className="text-sm font-bold text-accent">$125,000</span>
            </div>
            <p className="text-xs text-muted-foreground">Your saves: $39,000 + growth: $86,000</p>
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          🚀 Time + consistency = exponential wealth growth
        </p>
      </div>
    )
  },
  {
    icon: <Calculator className="w-8 h-8 text-info" />,
    title: "Understanding the Math",
    description: "How we calculate your future wealth",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Calculator className="w-12 h-12 text-info mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Our projections use your current savings rate and realistic investment returns.
          </p>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-info/10 rounded-lg border-l-4 border-info">
            <p className="text-sm font-medium mb-1">Your Current Rate</p>
            <p className="text-xs text-muted-foreground">
              Based on your actual saving history ($25/week average)
            </p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg border-l-4 border-primary">
            <p className="text-sm font-medium mb-1">Investment Growth</p>
            <p className="text-xs text-muted-foreground">
              8% annual return (historical stock market average)
            </p>
          </div>
          <div className="p-3 bg-warning/10 rounded-lg border-l-4 border-warning">
            <p className="text-sm font-medium mb-1">Conservative Estimates</p>
            <p className="text-xs text-muted-foreground">
              We factor in inflation and market volatility
            </p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            📊 All projections are estimates based on historical data
          </p>
        </div>
      </div>
    )
  },
  {
    icon: <Target className="w-8 h-8 text-success" />,
    title: "Different Growth Scenarios",
    description: "Conservative vs aggressive investment strategies",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Target className="w-12 h-12 text-success mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Your risk tolerance affects your potential returns. Here's how different strategies compare:
          </p>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-muted/30 rounded-lg border">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Conservative (3%)</span>
              <span className="text-sm font-bold">$65,000</span>
            </div>
            <p className="text-xs text-muted-foreground">Bonds, CDs, high-yield savings</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Moderate (7%)</span>
              <span className="text-sm font-bold text-primary">$95,000</span>
            </div>
            <p className="text-xs text-muted-foreground">Mix of stocks and bonds</p>
          </div>
          <div className="p-3 bg-success/10 rounded-lg border border-success/20">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Aggressive (10%)</span>
              <span className="text-sm font-bold text-success">$165,000</span>
            </div>
            <p className="text-xs text-muted-foreground">Mostly stocks, higher volatility</p>
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          🎯 <em>30-year projection with $25/week savings</em>
        </p>
      </div>
    )
  },
  {
    icon: <PiggyBank className="w-8 h-8 text-accent" />,
    title: "Boosting Your Projections",
    description: "Small increases = massive long-term gains",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <PiggyBank className="w-12 h-12 text-accent mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            See how small increases to your weekly saves dramatically impact your future wealth.
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border">
            <div>
              <p className="text-sm font-medium">Current: $25/week</p>
              <p className="text-xs text-muted-foreground">30-year projection</p>
            </div>
            <p className="text-sm font-bold">$95,000</p>
          </div>
          <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div>
              <p className="text-sm font-medium">+$10: $35/week</p>
              <p className="text-xs text-muted-foreground">Just $1.43 more per day</p>
            </div>
            <p className="text-sm font-bold text-primary">$133,000</p>
          </div>
          <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-accent/20">
            <div>
              <p className="text-sm font-medium">+$25: $50/week</p>
              <p className="text-xs text-muted-foreground">Skip 2 coffees per day</p>
            </div>
            <p className="text-sm font-bold text-accent">$190,000</p>
          </div>
        </div>
        <div className="p-3 bg-gradient-to-r from-success/10 to-accent/10 rounded-lg border border-success/20">
          <p className="text-xs text-center font-medium text-success">
            💰 Double your saves = Nearly double your future wealth!
          </p>
        </div>
      </div>
    )
  },
  {
    icon: <Crown className="w-8 h-8 text-warning" />,
    title: "Your Wealth Building Journey",
    description: "Every save today builds tomorrow's freedom",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Crown className="w-12 h-12 text-warning mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Your net worth page transforms abstract future goals into concrete, achievable milestones.
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-success">5Y</span>
            </div>
            <div>
              <p className="text-sm font-medium">Emergency Fund Complete</p>
              <p className="text-xs text-muted-foreground">$10,000+ safety net built</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-primary">15Y</span>
            </div>
            <div>
              <p className="text-sm font-medium">Major Life Goals</p>
              <p className="text-xs text-muted-foreground">House down payment, dream vacation</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-accent">30Y</span>
            </div>
            <div>
              <p className="text-sm font-medium">Financial Independence</p>
              <p className="text-xs text-muted-foreground">Work becomes optional</p>
            </div>
          </div>
        </div>
        <div className="p-3 bg-gradient-to-r from-warning/10 to-primary/10 rounded-lg border border-warning/20">
          <p className="text-xs text-center font-medium text-warning">
            🚀 Start today. Your future self will thank you.
          </p>
        </div>
      </div>
    )
  }
];

export default function NetWorthOnboarding({ onComplete, onSkip }: NetWorthOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg border-2">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="text-xs">
              {currentStep + 1} of {steps.length}
            </Badge>
            <Button variant="ghost" size="sm" onClick={onSkip} className="text-xs">
              Skip
            </Button>
          </div>
          <Progress value={((currentStep + 1) / steps.length) * 100} className="mb-4" />
          <div className="mb-3">
            {currentStepData.icon}
          </div>
          <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
        </CardHeader>
        
        <CardContent className="pb-6">
          <div className="mb-6">
            {currentStepData.content}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={prevStep} 
              disabled={currentStep === 0}
              className="flex-1"
            >
              Previous
            </Button>
            <Button onClick={nextStep} className="flex-1">
              {currentStep === steps.length - 1 ? 'Build My Wealth!' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}