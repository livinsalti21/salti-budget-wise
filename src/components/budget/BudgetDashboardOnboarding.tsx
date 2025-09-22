import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
  PiggyBank,
  Lightbulb,
  RefreshCw
} from 'lucide-react';

interface BudgetDashboardOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

const steps = [
  {
    icon: <BarChart3 className="w-8 h-8 text-primary" />,
    title: "Welcome to Your Budget Dashboard",
    description: "Your financial command center",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Your budget is now live! This dashboard gives you real-time insights into your financial health.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-success/10 rounded-lg border border-success/20">
            <CheckCircle className="w-5 h-5 text-success mb-2" />
            <p className="text-sm font-medium">Live Tracking</p>
            <p className="text-xs text-muted-foreground">Real-time updates</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <Target className="w-5 h-5 text-primary mb-2" />
            <p className="text-sm font-medium">Smart Alerts</p>
            <p className="text-xs text-muted-foreground">Overspending warnings</p>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: <CheckCircle className="w-8 h-8 text-success" />,
    title: "Budget Status Indicators",
    description: "Understand your financial health at a glance",
    content: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground text-center mb-4">
          Your budget status changes color based on your spending patterns:
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
            <CheckCircle className="w-6 h-6 text-success" />
            <div>
              <p className="text-sm font-medium text-success">Healthy Budget</p>
              <p className="text-xs text-muted-foreground">On track with savings goals</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-warning/10 rounded-lg border border-warning/20">
            <AlertTriangle className="w-6 h-6 text-warning" />
            <div>
              <p className="text-sm font-medium text-warning">Warning Zone</p>
              <p className="text-xs text-muted-foreground">Approaching spending limits</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">Critical Alert</p>
              <p className="text-xs text-muted-foreground">Over budget, action needed</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-info" />,
    title: "Understanding the Tabs",
    description: "Navigate your financial data efficiently",
    content: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground text-center mb-4">
          Your dashboard is organized into focused sections:
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-info/10 rounded-lg border border-info/20">
            <BarChart3 className="w-5 h-5 text-info" />
            <div>
              <p className="text-sm font-medium">Overview</p>
              <p className="text-xs text-muted-foreground">Tips, goals, and quick insights</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
            <TrendingUp className="w-5 h-5 text-success" />
            <div>
              <p className="text-sm font-medium">Income</p>
              <p className="text-xs text-muted-foreground">All your revenue sources</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
            <div className="w-5 h-5 bg-muted-foreground rounded-full"></div>
            <div>
              <p className="text-sm font-medium">Fixed Expenses</p>
              <p className="text-xs text-muted-foreground">Recurring bills and costs</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <Target className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Spending Plan</p>
              <p className="text-xs text-muted-foreground">Variable expense allocations</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: <Lightbulb className="w-8 h-8 text-warning" />,
    title: "Smart Budget Tips",
    description: "Get personalized optimization advice",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Lightbulb className="w-12 h-12 text-warning mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Your dashboard provides actionable tips based on your spending patterns.
          </p>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-warning/10 rounded-lg border-l-4 border-warning">
            <p className="text-sm font-medium mb-1">Example Tip:</p>
            <p className="text-xs text-muted-foreground">
              "You're spending 35% on dining out. Consider reducing to 25% and save an extra $40/week."
            </p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg border-l-4 border-primary">
            <p className="text-sm font-medium mb-1">Savings Opportunity:</p>
            <p className="text-xs text-muted-foreground">
              "Your fixed expenses are low! You can afford to increase your savings rate to 25%."
            </p>
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          💡 Tips update weekly based on your actual spending
        </p>
      </div>
    )
  },
  {
    icon: <PiggyBank className="w-8 h-8 text-accent" />,
    title: "Auto-Save & Stacking",
    description: "Your budget works with your savings goals",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <PiggyBank className="w-12 h-12 text-accent mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Your budget automatically stacks surplus money into your goals.
          </p>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Weekly Surplus</p>
              <p className="text-sm font-bold text-accent">$45</p>
            </div>
            <div className="text-xs text-muted-foreground">
              → Automatically saved to "Emergency Fund"
            </div>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Under-Budget</p>
              <p className="text-sm font-bold text-primary">$23</p>
            </div>
            <div className="text-xs text-muted-foreground">
              → Stacked into "Vacation Fund"
            </div>
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          🚀 Every dollar you don't spend gets put to work for your future!
        </p>
      </div>
    )
  },
  {
    icon: <RefreshCw className="w-8 h-8 text-info" />,
    title: "Keep Your Budget Fresh",
    description: "Regular updates maximize effectiveness",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-info mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Budgets work best when they evolve with your life. Here's how to keep yours optimized:
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-info/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-info">1W</span>
            </div>
            <div>
              <p className="text-sm font-medium">Weekly Check-ins</p>
              <p className="text-xs text-muted-foreground">Review spending vs. plan</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-info/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-info">1M</span>
            </div>
            <div>
              <p className="text-sm font-medium">Monthly Adjustments</p>
              <p className="text-xs text-muted-foreground">Update categories & goals</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-info/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-info">3M</span>
            </div>
            <div>
              <p className="text-sm font-medium">Quarterly Reviews</p>
              <p className="text-xs text-muted-foreground">Major life changes & goals</p>
            </div>
          </div>
        </div>
        <div className="p-3 bg-success/10 rounded-lg border border-success/20">
          <p className="text-xs text-center text-success font-medium">
            🎯 Active budget management leads to 40% better savings rates!
          </p>
        </div>
      </div>
    )
  }
];

export default function BudgetDashboardOnboarding({ onComplete, onSkip }: BudgetDashboardOnboardingProps) {
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
              {currentStep === steps.length - 1 ? 'Start Budgeting!' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}