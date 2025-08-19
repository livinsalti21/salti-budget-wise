import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { PiggyBank, Target, Zap, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: OnboardingStep[] = [
  {
    title: "Welcome to Livin Salti",
    description: "Start your first Save n Stack streak today!",
    icon: <PiggyBank className="h-8 w-8" />
  },
  {
    title: "Set Your First Goal",
    description: "What are you saving for?",
    icon: <Target className="h-8 w-8" />
  },
  {
    title: "Make Your First Save",
    description: "Let's stack your first save",
    icon: <Zap className="h-8 w-8" />
  },
  {
    title: "Join the Community",
    description: "See how others are stacking",
    icon: <Users className="h-8 w-8" />
  }
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [goalName, setGoalName] = useState('Rainy Day Fund');
  const [goalAmount, setGoalAmount] = useState('1000');
  const [saveAmount, setSaveAmount] = useState('5');
  const [saveReason, setSaveReason] = useState('Coffee');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = async () => {
    if (currentStep === 1) {
      // Create first goal
      await createFirstGoal();
    } else if (currentStep === 2) {
      // Create first save
      await createFirstSave();
    } else if (currentStep === 3) {
      // Complete onboarding
      onComplete();
      return;
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const createFirstGoal = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('stacklets')
        .insert({
          user_id: user.id,
          title: goalName,
          target_cents: Math.round(parseFloat(goalAmount) * 100),
          emoji: '🎯'
        });

      if (error) throw error;
      
      toast({
        title: "Goal Created! 🎯",
        description: `Your ${goalName} goal is set up`,
      });
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createFirstSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get the user's stacklet
      const { data: stacklets } = await supabase
        .from('stacklets')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .limit(1);

      if (!stacklets || stacklets.length === 0) {
        throw new Error('No goal found');
      }

      const { error } = await supabase
        .from('saves')
        .insert({
          user_id: user.id,
          amount_cents: Math.round(parseFloat(saveAmount) * 100),
          reason: saveReason
        });

      if (error) throw error;

      // Show confetti celebration
      toast({
        title: "🎉 First Save Stacked!",
        description: `Congrats! You saved $${saveAmount} and started a Day 1 streak!`,
      });
    } catch (error) {
      console.error('Error creating save:', error);
      toast({
        title: "Error",
        description: "Failed to create save",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
            {currentStepData.icon}
          </div>
          <CardTitle className="text-2xl">
            {currentStepData.title}
          </CardTitle>
          <CardDescription>
            {currentStepData.description}
          </CardDescription>
          <Progress value={progress} className="mt-4" />
          <p className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 0 && (
            <div className="text-center space-y-4">
              <p>Ready to build wealth through simple daily habits?</p>
              <div className="bg-accent/10 p-4 rounded-lg">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-accent" />
                <p className="text-sm">Every save becomes future wealth. Let's get started!</p>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goalName">Goal Name</Label>
                <Input
                  id="goalName"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="Emergency Fund, Vacation, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goalAmount">Target Amount (Optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="goalAmount"
                    type="number"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    className="pl-8"
                    placeholder="1000"
                  />
                </div>
              </div>
              <div className="bg-primary/5 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  💡 Free plan allows 1 goal. Upgrade to Pro for unlimited goals!
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="saveAmount">Amount Saved</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="saveAmount"
                    type="number"
                    step="0.01"
                    value={saveAmount}
                    onChange={(e) => setSaveAmount(e.target.value)}
                    className="pl-8"
                    placeholder="5.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="saveReason">What did you skip?</Label>
                <Input
                  id="saveReason"
                  value={saveReason}
                  onChange={(e) => setSaveReason(e.target.value)}
                  placeholder="Coffee, lunch out, impulse buy..."
                />
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-700">
                  🎉 This will start your Day 1 streak!
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center space-y-4">
              <p>Here's how others are stacking their saves:</p>
              <div className="space-y-2">
                <div className="bg-accent/10 p-3 rounded-lg text-left">
                  <p className="font-semibold">Sarah M.</p>
                  <p className="text-sm text-muted-foreground">Saved $12 • 5-day streak 🔥</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-lg text-left">
                  <p className="font-semibold">Mike R.</p>
                  <p className="text-sm text-muted-foreground">Saved $8 • 12-day streak 🔥</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Save again tomorrow to appear in the community feed!
              </p>
            </div>
          )}

          <Button 
            onClick={handleNext} 
            className="w-full" 
            disabled={loading}
          >
            {loading ? 'Creating...' : (currentStep === 3 ? 'Start Stacking!' : 'Continue')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}