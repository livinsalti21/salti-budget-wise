import { useState } from "react";
import { Trophy, TrendingUp, Target, Sparkles, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLedger } from "@/hooks/useLedger";
import { useProfile } from "@/hooks/useProfile";
import { motion, AnimatePresence } from "framer-motion";

export default function WealthJourneyHero() {
  const { accountSummary } = useLedger();
  const { streakInfo } = useProfile();
  const [milestoneProgress, setMilestoneProgress] = useState(0);
  const [nextMilestone, setNextMilestone] = useState(1000);
  const [wealthLevel, setWealthLevel] = useState("Getting Started");
  const [showCelebration, setShowCelebration] = useState(false);

  const currentBalance = (accountSummary?.current_balance_cents || 0) / 100;
  const futureValue = currentBalance * 40; // Simple projection for display
  const currentStreak = streakInfo?.current || 0;

  // Calculate milestone progress and wealth level
  const milestones = [100, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];
  const currentMilestoneIndex = milestones.findIndex(milestone => currentBalance < milestone);
  const targetMilestone = currentMilestoneIndex === -1 ? 250000 : milestones[currentMilestoneIndex];
  const previousMilestone = currentMilestoneIndex <= 0 ? 0 : milestones[currentMilestoneIndex - 1];
  const progress = ((currentBalance - previousMilestone) / (targetMilestone - previousMilestone)) * 100;

  // Determine wealth level
  const getWealthLevel = (balance: number) => {
    if (balance >= 100000) return { level: "Wealth Builder", icon: "👑", color: "from-yellow-500 to-orange-600" };
    if (balance >= 50000) return { level: "Prosperity Seeker", icon: "💎", color: "from-purple-500 to-blue-600" };
    if (balance >= 25000) return { level: "Growth Accelerator", icon: "🚀", color: "from-blue-500 to-green-600" };
    if (balance >= 10000) return { level: "Momentum Builder", icon: "⚡", color: "from-green-500 to-teal-600" };
    if (balance >= 5000) return { level: "Steady Saver", icon: "🎯", color: "from-teal-500 to-cyan-600" };
    if (balance >= 1000) return { level: "Rising Star", icon: "⭐", color: "from-cyan-500 to-blue-500" };
    if (balance >= 100) return { level: "First Steps", icon: "🌱", color: "from-emerald-500 to-teal-500" };
    return { level: "Getting Started", icon: "🌟", color: "from-orange-500 to-red-500" };
  };

  const wealthData = getWealthLevel(currentBalance);

  const handleShare = async () => {
    const message = `I'm building my wealth with Livin Salti! Currently at ${wealthData.level} level with $${currentBalance.toLocaleString()} saved and on a ${currentStreak}-day streak! 💪 #WealthBuilding #FinancialFreedom`;
    
    if (navigator.share) {
      await navigator.share({ text: message });
    } else {
      await navigator.clipboard.writeText(message);
    }
  };

  const triggerCelebration = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-success/5"></div>
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-r from-primary/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-gradient-to-l from-success/10 to-transparent rounded-full blur-2xl animate-pulse delay-1000"></div>

      <Card className="relative border-0 bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            {/* Left side - Wealth Status */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`text-3xl bg-gradient-to-r ${wealthData.color} bg-clip-text text-transparent font-bold`}>
                  {wealthData.icon}
                </div>
                <div>
                  <Badge 
                    variant="secondary" 
                    className={`bg-gradient-to-r ${wealthData.color} text-white border-0 hover:shadow-lg transition-all duration-300`}
                  >
                    {wealthData.level}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="ml-2 h-6 text-muted-foreground hover:text-primary"
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Current Wealth */}
                <div className="text-center md:text-left">
                  <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                    ${currentBalance.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Current Wealth</p>
                </div>

                {/* Money Working */}
                <div className="text-center md:text-left">
                  <div className="text-2xl md:text-3xl font-bold text-success mb-1">
                    ${futureValue.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Money Working (40yr)</p>
                </div>

                {/* Saving Streak */}
                <div className="text-center md:text-left">
                  <div className="text-2xl md:text-3xl font-bold text-accent mb-1">
                    {currentStreak} days
                  </div>
                  <p className="text-sm text-muted-foreground">Saving Streak</p>
                </div>
              </div>
            </div>

            {/* Right side - Milestone Progress */}
            <div className="flex-1 max-w-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Next Milestone</span>
                </div>
                <span className="text-lg font-bold text-primary">
                  ${targetMilestone.toLocaleString()}
                </span>
              </div>
              
              <div className="space-y-2">
                <Progress value={Math.min(progress, 100)} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${previousMilestone.toLocaleString()}</span>
                  <span>{Math.round(progress)}% complete</span>
                  <span>${targetMilestone.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-center p-4 bg-gradient-to-r from-success/10 to-accent/10 rounded-lg border border-success/20">
                <Sparkles className="h-5 w-5 text-success mx-auto mb-2" />
                <p className="text-sm font-medium text-success">
                  "Every save brings you closer to financial freedom"
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="text-6xl">🎉</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}