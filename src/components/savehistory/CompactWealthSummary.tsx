import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, Flame } from 'lucide-react';
import { useLedger } from '@/hooks/useLedger';
import { useProfile } from '@/hooks/useProfile';

export default function CompactWealthSummary() {
  const { accountSummary } = useLedger();
  const { streakInfo } = useProfile();
  
  const currentBalance = (accountSummary?.current_balance_cents || 0) / 100;
  const currentStreak = streakInfo?.current || 0;
  
  // Calculate next milestone
  const milestones = [100, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];
  const currentMilestoneIndex = milestones.findIndex(milestone => currentBalance < milestone);
  const targetMilestone = currentMilestoneIndex === -1 ? 250000 : milestones[currentMilestoneIndex];
  const previousMilestone = currentMilestoneIndex <= 0 ? 0 : milestones[currentMilestoneIndex - 1];
  const progress = ((currentBalance - previousMilestone) / (targetMilestone - previousMilestone)) * 100;
  
  // Wealth level
  const getWealthLevel = (balance: number) => {
    if (balance >= 10000) return { level: "Momentum Builder", icon: "⚡", color: "from-green-500 to-teal-600" };
    if (balance >= 5000) return { level: "Steady Saver", icon: "🎯", color: "from-teal-500 to-cyan-600" };
    if (balance >= 1000) return { level: "Rising Star", icon: "⭐", color: "from-cyan-500 to-blue-500" };
    if (balance >= 100) return { level: "First Steps", icon: "🌱", color: "from-emerald-500 to-teal-500" };
    return { level: "Getting Started", icon: "🌟", color: "from-orange-500 to-red-500" };
  };
  
  const wealthData = getWealthLevel(currentBalance);
  const futureValue = currentBalance * 5; // Simple 5x projection for display

  return (
    <Card className="bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm border-primary/20">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          
          {/* Left - Current Status */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{wealthData.icon}</div>
              <Badge className={`bg-gradient-to-r ${wealthData.color} text-white border-0`}>
                {wealthData.level}
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">${currentBalance.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Current</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success">${futureValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Projected</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">{currentStreak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </div>
          
          {/* Right - Next Milestone */}
          <div className="flex-1 max-w-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Next Goal</span>
              </div>
              <span className="font-bold text-primary">
                ${targetMilestone.toLocaleString()}
              </span>
            </div>
            
            <div className="space-y-2">
              <Progress value={Math.min(progress, 100)} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>${previousMilestone.toLocaleString()}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-r from-success/10 to-accent/10 rounded-lg">
              <p className="text-xs text-success font-medium">
                ${(targetMilestone - currentBalance).toLocaleString()} to go!
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}