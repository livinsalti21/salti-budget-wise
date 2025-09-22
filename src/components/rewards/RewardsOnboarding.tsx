import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy,
  Star,
  Target,
  Zap,
  Gift,
  Crown,
  Heart
} from 'lucide-react';

interface RewardsOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

const steps = [
  {
    icon: <Trophy className="w-8 h-8 text-primary" />,
    title: "Welcome to Rewards",
    description: "Turn your saving habits into exciting rewards",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Your rewards page gamifies saving, making every dollar saved more exciting and meaningful.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <Target className="w-5 h-5 text-primary mb-2" />
            <p className="text-sm font-medium">Challenges</p>
            <p className="text-xs text-muted-foreground">Complete tasks</p>
          </div>
          <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
            <Gift className="w-5 h-5 text-accent mb-2" />
            <p className="text-sm font-medium">Earn Rewards</p>
            <p className="text-xs text-muted-foreground">Unlock perks</p>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: <Target className="w-8 h-8 text-info" />,
    title: "Active Challenges",
    description: "Complete tasks to earn points and rewards",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Target className="w-12 h-12 text-info mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Challenges give you specific goals that make saving feel like a game.
          </p>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-info/10 rounded-lg border border-info/20">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium">7-Day Streak</p>
              <Badge variant="secondary" className="text-xs">50 pts</Badge>
            </div>
            <Progress value={70} className="mb-1" />
            <p className="text-xs text-muted-foreground">5/7 days complete</p>
          </div>
          <div className="p-3 bg-success/10 rounded-lg border border-success/20">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium">Skip 10 Coffees</p>
              <Badge variant="secondary" className="text-xs">100 pts</Badge>
            </div>
            <Progress value={80} className="mb-1" />
            <p className="text-xs text-muted-foreground">8/10 saves complete</p>
          </div>
          <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium">Weekly Goal Hit</p>
              <Badge variant="secondary" className="text-xs">75 pts</Badge>
            </div>
            <Progress value={40} className="mb-1" />
            <p className="text-xs text-muted-foreground">$10/$25 saved this week</p>
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          🎯 Complete challenges to unlock amazing rewards!
        </p>
      </div>
    )
  },
  {
    icon: <Gift className="w-8 h-8 text-success" />,
    title: "Available Rewards",
    description: "Spend your points on exciting perks",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Gift className="w-12 h-12 text-success mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Redeem your earned points for real rewards that celebrate your progress.
          </p>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-success/10 rounded-lg border border-success/20">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium">Coffee Shop Coupon</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">50 pts</Badge>
                <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                  Claim
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">$5 off your next coffee</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium">Streaming Subscription</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">200 pts</Badge>
                <Button size="sm" variant="outline" className="text-xs px-2 py-1" disabled>
                  Locked
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">1 month Netflix/Spotify</p>
          </div>
          <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium">Premium Features</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">500 pts</Badge>
                <Button size="sm" variant="outline" className="text-xs px-2 py-1" disabled>
                  Locked
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">1 month Pro access</p>
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          💎 Higher point rewards unlock better perks!
        </p>
      </div>
    )
  },
  {
    icon: <Heart className="w-8 h-8 text-destructive" />,
    title: "Sponsor Perks",
    description: "Special rewards from your matched sponsors",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Heart className="w-12 h-12 text-destructive mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            When sponsors match your saves, they can also offer exclusive perks and rewards.
          </p>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-destructive" />
              <p className="text-sm font-medium">Local Business Discounts</p>
            </div>
            <p className="text-xs text-muted-foreground">
              15% off at participating restaurants and shops
            </p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium">VIP Community Access</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Exclusive events and sponsor meetups
            </p>
          </div>
          <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-warning" />
              <p className="text-sm font-medium">Bonus Matches</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Extra matching during special promotions
            </p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            💝 Connect with sponsors to unlock these special perks
          </p>
        </div>
      </div>
    )
  },
  {
    icon: <Star className="w-8 h-8 text-warning" />,
    title: "Point System Explained",
    description: "How to earn and maximize your rewards",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Star className="w-12 h-12 text-warning mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Understand how different actions earn you points in the rewards system.
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span className="text-sm">Daily Save</span>
            </div>
            <Badge variant="secondary" className="text-xs">+5 pts</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-sm">Weekly Goal Hit</span>
            </div>
            <Badge variant="secondary" className="text-xs">+25 pts</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-accent/20">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              <span className="text-sm">7-Day Streak</span>
            </div>
            <Badge variant="secondary" className="text-xs">+50 pts</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-warning rounded-full"></div>
              <span className="text-sm">Friend Referral</span>
            </div>
            <Badge variant="secondary" className="text-xs">+100 pts</Badge>
          </div>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg border">
          <p className="text-xs text-center text-muted-foreground">
            💡 <strong>Tip:</strong> Consistency beats big saves - daily points add up fast!
          </p>
        </div>
      </div>
    )
  },
  {
    icon: <Zap className="w-8 h-8 text-accent" />,
    title: "Maximizing Your Rewards",
    description: "Pro tips for earning more points",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Zap className="w-12 h-12 text-accent mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Smart strategies to accelerate your point earning and unlock better rewards faster.
          </p>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-success/10 rounded-lg border-l-4 border-success">
            <p className="text-sm font-medium mb-1">Stack Daily Saves</p>
            <p className="text-xs text-muted-foreground">
              Save small amounts daily instead of large weekly saves for more points
            </p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg border-l-4 border-primary">
            <p className="text-sm font-medium mb-1">Complete Challenge Combos</p>
            <p className="text-xs text-muted-foreground">
              Multiple challenges often overlap - maximize efficiency
            </p>
          </div>
          <div className="p-3 bg-accent/10 rounded-lg border-l-4 border-accent">
            <p className="text-sm font-medium mb-1">Invite Friends</p>
            <p className="text-xs text-muted-foreground">
              Referrals give huge point bonuses and make saving social
            </p>
          </div>
        </div>
        <div className="p-3 bg-gradient-to-r from-warning/10 to-accent/10 rounded-lg border border-warning/20">
          <p className="text-xs text-center font-medium text-warning">
            🚀 The rewards system makes every save count double!
          </p>
        </div>
      </div>
    )
  }
];

export default function RewardsOnboarding({ onComplete, onSkip }: RewardsOnboardingProps) {
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
              {currentStep === steps.length - 1 ? 'Start Earning!' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}