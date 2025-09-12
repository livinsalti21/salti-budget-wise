import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  PiggyBank, Target, Zap, Users, TrendingUp, Mail, Phone, Heart, 
  Brain, Coffee, Utensils, Car, ShoppingCart, Gamepad2, 
  Calculator, Timer, Sparkles, Trophy, Gift, Rocket,
  DollarSign, Calendar, CheckCircle2, ArrowRight, Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface OnboardingStep {
  title: string;
  subtitle: string;
  description: string;
  whyMessage: string;
  icon: React.ReactNode;
  bgColor: string;
}

const steps: OnboardingStep[] = [
  {
    title: "What's Your Dream?",
    subtitle: "Every millionaire started with a goal",
    description: "Let's connect your savings to something that truly matters to you",
    whyMessage: "Goals with emotional connection are 42% more likely to be achieved. Your brain needs a clear target to optimize for success.",
    icon: <Heart className="h-8 w-8" />,
    bgColor: "from-pink-500/10 to-red-500/10"
  },
  {
    title: "Your Saving Superpower",
    subtitle: "Small actions = Big results",
    description: "Which daily habit will become your secret wealth-building weapon?",
    whyMessage: "Consistency beats perfection. A $5 daily habit becomes $1.3M over 40 years with compound growth.",
    icon: <Zap className="h-8 w-8" />,
    bgColor: "from-yellow-500/10 to-orange-500/10"
  },
  {
    title: "The Magic of Compound Interest",
    subtitle: "Einstein called it the 8th wonder of the world",
    description: "See how your small saves become massive wealth over time",
    whyMessage: "Starting 10 years earlier can mean 10x more wealth at retirement. Time is your most powerful financial tool.",
    icon: <Sparkles className="h-8 w-8" />,
    bgColor: "from-purple-500/10 to-blue-500/10"
  },
  {
    title: "Stay Connected",
    subtitle: "Success happens in community",
    description: "How can we support your journey to financial freedom?",
    whyMessage: "People with accountability partners are 65% more likely to reach their goals. We'll celebrate every win with you.",
    icon: <Users className="h-8 w-8" />,
    bgColor: "from-green-500/10 to-blue-500/10"
  },
  {
    title: "Ready to Launch! 🚀",
    subtitle: "Your wealth-building journey begins now",
    description: "Join thousands who are already stacking their way to financial freedom",
    whyMessage: "The best time to start was 10 years ago. The second best time is now. Your future self will thank you.",
    icon: <Rocket className="h-8 w-8" />,
    bgColor: "from-purple-500/10 to-pink-500/10"
  }
];

interface Habit {
  id: string;
  name: string;
  icon: React.ReactNode;
  avgSaving: number;
  category: string;
  description: string;
  whyItWorks: string;
}

const availableHabits: Habit[] = [
  {
    id: '1',
    name: 'Skip Coffee Shop',
    icon: <Coffee className="h-5 w-5" />,
    avgSaving: 5.50,
    category: 'Daily',
    description: 'Make coffee at home instead',
    whyItWorks: 'Small daily decisions compound. This habit alone saves $2,000+ annually.'
  },
  {
    id: '2', 
    name: 'Cook vs Delivery',
    icon: <Utensils className="h-5 w-5" />,
    avgSaving: 15.00,
    category: 'Meals',
    description: 'Home cooking vs takeout',
    whyItWorks: 'Cooking builds two habits: saving money and eating healthier. Double win!'
  },
  {
    id: '3',
    name: 'Walk vs Ride Share', 
    icon: <Car className="h-5 w-5" />,
    avgSaving: 8.00,
    category: 'Transport',
    description: 'Walk short distances',
    whyItWorks: 'Exercise + savings + environmental impact. Triple benefit for your future.'
  },
  {
    id: '4',
    name: 'Skip Impulse Buys',
    icon: <ShoppingCart className="h-5 w-5" />,
    avgSaving: 12.00,
    category: 'Shopping',
    description: 'Think before you buy',
    whyItWorks: 'The 24-hour rule prevents 80% of regrettable purchases. Your wallet will thank you.'
  },
  {
    id: '5',
    name: 'Cancel Unused Subscriptions',
    icon: <Gamepad2 className="h-5 w-5" />,
    avgSaving: 20.00,
    category: 'Subscriptions',
    description: 'Audit your monthly bills',
    whyItWorks: 'Most people have $273 in forgotten subscriptions. This is found money!'
  }
];

interface OnboardingFlowProps {
  onComplete: () => void;
  mode?: 'standard' | 'educational';
}

export default function InteractiveOnboardingFlow({ onComplete, mode = 'standard' }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState(5000);
  const [goalTimeframe, setGoalTimeframe] = useState(24);
  const [goalMotivation, setGoalMotivation] = useState('');
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [saveAmount, setSaveAmount] = useState('5');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  // Confetti animation trigger
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const calculateCompoundInterest = (dailyAmount: number, years: number, annualReturn = 0.08) => {
    const dailyReturn = annualReturn / 365;
    const days = years * 365;
    const futureValue = dailyAmount * (((1 + dailyReturn) ** days - 1) / dailyReturn);
    return futureValue;
  };

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

  const handleNext = async () => {
    // Add celebration animation
    setShowConfetti(true);
    
    if (currentStep === 0) {
      await createFirstGoal();
    } else if (currentStep === 1) {
      await createFirstSave();
    } else if (currentStep === 3) {
      await saveContactInfo();
    } else if (currentStep === 4) {
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
          title: goalName || 'My Financial Goal',
          target_cents: goalAmount * 100,
          emoji: '🎯'
        });

      if (error) throw error;
      
      toast({
        title: "🎯 Goal Created!",
        description: `${goalName} is now your target!`,
      });
    } catch (error) {
      console.error('Error creating goal:', error);
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
          reason: 'First save from onboarding habits'
        });

      if (error) throw error;

      toast({
        title: "🎉 First Save Complete!",
        description: `You've saved $${dailySavings.toFixed(2)} and started your wealth journey!`,
      });
    } catch (error) {
      console.error('Error creating save:', error);
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
        title: "📱 Connected!",
        description: "We'll celebrate your wins and keep you motivated",
      });
    } catch (error) {
      console.error('Error saving contact info:', error);
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
          email: user.email || email,
          phone: phone || null,
          mode: mode,
          completed_onboarding: true,
          onboarding_completed_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) throw error;
      
      toast({
        title: "🚀 Welcome to Your Wealth Journey!",
        description: "Every small step from here builds your financial future",
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
      case 0: return goalName.length > 0 && goalAmount > 0;
      case 1: return selectedHabits.length > 0;
      case 2: return true; // Just viewing compound interest
      case 3: return true; // Contact info is optional
      case 4: return true; // Final step
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 animate-pulse">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 bg-primary rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Progress Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-4">
            <PiggyBank className="h-8 w-8 text-primary animate-pulse" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Livin Salti
            </h1>
          </div>
          <Progress value={progress} className="mb-4" />
          <Badge variant="outline" className="mb-2">
            Step {currentStep + 1} of {steps.length}
          </Badge>
          <p className="text-sm text-muted-foreground">Building your personalized wealth plan</p>
        </div>

        {/* Main Card */}
        <Card className={`mb-6 bg-gradient-to-br ${currentStepData.bgColor} border-0 shadow-xl hover:shadow-2xl transition-all duration-500`}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-background/80 backdrop-blur w-fit animate-scale-in">
              {currentStepData.icon}
            </div>
            <CardTitle className="text-2xl mb-2">{currentStepData.title}</CardTitle>
            <CardDescription className="text-lg font-medium text-foreground/80">
              {currentStepData.subtitle}
            </CardDescription>
            <p className="text-muted-foreground mt-2">{currentStepData.description}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Why This Matters Box */}
            <div className="bg-background/60 backdrop-blur p-4 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">Why This Step Matters</span>
              </div>
              <p className="text-sm text-muted-foreground">{currentStepData.whyMessage}</p>
            </div>

            {/* Step Content */}
            {currentStep === 0 && (
              <div className="space-y-6">
                {/* Goal Types */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">What's your biggest financial dream?</Label>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { name: 'Emergency Fund', icon: '🛡️', amount: 5000 },
                      { name: 'Dream Vacation', icon: '🏖️', amount: 3000 },
                      { name: 'New Car', icon: '🚗', amount: 15000 },
                      { name: 'House Down Payment', icon: '🏠', amount: 50000 }
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
                </div>

                {/* Custom Goal */}
                <div>
                  <Label htmlFor="customGoal">Or create your own goal:</Label>
                  <Input
                    id="customGoal"
                    placeholder="e.g., Kids College Fund, Wedding, Investment Account"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    className="mt-2"
                  />
                </div>

                {/* Goal Amount Slider */}
                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <DollarSign className="h-4 w-4" />
                    Target Amount: ${goalAmount.toLocaleString()}
                  </Label>
                  <Slider
                    value={[goalAmount]}
                    onValueChange={(value) => setGoalAmount(value[0])}
                    max={100000}
                    min={500}
                    step={500}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$500</span>
                    <span>$100,000</span>
                  </div>
                </div>

                {/* Timeframe */}
                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4" />
                    Timeline: {goalTimeframe} months
                  </Label>
                  <Slider
                    value={[goalTimeframe]}
                    onValueChange={(value) => setGoalTimeframe(value[0])}
                    max={60}
                    min={6}
                    step={6}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>6 months</span>
                    <span>5 years</span>
                  </div>
                </div>

                {/* Motivation */}
                <div>
                  <Label htmlFor="motivation">What's your deeper 'why' for this goal?</Label>
                  <Input
                    id="motivation"
                    placeholder="e.g., Peace of mind, freedom to travel, security for family..."
                    value={goalMotivation}
                    onChange={(e) => setGoalMotivation(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Goals with emotional connection are 42% more likely to succeed
                  </p>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Select the habits you're willing to change. Each one is a money-making machine!
                  </p>
                </div>
                
                <div className="space-y-3">
                  {availableHabits.map((habit) => (
                    <Card
                      key={habit.id}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-102 ${
                        selectedHabits.includes(habit.id) 
                          ? 'border-primary bg-primary/5 shadow-md' 
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => toggleHabit(habit.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full transition-colors ${
                              selectedHabits.includes(habit.id) ? 'bg-primary/20' : 'bg-muted/50'
                            }`}>
                              {habit.icon}
                            </div>
                            <div>
                              <h4 className="font-semibold">{habit.name}</h4>
                              <p className="text-sm text-muted-foreground">{habit.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-success">
                              ${habit.avgSaving}/day
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ${(habit.avgSaving * 365).toLocaleString()}/year
                            </div>
                          </div>
                        </div>
                        
                        {selectedHabits.includes(habit.id) && (
                          <div className="mt-3 p-2 bg-success/10 rounded-lg animate-fade-in">
                            <div className="flex items-center gap-1 text-success">
                              <CheckCircle2 className="h-3 w-3" />
                              <span className="text-xs font-medium">Added to your wealth plan!</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{habit.whyItWorks}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedHabits.length > 0 && (
                  <Card className="bg-gradient-to-r from-success/10 to-primary/10 border-success/30 animate-scale-in">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-success mb-1">
                        ${calculateSelectedHabitsTotal().toFixed(2)}/day
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Your selected habits save ${(calculateSelectedHabitsTotal() * 365).toLocaleString()} per year!
                      </p>
                      <div className="mt-2 flex items-center justify-center gap-1 text-xs text-success">
                        <Trophy className="h-3 w-3" />
                        That's ${Math.round(calculateCompoundInterest(calculateSelectedHabitsTotal(), 10)).toLocaleString()} in 10 years with compound growth!
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">🚀 Your Wealth Time Machine</h3>
                  <p className="text-muted-foreground">
                    Watch your ${calculateSelectedHabitsTotal().toFixed(2)}/day habit transform into life-changing wealth
                  </p>
                </div>

                {/* Interactive Compound Calculator */}
                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-6 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    {[10, 20, 40].map((years) => (
                      <div key={years} className="bg-background/80 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          ${Math.round(calculateCompoundInterest(calculateSelectedHabitsTotal(), years)).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">After {years} years</div>
                        <div className="text-xs text-success mt-1">
                          +{Math.round(((calculateCompoundInterest(calculateSelectedHabitsTotal(), years) / (calculateSelectedHabitsTotal() * 365 * years)) - 1) * 100)}% from compound growth
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Why Compound Interest Works */}
                <div className="space-y-4">
                  <Card className="bg-accent/5 border-accent/20">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-accent mb-2 flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        The Mathematics of Wealth
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Your money doesn't just save - it grows on its growth! Each year, your savings earn ~8% returns, 
                        and those returns start earning returns too. This is how small habits become massive wealth.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                        <Timer className="h-4 w-4" />
                        Time is Your Secret Weapon
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Starting today vs waiting 10 years could mean hundreds of thousands more dollars. 
                        Every day you wait is compounding power lost forever.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Goal Achievement Status */}
                <Card className="bg-gradient-to-r from-success/10 to-accent/10 border-success/30">
                  <CardContent className="p-6 text-center">
                    <h4 className="font-bold text-success mb-3">
                      Your "{goalName}" Goal Status
                    </h4>
                    
                    {calculateCompoundInterest(calculateSelectedHabitsTotal(), goalTimeframe / 12) >= goalAmount ? (
                      <div className="space-y-2">
                        <div className="text-4xl">🎉</div>
                        <p className="font-semibold text-success">
                          SUCCESS! Your habits will reach your ${goalAmount.toLocaleString()} goal in {goalTimeframe} months!
                        </p>
                        <p className="text-sm text-muted-foreground">
                          You'll have ${Math.round(calculateCompoundInterest(calculateSelectedHabitsTotal(), goalTimeframe / 12) - goalAmount).toLocaleString()} extra!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-4xl">📈</div>
                        <p className="font-semibold text-primary">
                          You'll reach {Math.round((calculateCompoundInterest(calculateSelectedHabitsTotal(), goalTimeframe / 12) / goalAmount) * 100)}% of your goal!
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${Math.round(calculateCompoundInterest(calculateSelectedHabitsTotal(), goalTimeframe / 12)).toLocaleString()} toward your ${goalAmount.toLocaleString()} target
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    How can we celebrate your wins and keep you motivated? (Optional but recommended)
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-success/5 border-success/20 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="h-4 w-4 text-success" />
                      <span className="font-semibold text-sm">We'll Send You</span>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Weekly progress celebrations</li>
                      <li>• Streak milestone rewards</li>
                      <li>• Personalized saving tips</li>
                    </ul>
                  </Card>
                  
                  <Card className="bg-primary/5 border-primary/20 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">Join Our Community</span>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Connect with other savers</li>
                      <li>• Share your success stories</li>
                      <li>• Get motivation when you need it</li>
                    </ul>
                  </Card>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 text-center">
                <div className="text-6xl animate-bounce">🚀</div>
                <h3 className="text-2xl font-bold">You're Ready to Build Wealth!</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your personalized wealth plan is ready. Every save from here builds toward your "{goalName}" goal.
                </p>

                <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4">Your Wealth-Building Blueprint</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Daily Habit Savings:</span>
                        <span className="font-bold text-success">${calculateSelectedHabitsTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Annual Projection:</span>
                        <span className="font-bold text-primary">${(calculateSelectedHabitsTotal() * 365).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>10-Year Compound Growth:</span>
                        <span className="font-bold text-accent">${Math.round(calculateCompoundInterest(calculateSelectedHabitsTotal(), 10)).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-success/10 p-4 rounded-lg">
                  <p className="text-sm text-success font-medium">
                    🎯 Remember: Consistency beats perfection. Every small habit you build today writes your success story for tomorrow.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 0 || loading}
          >
            ← Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {[...Array(steps.length)].map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          
          <Button 
            onClick={handleNext}
            disabled={!canProceed() || loading}
            className="min-w-[100px]"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : currentStep === steps.length - 1 ? (
              <>
                Start Saving! <Rocket className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}