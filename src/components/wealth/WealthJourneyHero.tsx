import { useState } from "react";
import { Trophy, TrendingUp, Target, Sparkles, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLedger } from "@/hooks/useLedger";
import { useProfile } from "@/hooks/useProfile";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
export default function WealthJourneyHero() {
  const {
    accountSummary
  } = useLedger();
  const {
    streakInfo
  } = useProfile();
  const {
    user
  } = useAuth();
  const [milestoneProgress, setMilestoneProgress] = useState(0);
  const [nextMilestone, setNextMilestone] = useState(1000);
  const [wealthLevel, setWealthLevel] = useState("Getting Started");
  const [showCelebration, setShowCelebration] = useState(false);
  const currentBalance = (accountSummary?.current_balance_cents || 0) / 100;
  const futureValue40Years = (accountSummary?.projected_40yr_value_cents || 0) / 100;
  const currentStreak = streakInfo?.current || 0;

  // Calculate milestone progress and wealth level
  const milestones = [100, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];
  const currentMilestoneIndex = milestones.findIndex(milestone => currentBalance < milestone);
  const targetMilestone = currentMilestoneIndex === -1 ? 250000 : milestones[currentMilestoneIndex];
  const previousMilestone = currentMilestoneIndex <= 0 ? 0 : milestones[currentMilestoneIndex - 1];
  const progress = (currentBalance - previousMilestone) / (targetMilestone - previousMilestone) * 100;

  // Determine wealth level
  const getWealthLevel = (balance: number) => {
    if (balance >= 100000) return {
      level: "Wealth Builder",
      icon: "👑",
      color: "from-yellow-500 to-orange-600"
    };
    if (balance >= 50000) return {
      level: "Prosperity Seeker",
      icon: "💎",
      color: "from-purple-500 to-blue-600"
    };
    if (balance >= 25000) return {
      level: "Growth Accelerator",
      icon: "🚀",
      color: "from-blue-500 to-green-600"
    };
    if (balance >= 10000) return {
      level: "Momentum Builder",
      icon: "⚡",
      color: "from-green-500 to-teal-600"
    };
    if (balance >= 5000) return {
      level: "Steady Saver",
      icon: "🎯",
      color: "from-teal-500 to-cyan-600"
    };
    if (balance >= 1000) return {
      level: "Rising Star",
      icon: "⭐",
      color: "from-cyan-500 to-blue-500"
    };
    if (balance >= 100) return {
      level: "First Steps",
      icon: "🌱",
      color: "from-emerald-500 to-teal-500"
    };
    return {
      level: "Getting Started",
      icon: "🌟",
      color: "from-orange-500 to-red-500"
    };
  };
  const wealthData = getWealthLevel(currentBalance);
  const handleShare = async () => {
    const message = `I'm building my wealth with Livin Salti! Currently at ${wealthData.level} level with $${currentBalance.toLocaleString()} saved and on a ${currentStreak}-day streak! 💪 #WealthBuilding #FinancialFreedom`;
    if (navigator.share) {
      await navigator.share({
        text: message
      });
    } else {
      await navigator.clipboard.writeText(message);
    }
  };
  const triggerCelebration = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  // Subscribe to real-time wealth updates
  useEffect(() => {
    if (!user) return;
    const accountChannel = supabase.channel('wealth-journey-updates').on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'user_accounts',
      filter: `user_id=eq.${user.id}`
    }, payload => {
      console.log('🎉 Wealth journey updated in real-time!', payload);
      // Trigger celebration animation on wealth update
      triggerCelebration();
    }).subscribe();
    return () => {
      supabase.removeChannel(accountChannel);
    };
  }, [user]);
  return <div className="relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-success/5"></div>
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-r from-primary/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-gradient-to-l from-success/10 to-transparent rounded-full blur-2xl animate-pulse delay-1000"></div>

      <Card className="relative border-0 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm shadow-xl overflow-hidden">
        <CardContent className="p-6 md:p-8">
          {/* Top Row - Status Badge & Share */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              
              
            </div>
            
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center md:text-left space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Current Balance</p>
              <div className="text-3xl md:text-4xl font-bold text-foreground">
                ${currentBalance.toLocaleString()}
              </div>
            </div>

            <div className="text-center md:text-left space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">40 Year Value @ 10%</p>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-success to-accent bg-clip-text text-transparent">
                ${futureValue40Years.toLocaleString()}
              </div>
              <Badge className="bg-blue-500/10 text-blue-600 border-blue-300 text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                10% Annual Growth
              </Badge>
            </div>

            <div className="text-center md:text-left space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Streak</p>
              <div className="text-3xl md:text-4xl font-bold text-accent flex items-center justify-center md:justify-start gap-2">
                {currentStreak} 
                <span className="text-lg">days</span>
              </div>
            </div>
          </div>

          {/* Milestone Progress Section */}
          <div className="space-y-4 p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-muted-foreground">Next Milestone</span>
              </div>
              <span className="text-2xl font-bold text-primary">
                ${targetMilestone.toLocaleString()}
              </span>
            </div>
            
            <div className="space-y-2">
              <Progress value={Math.min(progress, 100)} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>${previousMilestone.toLocaleString()}</span>
                <span className="font-semibold">{Math.round(progress)}%</span>
                <span>${targetMilestone.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <Sparkles className="h-4 w-4 text-success" />
              <p className="text-sm text-center text-muted-foreground italic">
                Every save brings you closer to freedom
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && <motion.div initial={{
        opacity: 0,
        scale: 0.8
      }} animate={{
        opacity: 1,
        scale: 1
      }} exit={{
        opacity: 0,
        scale: 0.8
      }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-6xl">🎉</div>
          </motion.div>}
      </AnimatePresence>
    </div>;
}