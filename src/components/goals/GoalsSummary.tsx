import { Card, CardContent } from '@/components/ui/card';
import { Target, TrendingUp, Trophy, Zap } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  emoji: string;
  target_cents: number | null;
  deadline_date: string | null;
  asset_type: 'CASH' | 'BTC';
  progress_cents: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

interface GoalsSummaryProps {
  goals: Goal[];
  totalSaved: number;
}

export default function GoalsSummary({ goals, totalSaved }: GoalsSummaryProps) {
  const activeGoals = goals.filter(goal => !goal.is_archived);
  const completedGoals = activeGoals.filter(goal => {
    if (!goal.target_cents) return false;
    return goal.progress_cents >= goal.target_cents;
  });
  
  const totalProgress = activeGoals.reduce((sum, goal) => sum + goal.progress_cents, 0);
  const totalTargets = activeGoals.reduce((sum, goal) => sum + (goal.target_cents || 0), 0);
  const overallProgress = totalTargets > 0 ? (totalProgress / totalTargets) * 100 : 0;

  const formatCurrency = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full mx-auto mb-2">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary">{activeGoals.length}</div>
            <div className="text-xs text-muted-foreground">Active Goals</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-success/10 rounded-full mx-auto mb-2">
              <Trophy className="h-5 w-5 text-success" />
            </div>
            <div className="text-2xl font-bold text-success">{completedGoals.length}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-full mx-auto mb-2">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <div className="text-2xl font-bold text-accent">${formatCurrency(totalProgress)}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-500/10 rounded-full mx-auto mb-2">
              <Zap className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-500">{Math.round(overallProgress)}%</div>
            <div className="text-xs text-muted-foreground">Overall Progress</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}