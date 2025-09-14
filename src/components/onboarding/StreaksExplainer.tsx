import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flame, Calendar, Trophy, TrendingUp, X, ArrowRight, Target, Star, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreaksExplainerProps {
  variant?: 'full' | 'compact' | 'first-time';
  onDismiss?: () => void;
  className?: string;
}

export function StreaksExplainer({ variant = 'full', onDismiss, className }: StreaksExplainerProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: <Flame className="h-6 w-6 text-orange-500" />,
      title: "What Are Streaks?",
      description: "A streak is consecutive days where you save money - even $1 counts!",
      detail: "Building consistent saving habits is more powerful than saving large amounts occasionally."
    },
    {
      icon: <Trophy className="h-6 w-6 text-gold-500" />,
      title: "Why Streaks Matter",
      description: "Consistency builds momentum and transforms saving into an automatic habit.",
      detail: "Studies show it takes 21 days to form a habit. Your streak tracker keeps you motivated!"
    },
    {
      icon: <Users className="h-6 w-6 text-blue-500" />,
      title: "Different Streak Types",
      description: "Track personal streaks, friend matches, community goals, and sponsor bonuses.",
      detail: "Friend streaks happen when you save AND friends 'match' by saving to their own accounts - it's social motivation, not money transfer!"
    }
  ];

  const milestones = [
    { days: 7, emoji: '🔥', reward: 'Week Warrior' },
    { days: 14, emoji: '⚡', reward: 'Momentum Master' },
    { days: 30, emoji: '🏆', reward: 'Monthly Legend' },
    { days: 100, emoji: '⭐', reward: 'Streak Superstar' }
  ];

  if (variant === 'compact') {
    return (
      <Card className={cn("border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50/50 to-red-50/50", className)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Saving Streaks</h4>
                <p className="text-xs text-muted-foreground">Build habits with consecutive saving days</p>
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
      <Card className={cn("border-2 border-orange-200 shadow-lg", className)}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto">
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold">🔥 Start Your First Streak!</h3>
              <p className="text-sm text-muted-foreground">
                Save any amount for consecutive days to build momentum
              </p>
            </div>
            
            {/* Streak visualization */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-3">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <div
                    key={day}
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold",
                      day <= 3 
                        ? "bg-orange-500 text-white" 
                        : "bg-muted text-muted-foreground border-2 border-dashed border-orange-300"
                    )}
                  >
                    {day <= 3 ? '✓' : day}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Day 3 streak - Keep going to reach your first milestone at 7 days!
              </p>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Target className="h-3 w-3" />
                <span>Even $1 saves count</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Trophy className="h-3 w-3" />
                <span>Unlock badges & rewards</span>
              </div>
            </div>

            {onDismiss && (
              <Button size="sm" onClick={onDismiss} className="w-full">
                <Flame className="h-4 w-4 mr-2" />
                Start My Streak
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full explanation with steps
  return (
    <Card className={cn("shadow-lg border-orange-200", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Understanding Streaks
          </CardTitle>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription>
          Learn how consistent saving builds powerful habits and unlocks rewards
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
                index <= step ? "bg-orange-500" : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Current step */}
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto">
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

        {/* Milestones showcase */}
        {step === 1 && (
          <div className="bg-gradient-to-r from-gold-50 to-yellow-50 p-4 rounded-lg border border-gold-200">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-gold-600" />
              Streak Milestones & Rewards
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {milestones.map((milestone) => (
                <div key={milestone.days} className="text-center space-y-1">
                  <div className="text-lg">{milestone.emoji}</div>
                  <div className="text-xs font-medium">{milestone.days} Days</div>
                  <Badge variant="outline" className="text-xs">
                    {milestone.reward}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Streak types */}
        {step === 2 && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <Flame className="h-5 w-5 text-orange-500" />
                <div className="flex-1">
                  <h5 className="text-sm font-medium">Personal Streak</h5>
                  <p className="text-xs text-muted-foreground">Your individual saving consistency</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <h5 className="text-sm font-medium">Friend Match Streaks</h5>
                  <p className="text-xs text-muted-foreground">When you save AND friends match by saving too</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Target className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <h5 className="text-sm font-medium">Community Goals</h5>
                  <p className="text-xs text-muted-foreground">Join group challenges</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Star className="h-5 w-5 text-purple-500" />
                <div className="flex-1">
                  <h5 className="text-sm font-medium">Sponsor Bonuses</h5>
                  <p className="text-xs text-muted-foreground">Extra rewards from sponsors</p>
                </div>
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
              Start Building Streaks!
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}