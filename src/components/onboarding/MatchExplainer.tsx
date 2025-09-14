import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, DollarSign, Zap, X, ArrowRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchExplainerProps {
  variant?: 'full' | 'compact' | 'first-time';
  onDismiss?: () => void;
  className?: string;
}

export function MatchExplainer({ variant = 'full', onDismiss, className }: MatchExplainerProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: <Heart className="h-6 w-6 text-primary" />,
      title: "Two Types of Matching",
      description: "There are Sponsor Matches (money to your account) and Friend Matches (social motivation).",
      detail: "Sponsor matches give you real money. Friend matches are when friends save to their own accounts to 'match' you - building streaks together!",
      visual: (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
            <h4 className="font-semibold text-sm text-green-900 mb-2">💰 Sponsor Match (Money Transfer)</h4>
            <div className="flex items-center justify-center space-x-2 text-xs">
              <span>You save $5</span> <ArrowRight className="h-3 w-3" /> <span>Sponsor sends $5</span> <ArrowRight className="h-3 w-3" /> <span className="font-bold text-green-600">You get $10</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-sm text-blue-900 mb-2">🤝 Friend Match (Social Motivation)</h4>
            <div className="flex items-center justify-center space-x-2 text-xs">
              <span>You save $5</span> <ArrowRight className="h-3 w-3" /> <span>Friend saves $5</span> <ArrowRight className="h-3 w-3" /> <span className="font-bold text-blue-600">Friend Streak!</span>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: <Users className="h-6 w-6 text-blue-500" />,
      title: "Sponsor Matches vs Friend Matches", 
      description: "Sponsors send money to your account. Friends save to their own accounts for social motivation.",
      detail: "Both help you succeed, but in different ways - financial support vs social accountability!"
    },
    {
      icon: <Zap className="h-6 w-6 text-green-500" />,
      title: "How Both Work",
      description: "Sponsor matches are automatic money transfers. Friend matches happen when friends choose to save too.",
      detail: "You get the best of both worlds - financial boosts from sponsors and social motivation from friends!"
    }
  ];

  if (variant === 'compact') {
    return (
      <Card className={cn("border-l-4 border-l-red-500 bg-gradient-to-r from-red-50/50 to-pink-50/50", className)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                <Heart className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Match-a-Save</h4>
                <p className="text-xs text-muted-foreground">Family & friends double your saves automatically</p>
              </div>
            </div>
            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={onDismiss} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'first-time') {
    return (
      <Card className={cn("border-2 border-red-200 shadow-lg", className)}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto">
              <Heart className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Invite Someone to Match Your Saves!</h3>
              <p className="text-sm text-muted-foreground">
                When family or friends match your saves, you reach your goals twice as fast
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span>You save:</span>
                <span className="font-medium">$10</span>
              </div>
              <div className="flex items-center justify-between text-red-600">
                <span>Grandma matches:</span>
                <span className="font-medium">+$10</span>
              </div>
              <div className="border-t pt-2 flex items-center justify-between font-bold">
                <span>Total in your stack:</span>
                <span className="text-green-600">$20</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Invite Someone
              </Button>
              {onDismiss && (
                <Button variant="outline" size="sm" onClick={onDismiss}>
                  Later
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full explanation with steps
  return (
    <Card className={cn("shadow-lg border-red-200", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Understanding Match-a-Save
          </CardTitle>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription>
          Learn how family and friends can automatically boost your savings
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-2 w-8 rounded-full transition-colors",
                index <= step ? "bg-red-500" : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Current step */}
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto">
            {steps[step].icon}
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-2">{steps[step].title}</h3>
            <p className="text-muted-foreground mb-3">{steps[step].description}</p>
            <div className="bg-muted/50 p-3 rounded-lg text-sm">
              💡 {steps[step].detail}
            </div>
          </div>
        </div>

        {/* Real example */}
        {step === 2 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Real Example
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>👤 You save $5 for coffee fund</span>
                <Badge variant="outline">$5.00</Badge>
              </div>
              <div className="flex items-center justify-between text-green-600">
                <span>❤️ Dad matches 100%</span>
                <Badge variant="outline" className="border-green-600 text-green-600">+$5.00</Badge>
              </div>
              <div className="flex items-center justify-between text-blue-600">
                <span>👵 Grandma matches 50%</span>
                <Badge variant="outline" className="border-blue-600 text-blue-600">+$2.50</Badge>
              </div>
              <div className="border-t pt-2 flex items-center justify-between font-bold">
                <span>🎯 Total in your coffee fund:</span>
                <Badge className="bg-gold text-gold-foreground">$12.50</Badge>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
          >
            Previous
          </Button>
          
          {step < steps.length - 1 ? (
            <Button
              size="sm"
              onClick={() => setStep(step + 1)}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button size="sm" onClick={onDismiss}>
              Got it!
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}