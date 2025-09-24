import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Calendar, Users, Trophy, Zap } from 'lucide-react';
import { useLedger } from '@/hooks/useLedger';
import { useProfile } from '@/hooks/useProfile';

export default function WealthScoreCard() {
  const { accountSummary } = useLedger();
  const { streakInfo } = useProfile();
  const [wealthScore, setWealthScore] = useState(0);
  const [scoreChange, setScoreChange] = useState(0);
  const [scoreGrade, setScoreGrade] = useState('');

  const currentBalance = accountSummary?.current_balance_cents || 0;
  const hasStartedSaving = currentBalance > 0;

  // Calculate wealth score based on multiple factors
  useEffect(() => {
    const balance = currentBalance / 100;
    const streak = streakInfo?.current || 0;
    const longestStreak = streakInfo?.longest || 0;

    // Score calculation (0-1000 scale)
    let score = 0;
    
    // Balance component (up to 400 points)
    if (balance >= 100000) score += 400;
    else if (balance >= 50000) score += 350;
    else if (balance >= 10000) score += 300;
    else if (balance >= 5000) score += 250;
    else if (balance >= 1000) score += 200;
    else if (balance >= 500) score += 150;
    else if (balance >= 100) score += 100;
    else score += Math.min(balance, 50);

    // Streak component (up to 300 points)
    score += Math.min(streak * 10, 300);

    // Consistency component (up to 200 points)
    score += Math.min(longestStreak * 5, 200);

    // Investment activity component (up to 100 points)
    score += Math.min(balance / 10, 100);

    const finalScore = Math.round(Math.min(score, 1000));
    
    // Determine grade
    let grade = '';
    if (finalScore >= 900) grade = 'A+';
    else if (finalScore >= 800) grade = 'A';
    else if (finalScore >= 700) grade = 'B+';
    else if (finalScore >= 600) grade = 'B';
    else if (finalScore >= 500) grade = 'C+';
    else if (finalScore >= 400) grade = 'C';
    else if (finalScore >= 300) grade = 'D';
    else grade = 'F';

    const previousScore = parseInt(localStorage.getItem('previousWealthScore') || '0');
    const change = finalScore - previousScore;
    
    setWealthScore(finalScore);
    setScoreChange(change);
    setScoreGrade(grade);
    
    localStorage.setItem('previousWealthScore', finalScore.toString());
  }, [currentBalance, hasStartedSaving, streakInfo]);

  const getScoreColor = () => {
    if (wealthScore >= 800) return 'text-success';
    if (wealthScore >= 600) return 'text-primary';
    if (wealthScore >= 400) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getGradientClass = () => {
    if (wealthScore >= 800) return 'from-success/20 to-accent/20';
    if (wealthScore >= 600) return 'from-primary/20 to-success/20';
    if (wealthScore >= 400) return 'from-warning/20 to-primary/20';
    return 'from-muted/20 to-secondary/20';
  };

  return (
    <Card className={`bg-gradient-to-br ${getGradientClass()} border-primary/20 shadow-lg`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-primary" />
            <span>Daily Wealth Score</span>
          </div>
          <Badge 
            variant="secondary" 
            className={`${getScoreColor()} bg-background/50`}
          >
            Grade {scoreGrade}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Score Display */}
        <div className="text-center">
          <div className={`text-4xl font-bold ${getScoreColor()}`}>
            {wealthScore}
          </div>
          <div className="text-xs text-muted-foreground">out of 1000</div>
          
          {scoreChange !== 0 && (
            <div className="flex items-center justify-center space-x-1 mt-2">
              <TrendingUp className={`h-3 w-3 ${scoreChange > 0 ? 'text-success' : 'text-destructive'}`} />
              <span className={`text-xs ${scoreChange > 0 ? 'text-success' : 'text-destructive'}`}>
                {scoreChange > 0 ? '+' : ''}{scoreChange} today
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={(wealthScore / 1000) * 100} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Beginner</span>
            <span>Expert</span>
          </div>
        </div>

        {/* Score Components */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-muted-foreground">Balance</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">Streak</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-muted-foreground">Consistency</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-muted-foreground">Activity</span>
          </div>
        </div>

        {/* Next Level Info */}
        <div className="pt-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground text-center">
            {wealthScore < 1000 ? (
              <>Need {1000 - wealthScore} more points for perfect score!</>
            ) : (
              <>🎉 Perfect wealth score achieved!</>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}