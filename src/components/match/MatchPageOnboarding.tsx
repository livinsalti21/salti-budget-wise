import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Heart, 
  Zap, 
  Target, 
  ArrowRight, 
  CheckCircle, 
  UserPlus,
  Gift
} from 'lucide-react';

interface MatchPageOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function MatchPageOnboarding({ onComplete, onSkip }: MatchPageOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Users,
      title: "Two Ways to Match",
      description: "Understanding Friend Matches vs Sponsor Matches",
      visual: (
        <div className="space-y-4 my-6">
          <div className="bg-blue-50/80 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Friend Matches</span>
            </div>
            <p className="text-sm text-blue-800">
              You <strong>both save</strong> to your own accounts. Pure motivation & accountability! 🤝
            </p>
          </div>
          
          <div className="bg-purple-50/80 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-900">Sponsor Matches</span>
            </div>
            <p className="text-sm text-purple-800">
              They <strong>send money</strong> to your account when you save. Financial support! 💰
            </p>
          </div>
        </div>
      )
    },
    {
      icon: Zap,
      title: "Friend Matches in Action",
      description: "See how social saving creates powerful momentum",
      visual: (
        <div className="bg-gradient-to-r from-blue-50/80 to-green-50/80 rounded-lg p-4 my-6 border border-blue-200">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Sarah saves $25</span>
              <ArrowRight className="h-4 w-4 text-blue-500" />
              <span className="text-sm">You match $25</span>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                <Zap className="h-3 w-3" />
                Friend Streak +1!
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Sarah's Account</p>
                <p className="font-bold text-green-600">+$25</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Your Account</p>
                <p className="font-bold text-green-600">+$25</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: Target,
      title: "Build Friend Streaks",
      description: "Match consistently to build powerful saving streaks together",
      visual: (
        <div className="grid grid-cols-2 gap-3 my-6">
          <div className="bg-orange-50/80 border border-orange-200 rounded-lg p-3 text-center">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-lg">🔥</span>
            </div>
            <p className="text-xs font-medium text-orange-900">7-Day Streak</p>
            <p className="text-xs text-orange-700">Unlock badges</p>
          </div>
          <div className="bg-purple-50/80 border border-purple-200 rounded-lg p-3 text-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-lg">🏆</span>
            </div>
            <p className="text-xs font-medium text-purple-900">30-Day Streak</p>
            <p className="text-xs text-purple-700">Unlock rewards</p>
          </div>
          <div className="bg-green-50/80 border border-green-200 rounded-lg p-3 text-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-lg">💪</span>
            </div>
            <p className="text-xs font-medium text-green-900">Accountability</p>
            <p className="text-xs text-green-700">Stay motivated</p>
          </div>
          <div className="bg-blue-50/80 border border-blue-200 rounded-lg p-3 text-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-lg">🎯</span>
            </div>
            <p className="text-xs font-medium text-blue-900">Shared Goals</p>
            <p className="text-xs text-blue-700">Save together</p>
          </div>
        </div>
      )
    },
    {
      icon: Gift,
      title: "Ready to Start?",
      description: "Choose your path: connect friends or invite sponsors",
      visual: (
        <div className="space-y-3 my-6">
          <div className="bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-blue-900 text-sm">Connect Friends</p>
                <p className="text-xs text-blue-700">Find existing friends or invite new ones</p>
              </div>
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-purple-900 text-sm">Invite Sponsors</p>
                <p className="text-xs text-purple-700">Family & friends who want to support you financially</p>
              </div>
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      )
    }
  ];

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

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          {/* Header with Skip */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Match-a-Save Guide</h2>
            <Button variant="ghost" size="sm" onClick={onSkip} className="text-muted-foreground">
              Skip
            </Button>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
            <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
          </div>

          {/* Step Content */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            
            <h3 className="text-xl font-bold mb-2">{step.title}</h3>
            <p className="text-muted-foreground mb-4 text-sm">{step.description}</p>
            
            {step.visual}
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={prevStep} className="flex-1">
                Back
              </Button>
            )}
            <Button onClick={nextStep} className="flex-1">
              {currentStep === steps.length - 1 ? 'Get Started!' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}