import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { TrendingUp, Target, Flame, Trophy, Crown, Share2, Zap } from 'lucide-react';
import { useLedger } from '@/hooks/useLedger';
import { useProfile } from '@/hooks/useProfile';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function WealthJourneyHero() {
  const { accountSummary, formatCurrency } = useLedger();
  const { streakInfo, formatCurrency: profileFormatCurrency } = useProfile();
  const [milestoneProgress, setMilestoneProgress] = useState(0);
  const [nextMilestone, setNextMilestone] = useState<string>('');
  const [wealthLevel, setWealthLevel] = useState<string>('Bronze');
  const [showCelebration, setShowCelebration] = useState(false);

  const currentBalance = accountSummary?.current_balance_cents || 0;
  const hasStartedSaving = currentBalance > 0;

  // Calculate milestones and progress
  useEffect(() => {
    const balance = currentBalance / 100;
    
    let milestone = '';
    let progress = 0;
    let level = 'Bronze';

    if (balance < 1000) {
      milestone = '$1,000';
      progress = (balance / 1000) * 100;
      level = 'Bronze';
    } else if (balance < 5000) {
      milestone = '$5,000';
      progress = ((balance - 1000) / 4000) * 100;
      level = 'Silver';
    } else if (balance < 10000) {
      milestone = '$10,000';
      progress = ((balance - 5000) / 5000) * 100;
      level = 'Gold';
    } else if (balance < 100000) {
      milestone = 'Six Figures';
      progress = ((balance - 10000) / 90000) * 100;
      level = 'Platinum';
    } else {
      milestone = 'Millionaire';
      progress = ((balance - 100000) / 900000) * 100;
      level = 'Diamond';
    }

    setNextMilestone(milestone);
    setMilestoneProgress(Math.min(progress, 100));
    setWealthLevel(level);
  }, [currentBalance]);

  const handleShare = () => {
    const shareText = `🚀 I'm building wealth with Livin' Salti! Current balance: ${formatCurrency(currentBalance)} and growing! 💪 #WealthBuilding #FinancialFreedom`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Wealth Journey',
        text: shareText,
        url: window.location.origin,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Share text copied to clipboard!');
    }
  };

  const triggerCelebration = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-card via-primary/5 to-success/10 border-primary/20 shadow-xl">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 blur-xl animate-pulse" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-gradient-to-r from-success/20 to-primary/20 blur-2xl animate-pulse delay-700" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-gradient-to-r from-accent/10 to-success/10 blur-lg animate-bounce" />
      </div>

      <CardContent className="relative p-8">
        {/* Header with Level Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {wealthLevel === 'Diamond' && <Crown className="h-8 w-8 text-primary animate-pulse" />}
              {wealthLevel === 'Platinum' && <Trophy className="h-8 w-8 text-primary" />}
              {wealthLevel === 'Gold' && <Target className="h-8 w-8 text-accent" />}
              {wealthLevel === 'Silver' && <TrendingUp className="h-8 w-8 text-muted-foreground" />}
              {wealthLevel === 'Bronze' && <Zap className="h-8 w-8 text-warning" />}
            </div>
            
            <div>
              <Badge 
                variant="secondary" 
                className={`text-sm font-bold px-3 py-1 ${
                  wealthLevel === 'Diamond' ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground' :
                  wealthLevel === 'Platinum' ? 'bg-gradient-to-r from-accent to-success text-accent-foreground' :
                  wealthLevel === 'Gold' ? 'bg-gradient-to-r from-warning to-primary text-warning-foreground' :
                  wealthLevel === 'Silver' ? 'bg-secondary text-secondary-foreground' :
                  'bg-muted text-muted-foreground'
                }`}
              >
                {wealthLevel} Wealth Builder
              </Badge>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="hover:bg-primary/10 hover:border-primary/30 transition-colors"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Journey
          </Button>
        </div>

        {/* Main Wealth Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Balance */}
          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <div className="text-sm font-medium text-muted-foreground mb-2">Current Wealth</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              {formatCurrency(currentBalance)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Building your future</div>
          </div>

          {/* Total Invested */}
          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20">
            <div className="text-sm font-medium text-muted-foreground mb-2">Money Working</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-success to-accent bg-clip-text text-transparent">
              {formatCurrency(currentBalance)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Growing daily</div>
          </div>

          {/* Saving Streak */}
          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
            <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center justify-center space-x-1">
              <Flame className="h-4 w-4 text-primary" />
              <span>Save Streak</span>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-accent to-success bg-clip-text text-transparent">
              {streakInfo?.current || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Days strong</div>
          </div>
        </div>

        {/* Milestone Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Next Milestone</h3>
              <p className="text-sm text-muted-foreground">
                Your journey to {nextMilestone}
              </p>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              {milestoneProgress.toFixed(1)}% Complete
            </Badge>
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={milestoneProgress} 
              className="h-3 bg-secondary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(currentBalance)}</span>
              <span>{nextMilestone}</span>
            </div>
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-success/5 to-primary/5 border border-success/20">
          <p className="text-sm italic text-center text-muted-foreground">
            "Every dollar saved today is a step towards financial freedom tomorrow. Keep building your wealth empire! 💪"
          </p>
        </div>
      </CardContent>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-sm"
          >
            <div className="text-center">
              <Trophy className="h-16 w-16 text-primary mx-auto mb-4 animate-bounce" />
              <h2 className="text-2xl font-bold text-primary">Milestone Reached!</h2>
              <p className="text-muted-foreground">Keep up the amazing work!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}