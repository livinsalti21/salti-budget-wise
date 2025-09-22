import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Upload, 
  Store, 
  Edit3, 
  PiggyBank,
  Calculator,
  TrendingUp,
  Target,
  DollarSign,
  Lightbulb
} from 'lucide-react';

interface BudgetOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

const steps = [
  {
    icon: <Calculator className="w-8 h-8 text-primary" />,
    title: "Welcome to Smart Budgeting",
    description: "Create budgets that actually work for your lifestyle",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calculator className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            Turn your spending into a strategic savings plan. Our budget system helps you:
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-success/10 rounded-lg border border-success/20">
            <Target className="w-5 h-5 text-success mb-2" />
            <p className="text-sm font-medium">Track Goals</p>
            <p className="text-xs text-muted-foreground">Set & achieve targets</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <PiggyBank className="w-5 h-5 text-primary mb-2" />
            <p className="text-sm font-medium">Auto-Save</p>
            <p className="text-xs text-muted-foreground">Stack money weekly</p>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: <Brain className="w-8 h-8 text-primary" />,
    title: "AI Budget Assistant",
    description: "Get personalized budget recommendations",
    content: (
      <div className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
          <div className="flex items-center gap-3 mb-3">
            <Brain className="w-6 h-6 text-primary" />
            <div>
              <p className="font-medium text-sm">AI-Powered Analysis</p>
              <p className="text-xs text-muted-foreground">Smart recommendations</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>Analyzes your income & expenses</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Suggests optimal saving rates</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>Identifies spending patterns</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-center text-muted-foreground">
          💡 Just tell the AI about your financial situation and get instant budget recommendations
        </p>
      </div>
    )
  },
  {
    icon: <Upload className="w-8 h-8 text-info" />,
    title: "Upload & Analyze",
    description: "Import your existing financial data",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Upload className="w-12 h-12 text-info mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Already have a budget? Upload it and we'll analyze it for you.
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2 bg-info/10 rounded border border-info/20">
            <Badge variant="secondary" className="text-xs">CSV</Badge>
            <span className="text-sm">Bank statements & spending data</span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-info/10 rounded border border-info/20">
            <Badge variant="secondary" className="text-xs">PDF</Badge>
            <span className="text-sm">Budget documents</span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-info/10 rounded border border-info/20">
            <Badge variant="secondary" className="text-xs">TXT</Badge>
            <span className="text-sm">Simple budget lists</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            🚀 Get instant insights and optimization suggestions
          </p>
        </div>
      </div>
    )
  },
  {
    icon: <Store className="w-8 h-8 text-warning" />,
    title: "Template Store",
    description: "Start with proven budget templates",
    content: (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <Store className="w-12 h-12 text-warning mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Choose from professionally designed budget templates for every lifestyle.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-sm">Student Budget</p>
              <Badge variant="secondary" className="text-xs">$3.99</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Perfect for college students and young professionals</p>
          </div>
          <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-sm">Family Budget</p>
              <Badge variant="secondary" className="text-xs">$4.99</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Comprehensive family financial planning</p>
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          ⭐ All templates include savings optimization and goal tracking
        </p>
      </div>
    )
  },
  {
    icon: <Edit3 className="w-8 h-8 text-accent" />,
    title: "Manual Creation",
    description: "Build your budget from scratch",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Edit3 className="w-12 h-12 text-accent mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Prefer full control? Create your budget step-by-step with our guided form.
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-accent">1</span>
            </div>
            <span className="text-sm">Add income sources</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-accent">2</span>
            </div>
            <span className="text-sm">List fixed expenses</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-accent">3</span>
            </div>
            <span className="text-sm">Set savings goals</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-accent">4</span>
            </div>
            <span className="text-sm">Optimize spending categories</span>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-success" />,
    title: "Budget Dashboard",
    description: "Track progress and optimize over time",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 text-success mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Once created, your budget comes alive with real-time tracking and insights.
          </p>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span className="text-sm font-medium">Spending Alerts</span>
            </div>
            <p className="text-xs text-muted-foreground">Get notified before overspending</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-sm font-medium">Auto-Stacking</span>
            </div>
            <p className="text-xs text-muted-foreground">Surplus automatically saves</p>
          </div>
          <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              <span className="text-sm font-medium">Smart Tips</span>
            </div>
            <p className="text-xs text-muted-foreground">Personalized optimization advice</p>
          </div>
        </div>
      </div>
    )
  }
];

export default function BudgetOnboarding({ onComplete, onSkip }: BudgetOnboardingProps) {
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
              {currentStep === steps.length - 1 ? 'Get Started!' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}