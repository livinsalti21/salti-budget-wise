import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Crown,
  Flame,
  PiggyBank,
  TrendingUp,
  Calendar,
  Target,
  Users,
  Zap
} from 'lucide-react';

interface MobileDashboardOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

const steps = [
  {
    icon: <Crown className="w-8 h-8 text-primary" />,
    title: "Welcome to Mobile Livin Salti",
    description: "Your pocket-sized wealth building companion",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Crown className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Your mobile dashboard puts the most important saving tools right at your fingertips.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <Zap className="w-5 h-5 text-primary mb-2" />
            <p className="text-sm font-medium">Quick Saves</p>
            <p className="text-xs text-muted-foreground">Save in seconds</p>
          </div>
          <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
            <TrendingUp className="w-5 h-5 text-accent mb-2" />
            <p className="text-sm font-medium">Live Progress</p>
            <p className="text-xs text-muted-foreground">Real-time updates</p>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: <Crown className="w-8 h-8 text-warning" />,
    title: "Your Future Wealth Card",
    description: "See where your savings are heading",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Crown className="w-12 h-12 text-warning mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            The top card shows your projected wealth in 35 years based on your current saving rate.
          </p>
        </div>
        <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary">Your Future Wealth</span>
            </div>
            <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              $125,000
            </p>
            <p className="text-xs text-muted-foreground">
              Your savings in 35 years at 8% growth
            </p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            💡 Tap this card to explore detailed projections and growth scenarios
          </p>
        </div>
      </div>
    )
  },
  {
    icon: <Flame className="w-8 h-8 text-orange-500" />,
    title: "Streak Tracking",
    description: "Build momentum with daily saving habits",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Flame className="w-12 h-12 text-orange-500 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Your streak card shows how many consecutive days you've saved money.
          </p>
        </div>
        <div className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="w-6 h-6 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-orange-500">7</p>
                <p className="text-sm font-semibold text-orange-600">Day Streak!</p>
              </div>
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
            <p className="text-xs text-orange-700">Keep the momentum going! 🚀</p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Why streaks matter:</p>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">• Build consistent saving habits</p>
            <p className="text-xs text-muted-foreground">• Unlock streak-based rewards</p>
            <p className="text-xs text-muted-foreground">• Motivate friends and sponsors</p>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: <PiggyBank className="w-8 h-8 text-primary" />,
    title: "Your Financial Stats Grid",
    description: "Key metrics at a glance",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <PiggyBank className="w-12 h-12 text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            The 2x2 grid shows your most important financial metrics with quick access to detailed views.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="text-center">
              <PiggyBank className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Total Saved</p>
              <p className="text-sm font-bold text-primary">$150.00</p>
            </div>
          </div>
          <div className="p-3 bg-success/10 rounded-lg border border-success/20">
            <div className="text-center">
              <TrendingUp className="w-4 h-4 text-success mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Weekly Balance</p>
              <p className="text-sm font-bold text-success">$175.00</p>
            </div>
          </div>
          <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
            <div className="text-center">
              <Calendar className="w-4 h-4 text-accent mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">This Week</p>
              <p className="text-sm font-bold text-accent">$12.50</p>
            </div>
          </div>
          <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
            <div className="text-center">
              <Target className="w-4 h-4 text-warning mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">30Y Goal</p>
              <p className="text-xs font-bold text-warning">$95K</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          💡 Tap any card to dive deeper into that metric
        </p>
      </div>
    )
  },
  {
    icon: <Zap className="w-8 h-8 text-orange-600" />,
    title: "Quick Save Section",
    description: "Save money in seconds, not minutes",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Zap className="w-12 h-12 text-orange-600 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            The Quick Save section lets you save money instantly with pre-set amounts or custom values.
          </p>
        </div>
        <div className="p-4 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-lg border border-orange-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-orange-600" />
              <h3 className="text-base font-bold text-orange-700">Quick Save</h3>
            </div>
            <span className="text-sm text-orange-600 font-medium">Custom →</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" className="w-full">$5</Button>
            <Button variant="outline" size="sm" className="w-full">$10</Button>
            <Button variant="outline" size="sm" className="w-full">$20</Button>
          </div>
          <p className="text-xs text-orange-600/80 text-center mt-2">
            💡 Tap to save instantly or customize amount
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Perfect for:</p>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">• Skipped coffee purchases</p>
            <p className="text-xs text-muted-foreground">• Found discounts and deals</p>
            <p className="text-xs text-muted-foreground">• Quick daily habit building</p>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: <Users className="w-8 h-8 text-purple-500" />,
    title: "Friend Streak Leaders",
    description: "Social motivation and friendly competition",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Users className="w-12 h-12 text-purple-500 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            See how your saving streaks compare to your friends and get motivated by their progress.
          </p>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-purple-500" />
            <h3 className="text-sm font-bold text-purple-700">Friend Streak Leaders</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 bg-white/50 rounded-lg">
              <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-yellow-700">#1</span>
              </div>
              <span className="text-sm">Sarah M.</span>
              <div className="flex items-center gap-1 ml-auto">
                <Flame className="w-3 h-3 text-orange-500" />
                <span className="text-sm font-bold text-orange-600">12 days</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-white/50 rounded-lg">
              <div className="w-6 h-6 bg-gray-400/20 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-gray-700">#2</span>
              </div>
              <span className="text-sm">Alex K.</span>
              <div className="flex items-center gap-1 ml-auto">
                <Flame className="w-3 h-3 text-orange-500" />
                <span className="text-sm font-bold text-orange-600">8 days</span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          🏆 Friendly competition makes saving more fun and motivating
        </p>
      </div>
    )
  }
];

export default function MobileDashboardOnboarding({ onComplete, onSkip }: MobileDashboardOnboardingProps) {
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
              {currentStep === steps.length - 1 ? 'Start Saving!' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}