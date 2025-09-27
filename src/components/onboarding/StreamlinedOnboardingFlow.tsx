import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Target, 
  Zap, 
  Users, 
  Coffee, 
  Utensils, 
  Car, 
  ShoppingCart, 
  PiggyBank,
  DollarSign,
  Calendar,
  CheckCircle2,
  Phone,
  Mail,
  Share2,
  UserPlus,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';

// Contact interface for native contacts
interface Contact {
  id: string;
  name: string;
  emails?: string[];
  phoneNumbers?: string[];
}

interface Habit {
  id: string;
  name: string;
  icon: React.ReactNode;
  avgSaving: number;
  description: string;
}

const availableHabits: Habit[] = [
  {
    id: 'coffee',
    name: 'Skip Coffee Shop',
    icon: <Coffee className="h-5 w-5" />,
    avgSaving: 5.50,
    description: 'Make coffee at home instead'
  },
  {
    id: 'delivery', 
    name: 'Cook vs Delivery',
    icon: <Utensils className="h-5 w-5" />,
    avgSaving: 15.00,
    description: 'Home cooking vs takeout'
  },
  {
    id: 'transport',
    name: 'Walk vs Ride Share', 
    icon: <Car className="h-5 w-5" />,
    avgSaving: 8.00,
    description: 'Walk short distances'
  },
  {
    id: 'impulse',
    name: 'Skip Impulse Buys',
    icon: <ShoppingCart className="h-5 w-5" />,
    avgSaving: 12.00,
    description: 'Think before you buy'
  }
];

const steps = [
  {
    title: "Set Your Savings Goal",
    description: "What are you saving for?",
    icon: <Target className="h-8 w-8" />
  },
  {
    title: "Choose Your Saving Habits", 
    description: "Which daily habits will build your wealth?",
    icon: <Zap className="h-8 w-8" />
  },
  {
    title: "Connect with Friends",
    description: "Save together and stay motivated",
    icon: <Users className="h-8 w-8" />
  }
];

interface StreamlinedOnboardingFlowProps {
  onComplete: () => void;
  mode?: 'standard' | 'educational';
}

export default function StreamlinedOnboardingFlow({ onComplete, mode = 'standard' }: StreamlinedOnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState(5000);
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [hasContactPermission, setHasContactPermission] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [manualEmail, setManualEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  const calculateSelectedHabitsTotal = () => {
    return selectedHabits.reduce((total, habitId) => {
      const habit = availableHabits.find(h => h.id === habitId);
      return total + (habit ? habit.avgSaving : 0);
    }, 0);
  };

  const toggleHabit = (habitId: string) => {
    setSelectedHabits(prev => 
      prev.includes(habitId) 
        ? prev.filter(id => id !== habitId)
        : [...prev, habitId]
    );
  };

  const syncContacts = async () => {
    setContactsLoading(true);
    
    try {
      // Simulate contact sync for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock contacts - in a real app this would use native contact API
      const mockContacts: Contact[] = [
        { id: '1', name: 'Sarah Johnson', emails: ['sarah@example.com'], phoneNumbers: ['+1234567890'] },
        { id: '2', name: 'Mike Chen', emails: ['mike@example.com'], phoneNumbers: ['+1234567891'] },
        { id: '3', name: 'Alex Rodriguez', emails: ['alex@example.com'], phoneNumbers: ['+1234567892'] },
        { id: '4', name: 'Emma Davis', emails: ['emma@example.com'], phoneNumbers: ['+1234567893'] }
      ];

      setContacts(mockContacts);
      setHasContactPermission(true);
      
      toast({
        title: "Contacts Found! 📱",
        description: `${mockContacts.length} friends ready to invite`,
      });
    } catch (error) {
      console.error('Contact sync error:', error);
      toast({
        title: "Sync Failed", 
        description: "Try manual invite instead",
        variant: "destructive",
      });
    } finally {
      setContactsLoading(false);
    }
  };

  const inviteByEmail = async (email: string, name?: string) => {
    const subject = "Join me on Livin Salti! 💰";
    const body = `Hey${name ? ` ${name}` : ''}! I'm building wealth with Livin Salti and want you to join me! Check it out: ${window.location.origin}?ref=${user?.id}`;

    try {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      toast({
        title: "Email Opened! 📧",
        description: `Invitation ready for ${name || email}`,
      });
    } catch (error) {
      console.error('Email invite error:', error);
    }
  };

  const shareReferralLink = async () => {
    const link = `${window.location.origin}?ref=${user?.id}`;
    const text = `Join me on Livin Salti and let's save together! 🎯💰 ${link}`;

    if (navigator.share && Capacitor.isNativePlatform()) {
      try {
        await navigator.share({
          title: 'Save Together on Livin Salti',
          text,
          url: link,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(link);
        toast({
          title: "Link Copied! 🔗",
          description: "Share this link with friends",
        });
      } catch (error) {
        toast({
          title: "Link Ready",
          description: `Copy this link: ${link}`,
        });
      }
    }
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      await createFirstGoal();
    } else if (currentStep === 1) {
      await createFirstSave();
    } else if (currentStep === 2) {
      // Skip contacts step - it's optional
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
          title: goalName || 'My Savings Goal',
          target_cents: goalAmount * 100,
          emoji: '🎯'
        });

      if (error) throw error;
      
      toast({
        title: "🎯 Goal Set!",
        description: `${goalName} is now your target!`,
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
      const dailySavings = calculateSelectedHabitsTotal();
      const { error } = await supabase
        .from('saves')
        .insert({
          user_id: user.id,
          amount_cents: Math.round(dailySavings * 100),
          reason: 'First save from onboarding'
        });

      if (error) throw error;

      toast({
        title: "🎉 First Save!",
        description: `You saved $${dailySavings.toFixed(2)} with your new habits!`,
      });
    } catch (error) {
      console.error('Error creating save:', error);
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
        .upsert({ 
          id: user.id,
          email: user.email,
          mode: mode,
          completed_onboarding: true,
          onboarding_completed_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) throw error;
      
      toast({
        title: "🚀 Welcome!",
        description: "Your wealth journey begins now!",
      });

      setTimeout(() => {
        onComplete();
      }, 1000);
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return goalName.length > 0;
      case 1: return selectedHabits.length > 0;
      case 2: return true; // Friends step is optional
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <PiggyBank className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Livin Salti</h1>
          </div>
          <Progress value={progress} className="mb-4" />
          <Badge variant="outline" className="mb-2">
            Step {currentStep + 1} of {steps.length}
          </Badge>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
              {currentStepData.icon}
            </div>
            <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
            <p className="text-muted-foreground">{currentStepData.description}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Goal Setting */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'Emergency Fund', icon: '🛡️', amount: 5000 },
                    { name: 'Dream Vacation', icon: '🏖️', amount: 3000 },
                    { name: 'New Car', icon: '🚗', amount: 15000 },
                    { name: 'House Fund', icon: '🏠', amount: 50000 }
                  ].map((goal) => (
                    <Button
                      key={goal.name}
                      variant={goalName === goal.name ? "default" : "outline"}
                      className="h-auto p-4 text-left"
                      onClick={() => {
                        setGoalName(goal.name);
                        setGoalAmount(goal.amount);
                      }}
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
                  <Label htmlFor="customGoal">Or create your own:</Label>
                  <Input
                    id="customGoal"
                    placeholder="Kids College Fund, Wedding..."
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <DollarSign className="h-4 w-4" />
                    Target: ${goalAmount.toLocaleString()}
                  </Label>
                  <Slider
                    value={[goalAmount]}
                    onValueChange={(value) => setGoalAmount(value[0])}
                    max={100000}
                    min={500}
                    step={500}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Habit Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid gap-3">
                  {availableHabits.map((habit) => (
                    <div
                      key={habit.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedHabits.includes(habit.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => toggleHabit(habit.id)}
                    >
                      <div className="flex items-center gap-3">
                        {habit.icon}
                        <div className="flex-1">
                          <div className="font-medium">{habit.name}</div>
                          <div className="text-sm text-muted-foreground">{habit.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-primary">
                            ${habit.avgSaving.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">per day</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedHabits.length > 0 && (
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="font-semibold">Your Daily Savings</span>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      ${calculateSelectedHabitsTotal().toFixed(2)}/day
                    </div>
                    <div className="text-sm text-muted-foreground">
                      That's ${(calculateSelectedHabitsTotal() * 365).toLocaleString()} per year!
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Connect Friends */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold mb-2">💪 Why Save Together?</h3>
                  <p className="text-sm text-muted-foreground">
                    People with accountability partners are 65% more likely to reach their goals. 
                    Connect with friends to match saves, build streaks, and celebrate wins together!
                  </p>
                </div>

                <div className="grid gap-4">
                  {/* Contact Sync */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <div className="font-medium">Find Friends</div>
                          <div className="text-sm text-muted-foreground">
                            Find friends who might want to save together
                          </div>
                        </div>
                        <Button 
                          onClick={syncContacts} 
                          disabled={contactsLoading}
                          size="sm"
                        >
                          {contactsLoading ? 'Finding...' : 'Find'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Manual Email Invite */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <Input
                            placeholder="friend@example.com"
                            value={manualEmail}
                            onChange={(e) => setManualEmail(e.target.value)}
                          />
                        </div>
                        <Button 
                          onClick={() => {
                            if (manualEmail) {
                              inviteByEmail(manualEmail);
                              setManualEmail('');
                            }
                          }}
                          disabled={!manualEmail}
                          size="sm"
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Invite
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Share Link */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Share2 className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <div className="font-medium">Share Referral Link</div>
                          <div className="text-sm text-muted-foreground">
                            Share your unique link with anyone
                          </div>
                        </div>
                        <Button onClick={shareReferralLink} size="sm">
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Contact List */}
                {hasContactPermission && contacts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Your Contacts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {contacts.slice(0, 5).map((contact) => (
                        <div key={contact.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{contact.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {contact.emails?.[0] || contact.phoneNumbers?.[0]}
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => contact.emails?.[0] && inviteByEmail(contact.emails[0], contact.name)}
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Invite
                          </Button>
                        </div>
                      ))}
                      {contacts.length > 5 && (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          Showing first 5 of {contacts.length} contacts
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={loading || !canProceed()}
          >
            {loading ? 'Saving...' : currentStep === 2 ? 'Complete Setup' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}