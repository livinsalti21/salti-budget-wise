import { ArrowLeft, Gift, Target, Trophy, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import RewardsOnboarding from "@/components/rewards/RewardsOnboarding";

const rewards = [
  {
    id: 1,
    title: "Coffee Shop Gift Card",
    description: "$10 Starbucks gift card",
    requirement: "Complete 7-day streak",
    points: 100,
    unlocked: false,
    sponsor: "Starbucks"
  },
  {
    id: 2,
    title: "Pro Account Bonus",
    description: "+1 month Pro access",
    requirement: "Refer 5 friends",
    points: 500,
    unlocked: false,
    sponsor: "Livin Salti"
  },
  {
    id: 3,
    title: "Family Savings Bonus",
    description: "+2 months Pro for family",
    requirement: "90-day duo streak",
    points: 1000,
    unlocked: false,
    sponsor: "Livin Salti"
  }
];

const challenges = [
  {
    id: 1,
    title: "Week-long Warrior",
    description: "Save for 7 consecutive days",
    progress: 3,
    total: 7,
    reward: "Coffee Shop Gift Card",
    active: true
  },
  {
    id: 2,
    title: "Monthly Master",
    description: "Save $100 this month",
    progress: 45,
    total: 100,
    reward: "Pro Account Bonus",
    active: true
  }
];

export default function RewardsPage() {
  const [showRewardsOnboarding, setShowRewardsOnboarding] = useState(false);

  useEffect(() => {
    const completedRewardsOnboarding = localStorage.getItem('rewards_onboarding_completed');
    if (!completedRewardsOnboarding) {
      setTimeout(() => setShowRewardsOnboarding(true), 600);
    }
  }, []);

  const handleRewardsOnboardingComplete = () => {
    localStorage.setItem('rewards_onboarding_completed', 'true');
    setShowRewardsOnboarding(false);
  };

  return (
    <div className="pb-20 safe-area-top">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur p-4 border-b">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <Link to="/community">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-primary">Rewards</h1>
            <p className="text-sm text-muted-foreground">Earn perks and bonuses</p>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-6">
        {/* Active Challenges */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Active Challenges
          </h2>
          {challenges.map((challenge) => (
            <Card key={challenge.id} className="border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{challenge.title}</CardTitle>
                    <CardDescription>{challenge.description}</CardDescription>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{challenge.progress}/{challenge.total}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Reward: {challenge.reward}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Available Rewards */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Available Rewards
          </h2>
          <div className="space-y-3">
            {rewards.map((reward) => (
              <Card key={reward.id} className={reward.unlocked ? 'border-success/20 bg-success/5' : 'opacity-60'}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      {reward.unlocked ? (
                        <Gift className="h-6 w-6 text-success" />
                      ) : (
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold">{reward.title}</h3>
                        <Badge variant={reward.unlocked ? "default" : "secondary"} className="text-xs">
                          {reward.points} pts
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {reward.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Requirement: {reward.requirement}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Sponsored by {reward.sponsor}
                      </p>
                    </div>
                  </div>
                  {reward.unlocked && (
                    <Button className="w-full mt-3" size="sm">
                      Claim Reward
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Coming Soon */}
        <Card className="bg-muted/30">
          <CardContent className="text-center py-8">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">More rewards coming soon!</p>
            <p className="text-sm text-muted-foreground">
              Partner with local businesses and brands for exclusive perks
            </p>
          </CardContent>
        </Card>
      </main>

      {showRewardsOnboarding && (
        <RewardsOnboarding
          onComplete={handleRewardsOnboardingComplete}
          onSkip={handleRewardsOnboardingComplete}
        />
      )}
    </div>
  );
}