import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PiggyBank, Target, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QuickOnboardingProps {
  onComplete: () => void;
}

export default function QuickOnboarding({ onComplete }: QuickOnboardingProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState(5000);
  const [saveAmount, setSaveAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const presetGoals = [
    { name: 'Emergency Fund', amount: 5000, icon: '🛡️' },
    { name: 'Dream Vacation', amount: 3000, icon: '🏖️' },
    { name: 'New Car', amount: 15000, icon: '🚗' },
    { name: 'House Fund', amount: 50000, icon: '🏠' }
  ];

  const quickSaveAmounts = [1, 5, 10, 20];

  const handleGoalSelect = (goal: typeof presetGoals[0]) => {
    setGoalName(goal.name);
    setGoalAmount(goal.amount);
  };

  const handleNext = async () => {
    if (step === 1) {
      await createGoal();
      setStep(2);
    } else {
      await createFirstSave();
      await completeOnboarding();
    }
  };

  const createGoal = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('stacklets')
        .insert({
          user_id: user.id,
          title: goalName,
          target_cents: goalAmount * 100,
          emoji: '🎯'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFirstSave = async () => {
    if (!user || saveAmount === 0) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('saves')
        .insert({
          user_id: user.id,
          amount_cents: saveAmount * 100,
          reason: 'First save!'
        });

      if (error) throw error;
      
      toast({
        title: "🎉 First Save Complete!",
        description: `You saved $${saveAmount}! Keep it up!`,
      });
    } catch (error) {
      console.error('Error creating save:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          email: user.email,
          completed_onboarding: true,
          onboarding_completed_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) throw error;
      
      setTimeout(() => {
        onComplete();
      }, 1000);
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      onComplete(); // Complete anyway
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <PiggyBank className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Livin Salti</h1>
          </div>
          <Badge variant="outline">
            Step {step} of 2
          </Badge>
        </div>

        <Card className="shadow-xl">
          {step === 1 ? (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
                  <Target className="h-8 w-8" />
                </div>
                <CardTitle>What's your goal?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {presetGoals.map((goal) => (
                    <Button
                      key={goal.name}
                      variant={goalName === goal.name ? "default" : "outline"}
                      className="h-auto p-4 text-left"
                      onClick={() => handleGoalSelect(goal)}
                    >
                      <div>
                        <div className="text-xl mb-1">{goal.icon}</div>
                        <div className="font-medium text-sm">{goal.name}</div>
                        <div className="text-xs text-muted-foreground">${goal.amount.toLocaleString()}</div>
                      </div>
                    </Button>
                  ))}
                </div>

                <div>
                  <Input
                    placeholder="Or enter custom goal..."
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                  />
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleNext}
                  disabled={!goalName || loading}
                >
                  Continue
                </Button>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
                  <Zap className="h-8 w-8" />
                </div>
                <CardTitle>Start saving now!</CardTitle>
                <p className="text-muted-foreground">How much can you save today?</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {quickSaveAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant={saveAmount === amount ? "default" : "outline"}
                      onClick={() => setSaveAmount(amount)}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Custom amount"
                    value={saveAmount || ''}
                    onChange={(e) => setSaveAmount(Number(e.target.value))}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)} 
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleNext}
                    disabled={saveAmount === 0 || loading}
                    className="flex-1"
                  >
                    {loading ? 'Saving...' : 'Start Journey! 🚀'}
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}