import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Sparkles, MapPin, Plane, Home, Car, GraduationCap, Heart, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LifestyleGoal {
  id: string;
  name: string;
  estimatedCost: number;
  icon: React.ReactNode;
  timeframe: string;
  description: string;
}

const FutureSelfVisualization = () => {
  const [currentSavings, setCurrentSavings] = useState(150); // $150 current
  const [yearsSlider, setYearsSlider] = useState([30]);
  const [selectedGoal, setSelectedGoal] = useState<string>('travel');

  const lifestyleGoals: LifestyleGoal[] = [
    {
      id: 'travel',
      name: 'World Travel Freedom',
      estimatedCost: 50000,
      icon: <Plane className="h-5 w-5" />,
      timeframe: '15-20 years',
      description: '6 months traveling each year without financial stress'
    },
    {
      id: 'home',
      name: 'Dream Home Down Payment',
      estimatedCost: 80000,
      icon: <Home className="h-5 w-5" />,
      timeframe: '10-15 years',
      description: '20% down payment on a $400k home'
    },
    {
      id: 'retire',
      name: 'Early Retirement',
      estimatedCost: 500000,
      icon: <Calendar className="h-5 w-5" />,
      timeframe: '25-30 years',
      description: 'Financial independence by age 55'
    },
    {
      id: 'education',
      name: "Kids' College Fund",
      estimatedCost: 200000,
      icon: <GraduationCap className="h-5 w-5" />,
      timeframe: '18-20 years',
      description: 'Full college tuition for 2 children'
    },
    {
      id: 'security',
      name: 'Ultimate Security',
      estimatedCost: 100000,
      icon: <Heart className="h-5 w-5" />,
      timeframe: '12-15 years',
      description: '2-year emergency fund + family protection'
    }
  ];

  // Calculate future value based on current trajectory
  const calculateFutureValue = (years: number) => {
    const annualReturn = 0.08;
    const weeklyContribution = 25; // Assume $25/week average based on habits
    const weeksPerYear = 52;
    
    // Future value of current savings
    const currentValue = currentSavings * Math.pow(1 + annualReturn, years);
    
    // Future value of regular contributions
    const contributionValue = (weeklyContribution * weeksPerYear) * 
      ((Math.pow(1 + annualReturn, years) - 1) / annualReturn);
    
    return currentValue + contributionValue;
  };

  const futureValue = calculateFutureValue(yearsSlider[0]);
  const selectedGoalData = lifestyleGoals.find(goal => goal.id === selectedGoal);
  const canAffordGoal = futureValue >= (selectedGoalData?.estimatedCost || 0);
  const progressPercentage = selectedGoalData ? Math.min(100, (futureValue / selectedGoalData.estimatedCost) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            Your Future Self Vision
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            See how your daily habits transform into life-changing possibilities
          </p>
        </CardHeader>
      </Card>

      {/* Years Slider */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Time Horizon</h3>
              <Badge variant="outline" className="text-sm px-3 py-1">
                {yearsSlider[0]} Years
              </Badge>
            </div>
            <div className="px-2">
              <Slider
                value={yearsSlider}
                onValueChange={setYearsSlider}
                max={40}
                min={5}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>5 years</span>
                <span>40 years</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projected Wealth */}
      <Card className="bg-gradient-to-r from-success/10 to-primary/10 border-success/20">
        <CardContent className="p-6 text-center">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Your wealth in {yearsSlider[0]} years</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
              ${Math.round(futureValue).toLocaleString()}
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <p className="text-xs text-muted-foreground">Current Savings</p>
                <p className="font-bold text-primary">${currentSavings}</p>
              </div>
              <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <p className="text-xs text-muted-foreground">Weekly Habit</p>
                <p className="font-bold text-accent">$25/week</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lifestyle Goals Selection */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">What Could This Enable?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lifestyleGoals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal.id)}
                className={`p-3 rounded-lg border text-left transition-all hover:shadow-md ${
                  selectedGoal === goal.id 
                    ? 'border-primary/30 bg-primary/10' 
                    : 'border-muted/30 bg-muted/5 hover:bg-muted/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {goal.icon}
                  <span className="font-medium text-sm">{goal.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  ${goal.estimatedCost.toLocaleString()}
                </p>
                <Badge variant="outline" className="text-xs">
                  {goal.timeframe}
                </Badge>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Goal Analysis */}
      {selectedGoalData && (
        <Card className={`${canAffordGoal ? 'bg-gradient-to-r from-success/10 to-success/5 border-success/20' : 'bg-gradient-to-r from-warning/10 to-warning/5 border-warning/20'}`}>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/50 dark:bg-black/20 rounded-full">
                  {selectedGoalData.icon}
                </div>
                <div>
                  <h4 className="font-semibold">{selectedGoalData.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedGoalData.description}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress toward goal</span>
                  <span className="font-semibold">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      canAffordGoal 
                        ? 'bg-gradient-to-r from-success to-success/80' 
                        : 'bg-gradient-to-r from-primary to-accent'
                    }`}
                    style={{ width: `${Math.min(100, progressPercentage)}%` }}
                  />
                </div>
              </div>

              {/* Result Message */}
              <div className={`p-4 rounded-lg border ${
                canAffordGoal 
                  ? 'bg-success/10 border-success/20' 
                  : 'bg-warning/10 border-warning/20'
              }`}>
                <p className="text-center font-semibold">
                  {canAffordGoal ? (
                    <>
                      🎉 You can achieve "{selectedGoalData.name}" in {yearsSlider[0]} years with your current habits!
                    </>
                  ) : (
                    <>
                      💪 You're {Math.round(progressPercentage)}% of the way to "{selectedGoalData.name}". 
                      Consider increasing your weekly saves or extending the timeline.
                    </>
                  )}
                </p>
                {!canAffordGoal && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Need ${(selectedGoalData.estimatedCost - futureValue).toLocaleString()} more
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Motivational CTA */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardContent className="p-6 text-center">
          <Sparkles className="h-8 w-8 text-purple-500 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-purple-700 dark:text-purple-300 mb-2">
            Your Future Starts Today
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Every small save today is a vote for the life you want to live tomorrow
          </p>
          <Button variant="outline" className="border-purple-500/30 text-purple-700 hover:bg-purple-500/10">
            <MapPin className="h-4 w-4 mr-2" />
            Set Your Vision
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FutureSelfVisualization;