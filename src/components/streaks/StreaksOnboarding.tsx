import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Flame,
  Target,
  Trophy,
  Users,
  Calendar,
  TrendingUp,
  Star
} from 'lucide-react';

interface StreaksOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

const steps = [
  {
    icon: <Flame className="w-8 h-8 text-orange-500" />,
    title: "Welcome to Streaks",
    description: "Build momentum with daily saving habits",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Flame className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Streaks track your consecutive days of saving money, helping you build lasting financial habits.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <Calendar className="w-5 h-5 text-orange-500 mb-2" />
            <p className="text-sm font-medium">Daily Momentum</p>
            <p className="text-xs text-muted-foreground">Build consistency</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <Trophy className="w-5 h-5 text-primary mb-2" />
            <p className="text-sm font-medium">Earn Badges</p>
            <p className="text-xs text-muted-foreground">Unlock achievements</p>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: <Target className="w-8 h-8 text-primary" />,
    title: "How Streaks Work",
    description: "Simple daily actions that compound over time",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Target className="w-12 h-12 text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Every day you save money (any amount), your streak grows by one day.
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-success">✓</span>
            </div>
            <div>
              <p className="text-sm font-medium">Save any amount</p>
              <p className="text-xs text-muted-foreground">Even $1 counts toward your streak</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <Flame className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Streak increases</p>
              <p className="text-xs text-muted-foreground">Consecutive days build your streak</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center">
              <Trophy className="w-4 h-4 text-warning" />
            </div>
            <div>
              <p className="text-sm font-medium">Unlock rewards</p>
              <p className="text-xs text-muted-foreground">Longer streaks = better perks</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: <Trophy className="w-8 h-8 text-warning" />,
    title: "Streak Milestones & Badges",
    description: "Celebrate your progress with achievements",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-warning mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Earn badges and unlock rewards as your streaks grow longer.
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-success" />
              <span className="text-sm font-medium">7-Day Warrior</span>
            </div>
            <Badge variant="secondary" className="text-xs">Week 1</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">30-Day Champion</span>
            </div>
            <Badge variant="secondary" className="text-xs">Month 1</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-accent/20">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">100-Day Legend</span>
            </div>
            <Badge variant="secondary" className="text-xs">Elite</Badge>
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          🏆 Each milestone unlocks special rewards and perks
        </p>
      </div>
    )
  },
  {
    icon: <Users className="w-8 h-8 text-purple-500" />,
    title: "Social Streaks",
    description: "Share the journey with friends and family",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Users className="w-12 h-12 text-purple-500 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Connect with friends to see their streaks and motivate each other.
          </p>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-purple-500" />
              <p className="text-sm font-medium">Friend Leaderboards</p>
            </div>
            <p className="text-xs text-muted-foreground">
              See who has the longest streaks in your circle
            </p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium">Streak Challenges</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Compete in saving challenges with friends
            </p>
          </div>
          <div className="p-3 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-success" />
              <p className="text-sm font-medium">Group Goals</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Work together toward shared savings targets
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-info" />,
    title: "Streak Psychology",
    description: "Why streaks are so powerful for building habits",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 text-info mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Streaks tap into psychology to make saving feel rewarding and addictive.
          </p>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-info/10 rounded-lg border-l-4 border-info">
            <p className="text-sm font-medium mb-1">Visual Progress</p>
            <p className="text-xs text-muted-foreground">
              Seeing your streak number grow provides instant gratification
            </p>
          </div>
          <div className="p-3 bg-success/10 rounded-lg border-l-4 border-success">
            <p className="text-sm font-medium mb-1">Fear of Breaking</p>
            <p className="text-xs text-muted-foreground">
              The longer your streak, the less likely you are to skip a day
            </p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg border-l-4 border-primary">
            <p className="text-sm font-medium mb-1">Social Accountability</p>
            <p className="text-xs text-muted-foreground">
              Friends can see your progress, adding external motivation
            </p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            🧠 Studies show streak tracking increases habit formation by 40%
          </p>
        </div>
      </div>
    )
  },
  {
    icon: <Star className="w-8 h-8 text-accent" />,
    title: "Start Your First Streak",
    description: "Today is day one of your saving journey",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Star className="w-12 h-12 text-accent mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Ready to start building your streak? Here's how to make it stick.
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-success/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-success">1</span>
            </div>
            <div>
              <p className="text-sm font-medium">Start small</p>
              <p className="text-xs text-muted-foreground">Even $1-5 per day builds the habit</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-primary">2</span>
            </div>
            <div>
              <p className="text-sm font-medium">Set a reminder</p>
              <p className="text-xs text-muted-foreground">Same time each day works best</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-accent">3</span>
            </div>
            <div>
              <p className="text-sm font-medium">Track skipped purchases</p>
              <p className="text-xs text-muted-foreground">Coffee, snacks, impulse buys</p>
            </div>
          </div>
        </div>
        <div className="p-3 bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg border border-accent/20">
          <p className="text-xs text-center font-medium text-accent">
            🔥 Your streak starts with your very first save!
          </p>
        </div>
      </div>
    )
  }
];

export default function StreaksOnboarding({ onComplete, onSkip }: StreaksOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg border-2">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="text-xs">
              {currentStep + 1} of {steps.length}
            </Badge>
            <Button variant="ghost" size="sm" onClick={onSkip} className="text-xs">
              Skip
            </Button>
          </div>
          <Progress value={((currentStep + 1) / steps.length) * 100} className="mb-4" />
          <div className="mb-3">
            {currentStepData.icon}
          </div>
          <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
        </CardHeader>
        
        <CardContent className="pb-6">
          <div className="mb-6">
            {currentStepData.content}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={prevStep} 
              disabled={currentStep === 0}
              className="flex-1"
            >
              Previous
            </Button>
            <Button onClick={nextStep} className="flex-1">
              {currentStep === steps.length - 1 ? 'Start My Streak!' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}