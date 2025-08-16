import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PiggyBank, TrendingUp, Users, ArrowRight, Sparkles, Target } from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    title: "Welcome to Livin Salti",
    description: "Save smarter, stack faster, live your way",
    icon: PiggyBank,
    content: (
      <div className="text-center space-y-4">
        <div className="w-24 h-24 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto">
          <span className="text-4xl">✌🏽</span>
        </div>
        <h2 className="text-2xl font-bold">Welcome to your financial journey!</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Livin Salti helps you build wealth through better money habits. 
          Every small save today becomes significant wealth tomorrow.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
            <PiggyBank className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-sm font-medium">Save & Stack</div>
            <div className="text-xs text-muted-foreground">Track conscious spending</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-lg">
            <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
            <div className="text-sm font-medium">Future Vision</div>
            <div className="text-xs text-muted-foreground">See 30-year projections</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg">
            <Users className="h-8 w-8 text-accent mx-auto mb-2" />
            <div className="text-sm font-medium">Social Support</div>
            <div className="text-xs text-muted-foreground">Build habits together</div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "How Save n Stack Works",
    description: "Turn everyday decisions into wealth",
    icon: Sparkles,
    content: (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Every Save Creates Future Wealth</h2>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
            <div>
              <h3 className="font-semibold">Make a Conscious Choice</h3>
              <p className="text-sm text-muted-foreground">
                Skip the coffee, cook at home, walk instead of Uber - every mindful decision counts
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
            <div>
              <h3 className="font-semibold">Log Your Save</h3>
              <p className="text-sm text-muted-foreground">
                Record the amount you saved and what you saved on - celebrate the habit!
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-success/10 to-success/5 rounded-lg">
            <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
            <div>
              <h3 className="font-semibold">See Your Future</h3>
              <p className="text-sm text-muted-foreground">
                Watch how today's $5 save becomes $133 in 30 years at 8% growth
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-warning/10 to-warning/5 rounded-lg border border-warning/20">
          <div className="text-center">
            <Target className="h-6 w-6 text-warning mx-auto mb-2" />
            <div className="text-sm font-medium">Example Impact</div>
            <div className="text-xs text-muted-foreground">
              $5 saved today → $133 in 30 years (8% annual return)
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Ready to Start Building Wealth?",
    description: "Your financial freedom journey begins now",
    icon: Target,
    content: (
      <div className="text-center space-y-6">
        <div className="w-24 h-24 bg-gradient-to-r from-success to-accent rounded-full flex items-center justify-center mx-auto">
          <Target className="h-12 w-12 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold">You're All Set!</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Start by setting up your budget, then make your first save. 
          Every small step builds momentum toward financial freedom.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
            <h3 className="font-semibold mb-2">First Steps</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Set up your monthly budget</li>
              <li>• Make your first save</li>
              <li>• See your future projection</li>
            </ul>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg">
            <h3 className="font-semibold mb-2">Pro Tips</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Start small, stay consistent</li>
              <li>• Celebrate every win</li>
              <li>• Invite friends to match saves</li>
            </ul>
          </div>
        </div>

        <Badge variant="secondary" className="text-sm">
          <Sparkles className="h-4 w-4 mr-1" />
          Building wealth is about habits, not just amounts
        </Badge>
      </div>
    )
  }
];

export default function Onboarding({ onComplete }: OnboardingProps) {
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
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl border-2 border-primary/20">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {currentStepData.title}
          </CardTitle>
          <CardDescription className="text-lg">
            {currentStepData.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentStepData.content}
          
          {/* Progress Indicator */}
          <div className="flex justify-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep 
                    ? 'bg-primary' 
                    : index < currentStep 
                      ? 'bg-success' 
                      : 'bg-secondary'
                }`}
              />
            ))}
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} of {steps.length}
            </span>
            
            <Button onClick={nextStep} size="lg">
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}