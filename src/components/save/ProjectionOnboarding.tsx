import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  ChevronLeft,
  ChevronRight,
  Calculator,
  TrendingUp,
  Target,
  DollarSign,
  Info,
  PiggyBank,
  BarChart3,
  Zap,
  X
} from 'lucide-react';

interface ProjectionOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

const steps = [
  {
    title: "Growth Projections",
    description: "Plan your financial future with smart calculations",
    icon: Calculator,
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-3">
            This Growth tab helps you:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center">📈</Badge>
              Visualize your wealth growth over time
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center">🎯</Badge>
              Set realistic investment expectations
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center">💡</Badge>
              Get personalized investment recommendations
            </li>
          </ul>
        </div>
      </div>
    )
  },
  {
    title: "Expected Returns",
    description: "Understanding realistic investment expectations",
    icon: TrendingUp,
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <Card className="p-3 bg-red-50 border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="destructive" className="text-xs">High Risk</Badge>
              <span className="font-medium text-sm">12%+ Returns</span>
            </div>
            <p className="text-xs text-muted-foreground">Growth stocks, crypto - high volatility</p>
          </Card>
          <Card className="p-3 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">Moderate</Badge>
              <span className="font-medium text-sm">7-10% Returns</span>
            </div>
            <p className="text-xs text-muted-foreground">S&P 500, balanced funds - historical average</p>
          </Card>
          <Card className="p-3 bg-green-50 border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs">Conservative</Badge>
              <span className="font-medium text-sm">3-6% Returns</span>
            </div>
            <p className="text-xs text-muted-foreground">Bonds, CDs - lower risk, steady growth</p>
          </Card>
        </div>
        <p className="text-sm text-muted-foreground">
          We recommend starting conservative and adjusting as you learn more about investing.
        </p>
      </div>
    )
  },
  {
    title: "Monthly Contributions",
    description: "The power of consistent investing",
    icon: Target,
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-success/10 to-accent/10 p-4 rounded-lg">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Adding just $100/month</p>
            <div className="text-2xl font-bold text-success">$312,889</div>
            <p className="text-xs text-muted-foreground">after 20 years at 8% return</p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Interactive Example:</p>
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Monthly Investment</span>
              <span className="font-medium">$200</span>
            </div>
            <Slider
              value={[200]}
              max={1000}
              min={50}
              step={25}
              className="mb-2"
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Try adjusting this in the real settings to see how it affects your projections!
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Compound Growth Magic",
    description: "How time multiplies your money",
    icon: Zap,
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3 text-center">
            <PiggyBank className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-lg font-bold">$50,000</div>
            <p className="text-xs text-muted-foreground">Your contributions</p>
          </Card>
          <Card className="p-3 text-center">
            <BarChart3 className="h-6 w-6 mx-auto mb-2 text-success" />
            <div className="text-lg font-bold text-success">$175,000</div>
            <p className="text-xs text-muted-foreground">Market growth</p>
          </Card>
        </div>
        <div className="bg-gradient-to-r from-primary/10 to-success/10 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-success mb-1">$225,000</div>
          <p className="text-sm text-muted-foreground">Total after 20 years</p>
        </div>
        <p className="text-sm text-muted-foreground">
          <strong>The key insight:</strong> The market does most of the work for you over time. 
          Your job is just to stay consistent!
        </p>
      </div>
    )
  },
  {
    title: "Investment Recommendations",
    description: "Get personalized suggestions based on your settings",
    icon: Info,
    content: (
      <div className="space-y-4">
        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-primary" />
            <span className="font-medium text-primary">Recommendation</span>
          </div>
          <p className="text-sm mb-2">
            <strong>Target-Date Fund (Moderate Risk)</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Based on your 8% expected return, consider a target-date fund that automatically 
            adjusts risk as you age. Start with 80% stocks, 20% bonds.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">The system recommends based on:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Your expected return rate</li>
            <li>• Time horizon for investing</li>
            <li>• Current savings behavior</li>
            <li>• Risk tolerance indicators</li>
          </ul>
        </div>
        <div className="bg-accent/10 p-3 rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Remember:</strong> These are educational projections. Always consult with a financial advisor for personalized advice.
          </p>
        </div>
      </div>
    )
  }
];

export default function ProjectionOnboarding({ onComplete, onSkip }: ProjectionOnboardingProps) {
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
      <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5">
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
            <div className="p-2 rounded-lg bg-accent/10">
              <Icon className="h-6 w-6 text-accent" />
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
                  index <= currentStep ? 'bg-accent' : 'bg-muted'
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
              {currentStep === steps.length - 1 ? 'Start Exploring' : 'Next'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}