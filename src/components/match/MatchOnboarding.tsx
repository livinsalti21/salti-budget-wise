import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Heart, Users, DollarSign, Gift, ArrowRight, CheckCircle } from 'lucide-react';

interface MatchOnboardingProps {
  onComplete: () => void;
}

export function MatchOnboarding({ onComplete }: MatchOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Heart,
      title: "Your Family Cares",
      description: "They want to help you succeed financially, but need an easy way to support you.",
      visual: (
        <div className="flex items-center justify-center gap-4 my-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-2">
              <span className="text-lg">👨‍👩‍👧‍👦</span>
            </div>
            <p className="text-xs text-muted-foreground">Family</p>
          </div>
          <Heart className="h-6 w-6 text-red-500" />
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <span className="text-lg">🎯</span>
            </div>
            <p className="text-xs text-muted-foreground">You</p>
          </div>
        </div>
      )
    },
    {
      icon: DollarSign,
      title: "Automatic Matching",
      description: "When you save $5, they automatically contribute $5. Your savings double instantly!",
      visual: (
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 my-6">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">You save</p>
              <p className="text-2xl font-bold text-primary">$5</p>
            </div>
            <div className="flex flex-col items-center">
              <ArrowRight className="h-4 w-4 text-muted-foreground mb-1" />
              <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">Match!</span>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-accent">$10</p>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: Gift,
      title: "Everyone Wins",
      description: "You reach goals 2x faster. They see exactly how their support helps you succeed.",
      visual: (
        <div className="grid grid-cols-2 gap-4 my-6">
          <div className="bg-primary/10 rounded-lg p-3 text-center">
            <CheckCircle className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">You Win</p>
            <p className="text-xs text-muted-foreground">2x faster goals</p>
          </div>
          <div className="bg-accent/10 rounded-lg p-3 text-center">
            <CheckCircle className="h-6 w-6 text-accent mx-auto mb-2" />
            <p className="text-sm font-medium">They Win</p>
            <p className="text-xs text-muted-foreground">See real impact</p>
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
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
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
          <p className="text-muted-foreground mb-4">{step.description}</p>
          
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
  );
}