import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useLedger } from "@/hooks/useLedger";
import { useProfile } from "@/hooks/useProfile";

export default function WealthScoreCard() {
  const { accountSummary } = useLedger();
  const { streakInfo } = useProfile();
  const [wealthScore, setWealthScore] = useState(0);
  const [scoreChange, setScoreChange] = useState(0);
  const [scoreGrade, setScoreGrade] = useState("F");

  const currentBalance = (accountSummary?.current_balance_cents || 0) / 100;

  useEffect(() => {
    // Calculate wealth score (0-1000)
    const balanceScore = Math.min((currentBalance / 10000) * 400, 400); // Max 400 for balance
    const streakScore = Math.min((streakInfo?.current || 0) * 10, 300); // Max 300 for streak
    const consistencyScore = Math.min((streakInfo?.longest || 0) * 2, 200); // Max 200 for consistency
    const activityScore = Math.min(50, 100); // Simplified activity score

    const totalScore = Math.round(balanceScore + streakScore + consistencyScore + activityScore);
    
    // Get previous score from localStorage
    const prevScore = parseInt(localStorage.getItem('previousWealthScore') || '0');
    const change = totalScore - prevScore;
    
    // Store current score for next time
    localStorage.setItem('previousWealthScore', totalScore.toString());
    
    setWealthScore(totalScore);
    setScoreChange(change);
    
    // Calculate grade
    if (totalScore >= 900) setScoreGrade("A+");
    else if (totalScore >= 800) setScoreGrade("A");
    else if (totalScore >= 700) setScoreGrade("B+");
    else if (totalScore >= 600) setScoreGrade("B");
    else if (totalScore >= 500) setScoreGrade("C+");
    else if (totalScore >= 400) setScoreGrade("C");
    else if (totalScore >= 300) setScoreGrade("D+");
    else if (totalScore >= 200) setScoreGrade("D");
    else setScoreGrade("F");
  }, [currentBalance, streakInfo]);

  const getScoreColor = () => {
    if (wealthScore >= 800) return "text-success";
    if (wealthScore >= 600) return "text-accent";
    if (wealthScore >= 400) return "text-warning";
    return "text-muted-foreground";
  };

  const getGradientClass = () => {
    if (wealthScore >= 800) return "from-success/5 to-accent/5";
    if (wealthScore >= 600) return "from-accent/5 to-primary/5";
    if (wealthScore >= 400) return "from-warning/5 to-primary/5";
    return "from-muted/10 to-muted/5";
  };

  const pointsToNext = Math.max(0, Math.ceil((Math.floor(wealthScore / 100) + 1) * 100) - wealthScore);

  return (
    <Card className={`border-0 bg-gradient-to-br ${getGradientClass()} shadow-lg hover:shadow-xl transition-all duration-300`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Daily Wealth Score</CardTitle>
          <Badge variant="outline" className={`${getScoreColor()} border-current`}>
            Grade {scoreGrade}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Score Display */}
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor()}`}>
              {wealthScore}
            </div>
            <p className="text-sm text-muted-foreground">out of 1,000</p>
          </div>
          
          <div className="flex items-center gap-1 text-sm">
            {scoreChange > 0 && (
              <>
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-success font-medium">+{scoreChange}</span>
              </>
            )}
            {scoreChange < 0 && (
              <>
                <TrendingDown className="h-4 w-4 text-destructive" />
                <span className="text-destructive font-medium">{scoreChange}</span>
              </>
            )}
            {scoreChange === 0 && (
              <>
                <Minus className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">0</span>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={(wealthScore / 1000) * 100} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {pointsToNext > 0 ? `${pointsToNext} points to next grade` : "Perfect score achieved!"}
          </p>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Balance</span>
              <span className="font-medium">{Math.min((currentBalance / 10000) * 400, 400).toFixed(0)}/400</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Streak</span>
              <span className="font-medium">{Math.min((streakInfo?.current || 0) * 10, 300)}/300</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Consistency</span>
              <span className="font-medium">{Math.min((streakInfo?.longest || 0) * 2, 200)}/200</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Activity</span>
              <span className="font-medium">50/100</span>
            </div>
          </div>
        </div>

        {pointsToNext > 0 && (
          <div className="text-center text-xs text-muted-foreground bg-muted/30 rounded-lg p-2">
            💡 Keep saving daily to improve your wealth score!
          </div>
        )}
      </CardContent>
    </Card>
  );
}