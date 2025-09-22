import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Filter,
  Target,
  Calendar,
  Award,
  Clock,
  PiggyBank,
  X
} from 'lucide-react';

interface SaveHistoryOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

const steps = [
  {
    title: "Welcome to Save History",
    description: "Your complete saving journey at a glance",
    icon: PiggyBank,
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-3">
            This is your financial command center where you can:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center">📊</Badge>
              Track your total savings and progress
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center">🔥</Badge>
              Monitor your saving streaks and consistency
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center">💰</Badge>
              See the future value of every save
            </li>
          </ul>
        </div>
      </div>
    )
  },
  {
    title: "Smart Insights",
    description: "AI-powered patterns from your saving behavior",
    icon: Sparkles,
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-accent/10 to-primary/10 p-4 rounded-lg border border-accent/20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="font-medium text-accent">Smart Insight</span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            "You save 40% more on weekends! Consider setting weekend reminders."
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          As you save more, our AI identifies patterns and suggests ways to optimize your saving habits. 
          The more you save, the smarter the insights become!
        </p>
      </div>
    )
  },
  {
    title: "Powerful Filtering",
    description: "Find and analyze your saves with precision",
    icon: Filter,
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Time Period</span>
            </div>
            <p className="text-xs text-muted-foreground">Filter by week, month, or year</p>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Categories</span>
            </div>
            <p className="text-xs text-muted-foreground">Group by coffee, lunch, etc.</p>
          </Card>
        </div>
        <p className="text-sm text-muted-foreground">
          Use the search bar to find specific saves or filter by time periods to analyze your habits.
        </p>
      </div>
    )
  },
  {
    title: "Future Value Magic",
    description: "See how today's saves become tomorrow's wealth",
    icon: TrendingUp,
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-success/10 to-accent/10 p-4 rounded-lg">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Your $5 coffee save today</p>
            <div className="text-2xl font-bold text-success">$53.21</div>
            <p className="text-xs text-muted-foreground">becomes this in 30 years (8% return)</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Every save shows its projected future value. Watch small saves compound into meaningful wealth over time!
        </p>
      </div>
    )
  },
  {
    title: "Build Your Streak",
    description: "Consistency is the key to wealth building",
    icon: Award,
    content: (
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-6 w-6 text-primary" />
              <span className="text-3xl font-bold text-primary">7</span>
              <span className="text-sm text-muted-foreground">days</span>
            </div>
            <p className="text-sm font-medium">Current Streak</p>
            <p className="text-xs text-muted-foreground">Keep going! Every day counts.</p>
          </div>
        </div>
        <div className="bg-primary/5 p-3 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Pro tip:</strong> Even saving $1 keeps your streak alive and builds the habit!
          </p>
        </div>
      </div>
    )
  }
];

export default function SaveHistoryOnboarding({ onComplete, onSkip }: SaveHistoryOnboardingProps) {
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
  const Icon = currentStepData.icon;

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="absolute right-4 top-4 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
              <CardDescription>{currentStepData.description}</CardDescription>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex gap-2 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStepData.content}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              {currentStep + 1} of {steps.length}
            </span>

            <Button
              onClick={nextStep}
              className="flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}