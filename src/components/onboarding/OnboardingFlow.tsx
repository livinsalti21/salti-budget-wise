import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { PiggyBank, Target, Zap, Users, TrendingUp, Mail, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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
    title: "Choose Your Save Amount",
    description: "How much are you willing to save today?",
    icon: <Zap className="h-8 w-8" />
  },
  {
    title: "See Your Future",
    description: "Watch your money grow over time",
    icon: <TrendingUp className="h-8 w-8" />
  },
  {
    title: "Stay Connected",
    description: "How can we keep you motivated?",
    icon: <Mail className="h-8 w-8" />
  },
  {
    title: "Join the Community",
    description: "Invite friends or join a group",
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
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const progress = ((currentStep + 1) / steps.length) * 100;

  const calculateFutureValue = (dailyAmount: number, years: number) => {
    const annualRate = 0.08;
    const dailyRate = annualRate / 365;
    const days = years * 365;
    const futureValue = dailyAmount * (((1 + dailyRate) ** days - 1) / dailyRate);
    return futureValue;
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      // Create first goal
      await createFirstGoal();
    } else if (currentStep === 2) {
      // Just continue to show future value
    } else if (currentStep === 3) {
      // Create first save
      await createFirstSave();
    } else if (currentStep === 4) {
      // Save contact info
      await saveContactInfo();
    } else if (currentStep === 5) {
      // Complete onboarding
      await completeOnboarding();
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

  const saveContactInfo = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          email: email || null,
          phone: phone || null
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast({
        title: "Contact Info Saved! 📱",
        description: "We'll use this to keep you motivated and informed",
      });
    } catch (error) {
      console.error('Error saving contact info:', error);
      toast({
        title: "Error",
        description: "Failed to save contact info",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          completed_onboarding: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast({
        title: "🎉 Welcome to Livin Salti!",
        description: "You're all set up and ready to start stacking!",
      });

      // Navigate to app after onboarding
      navigate('/app');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding",
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
                <Label htmlFor="saveAmount">How much will you save today?</Label>
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
                <Label htmlFor="saveReason">What are you skipping?</Label>
                <Input
                  id="saveReason"
                  value={saveReason}
                  onChange={(e) => setSaveReason(e.target.value)}
                  placeholder="Coffee, lunch out, impulse buy..."
                />
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <p className="text-sm">
                  💡 Choose any amount - every save counts toward your future!
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center space-y-6">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg">
                <h3 className="text-lg font-bold mb-4">Your Future Impact</h3>
                <div className="text-3xl font-bold text-primary mb-2">
                  ${calculateFutureValue(parseFloat(saveAmount) || 5, 40).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
                <p className="text-sm text-muted-foreground">
                  If you save ${saveAmount} daily at 8% growth for 40 years
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-accent/10 p-4 rounded-lg">
                  <div className="text-lg font-bold text-accent">
                    ${calculateFutureValue(parseFloat(saveAmount) || 5, 10).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-xs text-muted-foreground">10 years</div>
                </div>
                <div className="bg-success/10 p-4 rounded-lg">
                  <div className="text-lg font-bold text-success">
                    ${calculateFutureValue(parseFloat(saveAmount) || 5, 20).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-xs text-muted-foreground">20 years</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Ready to make your first save and start building your future?
              </p>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Help us keep you motivated with reminders and updates (optional)
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-primary/5 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  💡 We'll send you friendly reminders to keep your streak going and celebrate your wins!
                </p>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="text-center space-y-4">
              <p>Ready to save with friends and family?</p>
              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  Join a Group
                </Button>
                <Button variant="outline" className="w-full">
                  Invite Friends
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Or skip for now - you can always join later in the Community tab
              </p>
            </div>
          )}

          <Button 
            onClick={handleNext} 
            className="w-full" 
            disabled={loading}
          >
            {loading ? 'Saving...' : (currentStep === 5 ? 'Start Stacking!' : 'Continue')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}