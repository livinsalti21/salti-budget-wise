import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Heart, TrendingUp, Users, DollarSign, Target, Sparkles, Award, Gift, Calculator, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";

interface SponsorOnboardingFlowProps {
  onComplete: (data: any) => void;
  onSkip?: () => void;
}

interface OnboardingData {
  sponsorType: string;
  monthlyBudget: number;
  matchPercentage: number;
  motivation: string;
  goals: string[];
  experience: string;
}

const SPONSOR_TYPES = [
  {
    id: "mentor",
    title: "The Mentor",
    description: "Guide someone's financial journey with wisdom and encouragement",
    icon: Heart,
    traits: ["Personal connection", "Long-term commitment", "Educational focus"],
    color: "bg-blue-50 border-blue-200 text-blue-700"
  },
  {
    id: "accelerator", 
    title: "The Accelerator",
    description: "Supercharge saving habits with strategic matching",
    icon: TrendingUp,
    traits: ["High-impact matching", "Goal-oriented", "Results-driven"],
    color: "bg-green-50 border-green-200 text-green-700"
  },
  {
    id: "community",
    title: "The Community Builder",
    description: "Foster a supportive environment for multiple savers",
    icon: Users,
    traits: ["Group dynamics", "Peer support", "Scalable impact"],
    color: "bg-purple-50 border-purple-200 text-purple-700"
  }
];

const IMPACT_SCENARIOS = [
  { amount: 25, saves: 52, total: 1300, compounded: 1800, timeframe: "1 year" },
  { amount: 50, saves: 104, total: 5200, compounded: 8500, timeframe: "2 years" },
  { amount: 100, saves: 156, total: 15600, compounded: 28000, timeframe: "3 years" }
];

export function SponsorOnboardingFlow({ onComplete, onSkip }: SponsorOnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    sponsorType: "",
    monthlyBudget: 100,
    matchPercentage: 50,
    motivation: "",
    goals: [],
    experience: ""
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  const steps = [
    "Why Sponsor?",
    "Your Style", 
    "Your Impact",
    "Your Motivation",
    "Let's Begin!"
  ];

  const calculateImpact = (monthlyBudget: number, percentage: number) => {
    const weeklyMatch = (monthlyBudget * 4) * (percentage / 100);
    const yearlyMatch = weeklyMatch * 52;
    const compoundedValue = yearlyMatch * 1.5; // Conservative growth estimate
    return {
      weekly: weeklyMatch,
      yearly: yearlyMatch,
      compounded: compoundedValue,
      livesImpacted: Math.floor(monthlyBudget / 25) // Estimate based on average sponsorship
    };
  };

  const impact = calculateImpact(data.monthlyBudget, data.matchPercentage);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowConfetti(true);
      setTimeout(() => {
        onComplete(data);
      }, 2000);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleGoal = (goal: string) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal) 
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  useEffect(() => {
    if (showConfetti) {
      // Create confetti effect
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-full mx-auto flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Why Become a Sponsor?</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                You're about to transform someone's financial future. Here's the incredible impact you'll have:
              </p>
            </div>

            <div className="grid gap-4">
              <Card className="p-4 border-green-200 bg-green-50">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800">Compound Their Success</h3>
                    <p className="text-sm text-green-600">Your $25/week matching creates $1,800+ in their first year</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-blue-200 bg-blue-50">
                <div className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-800">Build Lasting Habits</h3>
                    <p className="text-sm text-blue-600">92% of sponsored savers continue saving after 6 months</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-purple-200 bg-purple-50">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-purple-800">Create Generational Change</h3>
                    <p className="text-sm text-purple-600">Sponsored families improve financial literacy by 300%</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">The Ripple Effect</h4>
              <p className="text-sm text-muted-foreground">
                When you sponsor someone's savings journey, you're not just helping them—you're creating a ripple effect 
                that touches their family, friends, and future generations. Small actions, massive impact.
              </p>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/60 rounded-full mx-auto flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">What's Your Sponsoring Style?</h2>
              <p className="text-muted-foreground">
                Choose the approach that matches your personality and goals
              </p>
            </div>

            <div className="grid gap-4">
              {SPONSOR_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = data.sponsorType === type.id;
                
                return (
                  <Card 
                    key={type.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected ? 'ring-2 ring-primary shadow-lg scale-105' : 'hover:shadow-md'
                    } ${type.color}`}
                    onClick={() => setData(prev => ({ ...prev, sponsorType: type.id }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-white/80 flex items-center justify-center">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{type.title}</h3>
                          <p className="text-sm opacity-80 mb-2">{type.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {type.traits.map((trait) => (
                              <Badge key={trait} variant="secondary" className="text-xs">
                                {trait}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle className="w-6 h-6 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-400 rounded-full mx-auto flex items-center justify-center">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Design Your Impact</h2>
              <p className="text-muted-foreground">
                Set your budget and see the incredible difference you'll make
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">Monthly Budget</Label>
                <div className="mt-2">
                  <Slider
                    value={[data.monthlyBudget]}
                    onValueChange={(value) => setData(prev => ({ ...prev, monthlyBudget: value[0] }))}
                    max={500}
                    min={25}
                    step={25}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>$25</span>
                    <span className="font-medium text-lg text-primary">${data.monthlyBudget}</span>
                    <span>$500</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Match Percentage</Label>
                <div className="mt-2">
                  <Slider
                    value={[data.matchPercentage]}
                    onValueChange={(value) => setData(prev => ({ ...prev, matchPercentage: value[0] }))}
                    max={100}
                    min={25}
                    step={25}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>25%</span>
                    <span className="font-medium text-lg text-primary">{data.matchPercentage}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4 text-center">Your Impact Projection</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">${impact.weekly.toFixed(0)}</div>
                      <div className="text-sm text-muted-foreground">Weekly Match</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">${impact.yearly.toFixed(0)}</div>
                      <div className="text-sm text-muted-foreground">Yearly Impact</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">${impact.compounded.toFixed(0)}</div>
                      <div className="text-sm text-muted-foreground">3-Year Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{impact.livesImpacted}</div>
                      <div className="text-sm text-muted-foreground">Lives Impacted</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">What Drives You?</h2>
              <p className="text-muted-foreground">
                Help us understand your motivation so we can make this experience meaningful
              </p>
            </div>

            <div>
              <Label htmlFor="motivation" className="text-base font-medium">
                Why do you want to sponsor someone's financial journey?
              </Label>
              <textarea
                id="motivation"
                value={data.motivation}
                onChange={(e) => setData(prev => ({ ...prev, motivation: e.target.value }))}
                placeholder="Share what motivates you to help others build wealth..."
                className="w-full mt-2 p-3 border rounded-lg min-h-[100px] resize-none"
              />
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">
                What are your sponsoring goals? (Select all that apply)
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "Help someone build their first emergency fund",
                  "Support a family's financial stability", 
                  "Enable someone to achieve their dreams",
                  "Teach healthy money habits",
                  "Create generational wealth change",
                  "Pay it forward from my own success"
                ].map((goal) => (
                  <Button
                    key={goal}
                    variant={data.goals.includes(goal) ? "default" : "outline"}
                    onClick={() => toggleGoal(goal)}
                    className="justify-start text-left h-auto p-3"
                  >
                    <CheckCircle className={`w-4 h-4 mr-2 ${
                      data.goals.includes(goal) ? 'opacity-100' : 'opacity-30'
                    }`} />
                    {goal}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto flex items-center justify-center relative">
                {showConfetti && (
                  <div className="absolute inset-0 animate-pulse">
                    <Sparkles className="w-6 h-6 text-white absolute top-1 left-2 animate-bounce" />
                    <Sparkles className="w-4 h-4 text-yellow-200 absolute top-3 right-1 animate-bounce delay-100" />
                    <Sparkles className="w-5 h-5 text-orange-200 absolute bottom-2 left-3 animate-bounce delay-200" />
                  </div>
                )}
                <Award className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold">You're Ready to Change Lives! 🎉</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your sponsorship journey starts now. You're about to make an incredible difference.
              </p>
            </div>

            <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Your Sponsorship Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Style:</span>
                    <span className="font-medium">
                      {SPONSOR_TYPES.find(t => t.id === data.sponsorType)?.title || "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Budget:</span>
                    <span className="font-medium">${data.monthlyBudget}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Match Rate:</span>
                    <span className="font-medium">{data.matchPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Yearly Impact:</span>
                    <span className="font-bold text-primary">${impact.yearly.toFixed(0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-green-600" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-800">Find Your First Sponsee</h4>
                      <p className="text-sm text-green-600">Browse profiles and start making impact today</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-800">Explore Your Dashboard</h4>
                      <p className="text-sm text-blue-600">View analytics, track impact, and manage sponsorships</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Browse available sponsees and choose your match</li>
                <li>• Set up your first sponsorship rule</li>
                <li>• Start seeing their progress in real-time</li>
                <li>• Watch your impact grow through detailed analytics</li>
              </ul>
            </div>
          </div>
        );
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return data.sponsorType !== "";
      case 2: return data.monthlyBudget > 0 && data.matchPercentage > 0;
      case 3: return data.motivation.trim().length > 10 && data.goals.length > 0;
      default: return true;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-sm font-medium text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </h1>
          {onSkip && currentStep === 0 && (
            <Button variant="ghost" onClick={onSkip} className="text-sm">
              Skip Tutorial
            </Button>
          )}
        </div>
        <Progress value={(currentStep + 1) / steps.length * 100} className="w-full" />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          {steps.map((step, index) => (
            <span 
              key={step} 
              className={`${index <= currentStep ? 'text-primary font-medium' : ''}`}
            >
              {step}
            </span>
          ))}
        </div>
      </div>

      <Card className="min-h-[500px]">
        <CardContent className="p-6">
          {renderStep()}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {currentStep === steps.length - 1 ? (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                toast({
                  title: "Dashboard Ready!",
                  description: "Explore your sponsor dashboard and start making impact.",
                });
                onComplete(data);
              }}
              className="flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Go to Dashboard
            </Button>
            <Button
              onClick={() => {
                toast({
                  title: "Let's find your first sponsee!",
                  description: "We'll help you find the perfect match.",
                });
                onComplete({ ...data, action: 'find_sponsee' });
              }}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Find Sponsees
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center gap-2"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}