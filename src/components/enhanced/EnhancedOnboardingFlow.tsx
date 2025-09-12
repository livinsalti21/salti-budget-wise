import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Coffee, Utensils, ShoppingCart, Car, Gamepad2, Target, DollarSign, Calendar, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface OnboardingProps {
  onComplete: () => void;
}

interface Habit {
  id: string;
  name: string;
  icon: React.ReactNode;
  avgSaving: number;
  category: 'food' | 'transport' | 'entertainment' | 'shopping';
  description: string;
  whyItWorks: string;
  selected: boolean;
}

interface GoalData {
  name: string;
  targetAmount: number;
  timeframe: number; // months
  selectedHabits: string[];
  motivation: string;
}

const EnhancedOnboardingFlow = ({ onComplete }: OnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [goalData, setGoalData] = useState<GoalData>({
    name: '',
    targetAmount: 5000,
    timeframe: 12,
    selectedHabits: [],
    motivation: ''
  });
  const [showConfetti, setShowConfetti] = useState(false);

  const [availableHabits, setAvailableHabits] = useState<Habit[]>([
    {
      id: '1',
      name: 'Skip Coffee Shop',
      icon: <Coffee className="h-5 w-5" />,
      avgSaving: 5.50,
      category: 'food',
      description: 'Make coffee at home instead of buying daily',
      whyItWorks: 'Small daily decisions compound. This habit alone saves $2,000+ annually and builds discipline.',
      selected: false
    },
    {
      id: '2',
      name: 'Cook vs Delivery',
      icon: <Utensils className="h-5 w-5" />,
      avgSaving: 15.00,
      category: 'food', 
      description: 'Cook meals instead of ordering takeout',
      whyItWorks: 'Cooking builds two habits: saving money and eating healthier. Double win for your future self!',
      selected: false
    },
    {
      id: '3',
      name: 'Walk vs Ride Share',
      icon: <Car className="h-5 w-5" />,
      avgSaving: 8.00,
      category: 'transport',
      description: 'Walk short distances instead of using Uber/Lyft',
      whyItWorks: 'Exercise + savings + environmental impact. Triple benefit that compounds your health and wealth.',
      selected: false
    },
    {
      id: '4',
      name: 'Skip Impulse Buys',
      icon: <ShoppingCart className="h-5 w-5" />,
      avgSaving: 12.00,
      category: 'shopping',
      description: 'Think twice before unplanned purchases',
      whyItWorks: 'The 24-hour rule prevents 80% of regrettable purchases. Your wallet and values will align.',
      selected: false
    },
    {
      id: '5',
      name: 'Cancel Unused Subscriptions',
      icon: <Gamepad2 className="h-5 w-5" />,
      avgSaving: 20.00,
      category: 'entertainment',
      description: 'Audit and cancel unused streaming/gaming subscriptions',
      whyItWorks: 'Most people have $273 in forgotten subscriptions. This is literally found money waiting for you!',
      selected: false
    }
  ]);

  const steps = [
    {
      title: "What's Your Financial Dream?",
      description: "Let's connect your savings to something that truly excites you",
      icon: <Heart className="h-6 w-6" />,
      whyMessage: "Goals with emotional connection are 42% more likely to be achieved. Your brain needs a clear, meaningful target."
    },
    {
      title: "Choose Your Wealth Habits",
      description: "Which daily decisions will become your secret money-making superpowers?",
      icon: <Zap className="h-6 w-6" />,
      whyMessage: "Small, consistent actions compound exponentially. A $5 daily habit becomes $1.3M over 40 years."
    },
    {
      title: "See Your Financial Future",
      description: "Watch how your small habits transform into life-changing wealth over time",
      icon: <Sparkles className="h-6 w-6" />,
      whyMessage: "Visualization activates the same brain patterns as actual achievement. Seeing your future motivates present action."
    },
    {
      title: "Let's Launch Your Journey!",
      description: "You're ready to join thousands building wealth through daily habits",
      icon: <ArrowRight className="h-6 w-6" />,
      whyMessage: "Starting today vs waiting 10 years could mean hundreds of thousands more dollars. Every moment counts."
    }
  ];

  // Confetti animation trigger
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const toggleHabit = (habitId: string) => {
    setAvailableHabits(prev => prev.map(habit => 
      habit.id === habitId 
        ? { ...habit, selected: !habit.selected }
        : habit
    ));

    setGoalData(prev => ({
      ...prev,
      selectedHabits: prev.selectedHabits.includes(habitId)
        ? prev.selectedHabits.filter(id => id !== habitId)
        : [...prev.selectedHabits, habitId]
    }));
  };

  const calculateProjection = () => {
    const selectedHabitObjects = availableHabits.filter(h => h.selected);
    const dailySavings = selectedHabitObjects.reduce((sum, habit) => sum + habit.avgSaving, 0);
    const annualSavings = dailySavings * 365;
    
    // Enhanced compound interest calculation
    const years = goalData.timeframe / 12;
    const monthlyReturn = 0.08 / 12; // 8% annual return
    const months = goalData.timeframe;
    
    // Compound interest formula for monthly contributions
    const futureValue = dailySavings * 30.44 * (((1 + monthlyReturn) ** months - 1) / monthlyReturn) * (1 + monthlyReturn);
    
    return { dailySavings, annualSavings, futureValue };
  };

  const handleNext = () => {
    // Celebration animation
    setShowConfetti(true);
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return goalData.name && goalData.targetAmount > 0;
      case 1: return goalData.selectedHabits.length > 0;
      case 2: return goalData.motivation;
      default: return true;
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0">
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
        <Card className="mb-6 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-primary">Welcome to Livin Salti</h2>
                <Badge variant="outline">
                  Step {currentStep + 1} of {steps.length}
                </Badge>
              </div>
              <Progress value={progressPercentage} className="w-full" />
              
              {/* Why This Matters Section */}
              <div className="bg-background/60 backdrop-blur p-4 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Why This Step Matters</span>
                </div>
                <p className="text-sm text-muted-foreground">{steps[currentStep].whyMessage}</p>
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                Building wealth through small daily habits - every decision counts
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card className="mb-6 shadow-xl hover:shadow-2xl transition-all duration-500">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-4 bg-primary/10 rounded-full animate-pulse">
                {steps[currentStep].icon}
              </div>
              <div>
                <CardTitle className="text-xl">{steps[currentStep].title}</CardTitle>
                <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Step 0: Goal Setting */}
            {currentStep === 0 && (
              <div className="space-y-6">
                {/* Emotional Goal Selection */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">What financial dream keeps you up at night?</Label>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { name: 'Emergency Fund', emoji: '🛡️', description: 'Peace of mind', amount: 5000 },
                      { name: 'Dream Vacation', emoji: '🏖️', description: 'Create memories', amount: 3000 },
                      { name: 'New Car', emoji: '🚗', description: 'Reliable transport', amount: 15000 },
                      { name: 'House Down Payment', emoji: '🏠', description: 'Build equity', amount: 50000 },
                      { name: 'Investment Portfolio', emoji: '📈', description: 'Grow wealth', amount: 10000 },
                      { name: 'Family Security', emoji: '👨‍👩‍👧‍👦', description: 'Protect loved ones', amount: 25000 }
                    ].map((goal) => (
                      <Button
                        key={goal.name}
                        variant={goalData.name === goal.name ? "default" : "outline"}
                        className="h-auto p-4 text-left hover:scale-105 transition-transform"
                        onClick={() => {
                          setGoalData(prev => ({ ...prev, name: goal.name, targetAmount: goal.amount }));
                        }}
                      >
                        <div className="space-y-1">
                          <div className="text-xl">{goal.emoji}</div>
                          <div className="font-medium text-sm">{goal.name}</div>
                          <div className="text-xs text-muted-foreground">{goal.description}</div>
                          <div className="text-xs font-bold text-success">${goal.amount.toLocaleString()}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom Goal Input */}
                <div>
                  <Label htmlFor="goalName">Or describe your custom dream:</Label>
                  <Input
                    id="goalName"
                    placeholder="e.g., Kids college fund, wedding, business startup..."
                    value={goalData.name}
                    onChange={(e) => setGoalData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-2"
                  />
                </div>
                
                {/* Interactive Amount Slider */}
                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <DollarSign className="h-4 w-4" />
                    Target Amount: ${goalData.targetAmount.toLocaleString()}
                  </Label>
                  <Slider
                    value={[goalData.targetAmount]}
                    onValueChange={(value) => setGoalData(prev => ({ ...prev, targetAmount: value[0] }))}
                    max={100000}
                    min={1000}
                    step={1000}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$1,000</span>
                    <span>$100,000+</span>
                  </div>
                </div>

                {/* Timeline Slider */}
                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4" />
                    Timeline: {goalData.timeframe} months ({Math.round(goalData.timeframe / 12 * 10) / 10} years)
                  </Label>
                  <Slider
                    value={[goalData.timeframe]}
                    onValueChange={(value) => setGoalData(prev => ({ ...prev, timeframe: value[0] }))}
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

                {/* Success Preview */}
                {goalData.name && goalData.targetAmount > 0 && (
                  <Card className="bg-gradient-to-r from-success/10 to-primary/10 border-success/30 animate-fade-in">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">🎯</div>
                      <p className="font-semibold text-success">
                        {goalData.name}: ${goalData.targetAmount.toLocaleString()} in {goalData.timeframe} months
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        That's ${Math.round(goalData.targetAmount / goalData.timeframe).toLocaleString()} per month
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Step 1: Enhanced Habit Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Select habits you're willing to change. <strong>Each one is a money-making machine!</strong>
                  </p>
                  
                  {/* Live Calculator Preview */}
                  {goalData.selectedHabits.length > 0 && (
                    <Card className="bg-gradient-to-r from-success/10 to-primary/10 border-success/30 mb-4 animate-scale-in">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-success mb-1">
                            ${calculateProjection().dailySavings.toFixed(2)}/day
                          </div>
                          <div className="text-sm text-muted-foreground">
                            = ${calculateProjection().annualSavings.toLocaleString()}/year
                          </div>
                          <div className="flex items-center justify-center gap-1 text-xs text-success mt-2">
                            <Trophy className="h-3 w-3" />
                            Projected wealth in {goalData.timeframe} months: ${Math.round(calculateProjection().futureValue).toLocaleString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
                
                <div className="space-y-3">
                  {availableHabits.map((habit) => (
                    <Card 
                      key={habit.id}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-102 ${
                        habit.selected ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-primary/50'
                      }`}
                      onClick={() => toggleHabit(habit.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full transition-all ${
                              habit.selected ? 'bg-primary/20 scale-110' : 'bg-muted/20'
                            }`}>
                              {habit.icon}
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm">{habit.name}</h4>
                              <p className="text-xs text-muted-foreground">{habit.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-success">${habit.avgSaving}/day</div>
                            <div className="text-xs text-muted-foreground">
                              ${(habit.avgSaving * 365).toLocaleString()}/year
                            </div>
                          </div>
                        </div>
                        
                        {habit.selected && (
                          <div className="mt-3 p-3 bg-success/10 rounded-lg border border-success/20 animate-fade-in">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="h-4 w-4 text-success" />
                              <span className="text-sm font-medium text-success">Added to your wealth plan!</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{habit.whyItWorks}</p>
                            
                            {/* Individual habit compound projection */}
                            <div className="mt-2 pt-2 border-t border-success/20">
                              <p className="text-xs text-success font-medium">
                                This habit alone becomes ${Math.round(habit.avgSaving * 365 * (goalData.timeframe / 12) * 1.08).toLocaleString()} in {goalData.timeframe} months
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Habit Categories Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                    <CardContent className="p-3 text-center">
                      <div className="text-xs text-muted-foreground">Selected Habits</div>
                      <div className="text-lg font-bold text-blue-600">{goalData.selectedHabits.length}</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
                    <CardContent className="p-3 text-center">
                      <div className="text-xs text-muted-foreground">Monthly Savings</div>
                      <div className="text-lg font-bold text-green-600">
                        ${Math.round(calculateProjection().dailySavings * 30.44).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 2: Future Projection */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary mb-2">Your Wealth Projection</h3>
                  <p className="text-muted-foreground">Here's what your habits could create:</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-r from-success/10 to-success/5 border-success/20">
                    <CardContent className="p-4 text-center">
                      <Calendar className="h-6 w-6 text-success mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Daily Savings</p>
                      <p className="text-xl font-bold text-success">
                        ${calculateProjection().dailySavings.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                    <CardContent className="p-4 text-center">
                      <Target className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Annual Total</p>
                      <p className="text-xl font-bold text-primary">
                        ${calculateProjection().annualSavings.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20">
                    <CardContent className="p-4 text-center">
                      <Sparkles className="h-6 w-6 text-accent mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Future Value</p>
                      <p className="text-xl font-bold text-accent">
                        ${Math.round(calculateProjection().futureValue).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
                  <CardContent className="p-6 text-center">
                    <h4 className="font-bold text-purple-700 dark:text-purple-300 mb-3">
                      Your "{goalData.name}" Goal Status
                    </h4>
                    
                    {calculateProjection().futureValue >= goalData.targetAmount ? (
                      <div className="space-y-2">
                        <div className="text-4xl">🎉</div>
                        <p className="font-semibold text-success">
                          Congratulations! Your selected habits will reach your ${goalData.targetAmount.toLocaleString()} goal
                        </p>
                        <p className="text-xs text-muted-foreground">
                          You'll have ${Math.round(calculateProjection().futureValue - goalData.targetAmount).toLocaleString()} extra!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-4xl">💪</div>
                        <p className="font-semibold text-warning">
                          You're {Math.round((calculateProjection().futureValue / goalData.targetAmount) * 100)}% of the way there!
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Consider adding more habits or extending your timeframe
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div>
                  <Label htmlFor="motivation">What motivates you most about this goal?</Label>
                  <Input
                    id="motivation"
                    placeholder="e.g., Freedom to travel, security for my family, financial independence"
                    value={goalData.motivation}
                    onChange={(e) => setGoalData(prev => ({ ...prev, motivation: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Ready to Start */}
            {currentStep === 3 && (
              <div className="space-y-6 text-center">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-2xl font-bold text-primary">You're All Set!</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your daily habit tracker is ready. Every small decision now builds toward your "{goalData.name}" goal.
                </p>

                <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4">Your Habit Blueprint</h4>
                    <div className="space-y-2">
                      {availableHabits
                        .filter(habit => habit.selected)
                        .map((habit) => (
                          <div key={habit.id} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              {habit.icon}
                              {habit.name}
                            </span>
                            <span className="font-semibold text-success">
                              ${habit.avgSaving}/day
                            </span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <p className="text-xs text-muted-foreground">
                  Remember: It's not about perfection, it's about progress. Every habit you build today writes your success story for tomorrow.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!canProceed()}
            className="min-w-24"
          >
            {currentStep === steps.length - 1 ? 'Start Saving!' : 'Continue'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedOnboardingFlow;