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
    targetAmount: 0,
    timeframe: 12,
    selectedHabits: [],
    motivation: ''
  });

  const [availableHabits, setAvailableHabits] = useState<Habit[]>([
    {
      id: '1',
      name: 'Skip Coffee Shop',
      icon: <Coffee className="h-5 w-5" />,
      avgSaving: 5.50,
      category: 'food',
      description: 'Make coffee at home instead of buying daily',
      selected: false
    },
    {
      id: '2',
      name: 'Cook vs Delivery',
      icon: <Utensils className="h-5 w-5" />,
      avgSaving: 15.00,
      category: 'food', 
      description: 'Cook meals instead of ordering takeout',
      selected: false
    },
    {
      id: '3',
      name: 'Walk vs Ride Share',
      icon: <Car className="h-5 w-5" />,
      avgSaving: 8.00,
      category: 'transport',
      description: 'Walk short distances instead of using Uber/Lyft',
      selected: false
    },
    {
      id: '4',
      name: 'Skip Impulse Buys',
      icon: <ShoppingCart className="h-5 w-5" />,
      avgSaving: 12.00,
      category: 'shopping',
      description: 'Think twice before unplanned purchases',
      selected: false
    },
    {
      id: '5',
      name: 'Skip Subscription Services',
      icon: <Gamepad2 className="h-5 w-5" />,
      avgSaving: 20.00,
      category: 'entertainment',
      description: 'Cancel unused streaming/gaming subscriptions',
      selected: false
    }
  ]);

  const steps = [
    {
      title: "What's Your Goal?",
      description: "Let's start with your 'why' - what are you saving for?",
      icon: <Target className="h-6 w-6" />
    },
    {
      title: "Choose Your Habits",
      description: "Which daily decisions could become wealth-building habits?",
      icon: <CheckCircle className="h-6 w-6" />
    },
    {
      title: "See Your Future",
      description: "Watch your small habits transform into life-changing wealth",
      icon: <Sparkles className="h-6 w-6" />
    },
    {
      title: "Let's Start!",
      description: "You're ready to begin building wealth through daily habits",
      icon: <ArrowRight className="h-6 w-6" />
    }
  ];

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
    const futureValue = annualSavings * goalData.timeframe * 1.08; // Simple 8% return
    return { dailySavings, annualSavings, futureValue };
  };

  const handleNext = () => {
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
      <div className="max-w-2xl mx-auto">
        {/* Progress Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-primary">Welcome to Livin Salti</h2>
                <Badge variant="outline">
                  Step {currentStep + 1} of {steps.length}
                </Badge>
              </div>
              <Progress value={progressPercentage} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Building wealth through small daily habits
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-full">
                {steps[currentStep].icon}
              </div>
              <div>
                <CardTitle className="text-lg">{steps[currentStep].title}</CardTitle>
                <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Step 0: Goal Setting */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="goalName">What are you saving for?</Label>
                  <Input
                    id="goalName"
                    placeholder="e.g., Emergency fund, vacation, down payment"
                    value={goalData.name}
                    onChange={(e) => setGoalData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="targetAmount">How much do you want to save?</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="targetAmount"
                      type="number"
                      placeholder="5000"
                      value={goalData.targetAmount || ''}
                      onChange={(e) => setGoalData(prev => ({ ...prev, targetAmount: parseFloat(e.target.value) || 0 }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>In how many months?</Label>
                  <div className="flex gap-3 mt-2">
                    {[6, 12, 18, 24].map((months) => (
                      <Button
                        key={months}
                        variant={goalData.timeframe === months ? "default" : "outline"}
                        size="sm"
                        onClick={() => setGoalData(prev => ({ ...prev, timeframe: months }))}
                      >
                        {months} months
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Real-world examples */}
                <Card className="bg-accent/10 border-accent/20">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm mb-2">💡 Popular Goals</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>• Emergency Fund: $5,000</div>
                      <div>• Vacation: $3,000</div>
                      <div>• Car Down Payment: $8,000</div>
                      <div>• Wedding: $15,000</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 1: Habit Selection */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select the habits you're willing to change. Each represents real money over time.
                </p>
                
                <div className="space-y-3">
                  {availableHabits.map((habit) => (
                    <Card 
                      key={habit.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        habit.selected ? 'border-primary/30 bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => toggleHabit(habit.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${habit.selected ? 'bg-primary/20' : 'bg-muted/20'}`}>
                              {habit.icon}
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm">{habit.name}</h4>
                              <p className="text-xs text-muted-foreground">{habit.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-success">${habit.avgSaving}/day</p>
                            <p className="text-xs text-muted-foreground">
                              ${(habit.avgSaving * 365).toLocaleString()}/year
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {goalData.selectedHabits.length > 0 && (
                  <Card className="bg-success/10 border-success/20">
                    <CardContent className="p-4 text-center">
                      <p className="font-semibold text-success">
                        Selected habits could save you ${calculateProjection().dailySavings.toFixed(2)}/day
                      </p>
                      <p className="text-xs text-muted-foreground">
                        That's ${calculateProjection().annualSavings.toLocaleString()}/year!
                      </p>
                    </CardContent>
                  </Card>
                )}
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