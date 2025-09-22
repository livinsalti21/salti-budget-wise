import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target,
  TrendingUp,
  Calendar,
  PiggyBank,
  Zap,
  Trophy,
  Calculator
} from 'lucide-react';

interface GoalsOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

const steps = [
  {
    icon: <Target className="w-8 h-8 text-primary" />,
    title: "Welcome to Smart Goals",
    description: "Turn dreams into achievable financial targets",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Your goals page shows how your daily saves add up to life-changing amounts over time.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <Calendar className="w-5 h-5 text-primary mb-2" />
            <p className="text-sm font-medium">Weekly Targets</p>
            <p className="text-xs text-muted-foreground">Track progress</p>
          </div>
          <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
            <TrendingUp className="w-5 h-5 text-accent mb-2" />
            <p className="text-sm font-medium">Future Wealth</p>
            <p className="text-xs text-muted-foreground">See projections</p>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: <Calendar className="w-8 h-8 text-info" />,
    title: "Weekly Goal Progress",
    description: "Your saving habits build momentum",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-info mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Track your weekly savings target with a visual progress bar.
          </p>
        </div>
        <div className="p-4 bg-info/10 rounded-lg border border-info/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">This Week's Goal</span>
            <span className="text-sm font-bold text-info">$25.00</span>
          </div>
          <Progress value={60} className="mb-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$15.00 saved</span>
            <span>$10.00 to go</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-success/10 rounded border border-success/20">
            <p className="text-lg font-bold text-success">4</p>
            <p className="text-xs text-muted-foreground">Days Saved</p>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded border border-warning/20">
            <p className="text-lg font-bold text-warning">3</p>
            <p className="text-xs text-muted-foreground">Days Left</p>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-success" />,
    title: "Future Projections",
    description: "See where your saves lead over time",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 text-success mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Watch your savings grow with compound interest projections.
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
            <div>
              <p className="text-sm font-medium">1 Year</p>
              <p className="text-xs text-muted-foreground">At current rate</p>
            </div>
            <p className="text-lg font-bold text-success">$1,340</p>
          </div>
          <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div>
              <p className="text-sm font-medium">10 Years</p>
              <p className="text-xs text-muted-foreground">With 7% growth</p>
            </div>
            <p className="text-lg font-bold text-primary">$18,750</p>
          </div>
          <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-accent/20">
            <div>
              <p className="text-sm font-medium">30 Years</p>
              <p className="text-xs text-muted-foreground">Long-term wealth</p>
            </div>
            <p className="text-lg font-bold text-accent">$85,600</p>
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          📈 These assume consistent saving + investment growth
        </p>
      </div>
    )
  },
  {
    icon: <PiggyBank className="w-8 h-8 text-warning" />,
    title: "Your Savings Stats",
    description: "Understanding your financial journey",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <PiggyBank className="w-12 h-12 text-warning mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Track key metrics that show your financial health and progress.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium">Total Saved</span>
            </div>
            <span className="text-sm font-bold text-warning">$150.00</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-info/10 rounded-lg border border-info/20">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-info" />
              <span className="text-sm font-medium">Weekly Average</span>
            </div>
            <span className="text-sm font-bold text-info">$12.50</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-accent/20">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Weekly Goal</span>
            </div>
            <span className="text-sm font-bold text-accent">$25.00</span>
          </div>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg border">
          <p className="text-xs text-center text-muted-foreground">
            💡 <strong>Tip:</strong> You're halfway to your weekly goal! Keep it up.
          </p>
        </div>
      </div>
    )
  },
  {
    icon: <Calculator className="w-8 h-8 text-primary" />,
    title: "Setting Realistic Goals",
    description: "Smart goal-setting strategies",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Calculator className="w-12 h-12 text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Learn how to set achievable weekly savings goals that build long-term wealth.
          </p>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-success/10 rounded-lg border-l-4 border-success">
            <p className="text-sm font-medium mb-1">Start Small</p>
            <p className="text-xs text-muted-foreground">
              Begin with $5-10/week. Consistency beats large amounts.
            </p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg border-l-4 border-primary">
            <p className="text-sm font-medium mb-1">Use the 1% Rule</p>
            <p className="text-xs text-muted-foreground">
              Save 1% of your income, then gradually increase each month.
            </p>
          </div>
          <div className="p-3 bg-warning/10 rounded-lg border-l-4 border-warning">
            <p className="text-sm font-medium mb-1">Automate Success</p>
            <p className="text-xs text-muted-foreground">
              Set up automatic transfers to remove willpower from the equation.
            </p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            🎯 The best goal is one you can hit consistently
          </p>
        </div>
      </div>
    )
  },
  {
    icon: <Trophy className="w-8 h-8 text-accent" />,
    title: "Celebrate Your Progress",
    description: "Every save is a victory worth acknowledging",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-accent mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Your goals page celebrates every milestone on your financial journey.
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium">Weekly Goal Hit</p>
              <p className="text-xs text-muted-foreground">🎉 Streak building momentum!</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <PiggyBank className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">$100 Milestone</p>
              <p className="text-xs text-muted-foreground">🚀 First hundred saved!</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
              <Trophy className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium">30-Day Streak</p>
              <p className="text-xs text-muted-foreground">🔥 Habit officially formed!</p>
            </div>
          </div>
        </div>
        <div className="p-3 bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg border border-accent/20">
          <p className="text-xs text-center font-medium text-accent">
            ✨ Every small save today builds tomorrow's freedom
          </p>
        </div>
      </div>
    )
  }
];

export default function GoalsOnboarding({ onComplete, onSkip }: GoalsOnboardingProps) {
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
              {currentStep === steps.length - 1 ? 'Set My Goals!' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}