import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart,
  Upload,
  Store,
  Bell,
  Shield,
  Users,
  Zap,
  Target
} from 'lucide-react';

interface DashboardOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

const steps = [
  {
    icon: <Target className="w-8 h-8 text-primary" />,
    title: "Welcome to Your Dashboard",
    description: "Your financial toolkit and community hub",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Your desktop dashboard organizes all your financial tools into focused tabs for easy access.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <Users className="w-5 h-5 text-primary mb-2" />
            <p className="text-sm font-medium">Community</p>
            <p className="text-xs text-muted-foreground">Find sponsors</p>
          </div>
          <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
            <Zap className="w-5 h-5 text-accent mb-2" />
            <p className="text-sm font-medium">Tools</p>
            <p className="text-xs text-muted-foreground">Budget & analyze</p>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: <Heart className="w-8 h-8 text-destructive" />,
    title: "Sponsors Tab",
    description: "Connect with people who want to support your savings",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Heart className="w-12 h-12 text-destructive mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            The Sponsors tab helps you find and connect with community members who will match your saves.
          </p>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-destructive" />
              <p className="text-sm font-medium">Find Sponsors</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Browse available sponsors in your area or interests
            </p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 w-4 text-primary" />
              <p className="text-sm font-medium">Set Up Matches</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Configure matching rules and amounts
            </p>
          </div>
          <div className="p-3 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-success" />
              <p className="text-sm font-medium">Track Progress</p>
            </div>
            <p className="text-xs text-muted-foreground">
              See your matching history and impact
            </p>
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          💝 Sponsors make your saving journey faster and more rewarding
        </p>
      </div>
    )
  },
  {
    icon: <Upload className="w-8 h-8 text-info" />,
    title: "Upload Tab",
    description: "Import your financial data for instant analysis",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Upload className="w-12 h-12 text-info mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            The Upload tab lets you import bank statements, budgets, and other financial documents for AI analysis.
          </p>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-info/10 rounded-lg border border-info/20">
            <div className="flex items-center gap-2 mb-1">
              <Upload className="w-4 h-4 text-info" />
              <p className="text-sm font-medium">Bank Statements</p>
            </div>
            <p className="text-xs text-muted-foreground">
              CSV/PDF files from your bank for spending analysis
            </p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium">Budget Documents</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Existing budgets to optimize and improve
            </p>
          </div>
          <div className="p-3 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-success" />
              <p className="text-sm font-medium">Instant Insights</p>
            </div>
            <p className="text-xs text-muted-foreground">
              AI analyzes and provides optimization recommendations
            </p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            🚀 Upload once, get ongoing insights and budget optimization
          </p>
        </div>
      </div>
    )
  },
  {
    icon: <Store className="w-8 h-8 text-warning" />,
    title: "Templates Tab",
    description: "Professional budget templates for every lifestyle",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Store className="w-12 h-12 text-warning mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Browse and purchase professionally designed budget templates that fit your specific situation.
          </p>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium">Student Budget Pro</p>
              <Badge variant="secondary" className="text-xs">$3.99</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Optimized for college students and entry-level professionals
            </p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium">Family Financial Plan</p>
              <Badge variant="secondary" className="text-xs">$4.99</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Comprehensive budgeting for families with children
            </p>
          </div>
          <div className="p-3 bg-success/10 rounded-lg border border-success/20">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium">Early Retirement Plan</p>
              <Badge variant="secondary" className="text-xs">$7.99</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Aggressive saving strategies for FIRE goals
            </p>
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          ⭐ All templates include goal tracking and optimization algorithms
        </p>
      </div>
    )
  },
  {
    icon: <Bell className="w-8 h-8 text-accent" />,
    title: "Notifications Tab",
    description: "Stay on track with smart reminders",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Bell className="w-12 h-12 text-accent mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Customize how and when you receive notifications to keep your saving habits on track.
          </p>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-4 h-4 text-accent" />
              <p className="text-sm font-medium">Daily Save Reminders</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Gentle nudges to maintain your saving streak
            </p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium">Budget Alerts</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Warnings when approaching spending limits
            </p>
          </div>
          <div className="p-3 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-success" />
              <p className="text-sm font-medium">Match Notifications</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Updates when sponsors match your saves
            </p>
          </div>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg border">
          <p className="text-xs text-center text-muted-foreground">
            ⚙️ <strong>Tip:</strong> Customize frequency and timing to match your lifestyle
          </p>
        </div>
      </div>
    )
  },
  {
    icon: <Shield className="w-8 h-8 text-success" />,
    title: "Security Tab",
    description: "Keep your financial data safe and private",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Shield className="w-12 h-12 text-success mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Monitor and control your account security with comprehensive privacy tools.
          </p>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-success" />
              <p className="text-sm font-medium">Security Dashboard</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Overview of your account security status
            </p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium">Data Controls</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Manage what data is shared and with whom
            </p>
          </div>
          <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-4 h-4 text-warning" />
              <p className="text-sm font-medium">Activity Monitoring</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Track logins and account access
            </p>
          </div>
        </div>
        <div className="p-3 bg-success/5 rounded-lg border border-success/10">
          <p className="text-xs text-center text-success font-medium">
            🔒 Your financial data is encrypted and never shared without permission
          </p>
        </div>
      </div>
    )
  }
];

export default function DashboardOnboarding({ onComplete, onSkip }: DashboardOnboardingProps) {
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
              {currentStep === steps.length - 1 ? 'Explore Dashboard!' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}