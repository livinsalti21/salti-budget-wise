// src/components/UserOnboarding.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AccountLinking } from './AccountLinking';
import { FeatureGate } from './core/FeatureGate';
import { track, EVENTS } from '@/analytics/analytics';

interface Goal {
  amount: number;
  cadence: 'daily' | 'weekly' | 'biweekly' | 'monthly';
}

export default function UserOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [goal, setGoal] = useState<Goal>({ amount: 0, cadence: 'weekly' });

  const nextStep = () => setStep(s => (s === 3 ? 3 : (s + 1) as any));
  const prevStep = () => setStep(s => (s === 1 ? 1 : (s - 1) as any));
  
  const finishOnboarding = () => {
    track(EVENTS.onboarding_complete, { goal });
    navigate('/save/choose', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="w-full max-w-md space-y-6">
        {/* Progress indicator */}
        <div className="flex justify-center space-x-2">
          {[1, 2, 3].map((stepNum) => (
            <div
              key={stepNum}
              className={`w-3 h-3 rounded-full ${
                stepNum <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Livin Salti! 👋</CardTitle>
              <CardDescription>
                Let's set a simple savings goal to get momentum.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">How much would you like to save?</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={goal.amount || ''}
                  onChange={(e) => setGoal({ ...goal, amount: Number(e.target.value) })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cadence">How often?</Label>
                <Select value={goal.cadence} onValueChange={(value: any) => setGoal({ ...goal, cadence: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full" 
                onClick={() => { 
                  track(EVENTS.goal_set, goal);
                  nextStep(); 
                }}
                disabled={!goal.amount}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Connect Your Bank (Optional) 🏦</CardTitle>
              <CardDescription>
                Link your bank account for automatic saves and insights.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FeatureGate 
                flag="ACCOUNT_LINKING" 
                fallback={
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      We'll handle bank linking soon. You can start saving now!
                    </p>
                  </div>
                }
              >
                <AccountLinking />
              </FeatureGate>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={prevStep} className="flex-1">
                  Back
                </Button>
                <Button onClick={nextStep} className="flex-1">
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Ready to Start! 🚀</CardTitle>
              <CardDescription>
                Let's record your first save and start your streak.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <div className="text-2xl font-bold text-primary mb-2">
                  ${goal.amount} {goal.cadence}
                </div>
                <p className="text-muted-foreground">
                  Your savings goal is set! Every save counts toward building your financial future.
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={prevStep} className="flex-1">
                  Back
                </Button>
                <Button onClick={finishOnboarding} className="flex-1">
                  Start Saving
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}