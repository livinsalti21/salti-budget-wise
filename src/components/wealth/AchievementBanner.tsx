import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Crown, Target, Flame, Gift, X } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useLedger } from '@/hooks/useLedger';
import { motion, AnimatePresence } from 'framer-motion';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  progress?: number;
  requirement?: string;
  rewardPoints?: number;
}

export default function AchievementBanner() {
  const { streakInfo } = useProfile();
  const { accountSummary } = useLedger();
  const [showBanner, setShowBanner] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  const currentBalance = (accountSummary?.current_balance_cents || 0) / 100;
  const hasStartedSaving = currentBalance > 0;
  const currentStreak = streakInfo?.current || 0;

  // Memoize achievements to prevent infinite re-renders
  const achievements = useMemo(() => {
    const achievementList: Achievement[] = [
      {
        id: 'first_save',
        title: 'First Steps',
        description: 'Made your very first save!',
        icon: <Star className="h-5 w-5 text-primary" />,
        earned: hasStartedSaving,
        rewardPoints: 10,
      },
      {
        id: 'streak_3',
        title: 'Getting Started',
        description: 'Maintained a 3-day saving streak',
        icon: <Flame className="h-5 w-5 text-primary" />,
        earned: currentStreak >= 3,
        progress: Math.min((currentStreak / 3) * 100, 100),
        requirement: '3 day streak',
        rewardPoints: 25,
      },
      {
        id: 'streak_7',
        title: 'Week Warrior',
        description: 'Saved for 7 consecutive days!',
        icon: <Trophy className="h-5 w-5 text-primary" />,
        earned: currentStreak >= 7,
        progress: Math.min((currentStreak / 7) * 100, 100),
        requirement: '7 day streak',
        rewardPoints: 50,
      },
      {
        id: 'balance_100',
        title: 'Century Saver',
        description: 'Reached $100 in savings!',
        icon: <Target className="h-5 w-5 text-success" />,
        earned: currentBalance >= 100,
        progress: Math.min((currentBalance / 100) * 100, 100),
        requirement: '$100 balance',
        rewardPoints: 30,
      },
      {
        id: 'balance_1000',
        title: 'Thousand Club',
        description: 'Hit the $1,000 milestone!',
        icon: <Crown className="h-5 w-5 text-primary" />,
        earned: currentBalance >= 1000,
        progress: Math.min((currentBalance / 1000) * 100, 100),
        requirement: '$1,000 balance',
        rewardPoints: 100,
      },
      {
        id: 'streak_30',
        title: 'Monthly Master',
        description: 'Saved every day for a month!',
        icon: <Gift className="h-5 w-5 text-accent" />,
        earned: currentStreak >= 30,
        progress: Math.min((currentStreak / 30) * 100, 100),
        requirement: '30 day streak',
        rewardPoints: 200,
      },
    ];

    return achievementList;
  }, [hasStartedSaving, currentBalance, currentStreak]);

  // Check for newly earned achievements only when achievements change
  useEffect(() => {
    const newlyEarned = achievements.find(a => 
      a.earned && !localStorage.getItem(`achievement_shown_${a.id}`)
    );

    if (newlyEarned && !showBanner) {
      setCurrentAchievement(newlyEarned);
      setShowBanner(true);
      localStorage.setItem(`achievement_shown_${newlyEarned.id}`, 'true');
    }
  }, [achievements, showBanner]);

  const handleDismiss = () => {
    setShowBanner(false);
    setTimeout(() => setCurrentAchievement(null), 300);
  };

  const earnedCount = achievements.filter(a => a.earned).length;
  const totalPoints = achievements
    .filter(a => a.earned)
    .reduce((sum, a) => sum + (a.rewardPoints || 0), 0);

  if (!showBanner || !currentAchievement) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.95 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-success/10 to-accent/10 border-primary/30 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-success/5" />
          
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Achievement Icon */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center animate-pulse">
                    {currentAchievement.icon}
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-success flex items-center justify-center"
                  >
                    <Trophy className="h-3 w-3 text-success-foreground" />
                  </motion.div>
                </div>

                {/* Achievement Details */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-bold text-foreground">
                      🎉 Achievement Unlocked!
                    </h3>
                    <Badge variant="secondary" className="bg-primary text-primary-foreground">
                      +{currentAchievement.rewardPoints} pts
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-primary text-lg">
                      {currentAchievement.title}
                    </h4>
                    <p className="text-muted-foreground">
                      {currentAchievement.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Trophy className="h-4 w-4" />
                      <span>{earnedCount}/{achievements.length} achievements</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4" />
                      <span>{totalPoints} points earned</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dismiss Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="hover:bg-background/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Celebration Sparkles */}
            <div className="absolute top-2 right-20">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
                className="text-primary text-xl"
              >
                ✨
              </motion.div>
            </div>
            <div className="absolute bottom-4 right-32">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 0.3
                }}
                className="text-accent text-lg"
              >
                🎊
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}