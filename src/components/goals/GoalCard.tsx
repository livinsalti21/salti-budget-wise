import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Edit3, Target, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onAddSave?: (goalId: string) => void;
}

export default function GoalCard({ goal, onEdit, onAddSave }: GoalCardProps) {
  const { toast } = useToast();
  
  const calculateProgress = () => {
    if (!goal.target_cents) return 0;
    return Math.min((goal.progress_cents / goal.target_cents) * 100, 100);
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const getDaysUntilDeadline = () => {
    if (!goal.deadline_date) return null;
    const today = new Date();
    const deadlineDate = new Date(goal.deadline_date);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTimeRemaining = () => {
    const daysLeft = getDaysUntilDeadline();
    if (daysLeft === null) return null;
    if (daysLeft < 0) return 'Overdue';
    if (daysLeft === 0) return 'Due today';
    if (daysLeft === 1) return '1 day left';
    if (daysLeft < 30) return `${daysLeft} days left`;
    const monthsLeft = Math.ceil(daysLeft / 30);
    return monthsLeft === 1 ? '1 month left' : `${monthsLeft} months left`;
  };

  const handleAddSave = () => {
    onAddSave?.(goal.id);
    toast({
      title: "Add save to goal",
      description: `Add money to ${goal.emoji} ${goal.title}`,
    });
  };

  const progress = calculateProgress();
  const timeRemaining = getTimeRemaining();
  const isCompleted = progress >= 100;

  return (
    <Card className={`relative overflow-hidden ${isCompleted ? 'border-success/40 bg-success/5' : ''}`}>
      <div className="absolute top-3 right-3">
        <Badge variant={goal.asset_type === 'BTC' ? 'secondary' : 'outline'} className="text-xs">
          {goal.asset_type === 'BTC' ? <Coins className="mr-1 h-3 w-3" /> : '💵'}
          {goal.asset_type}
        </Badge>
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg pr-16">
          <span className="text-2xl">{goal.emoji}</span>
          <span className="truncate">{goal.title}</span>
        </CardTitle>
        {timeRemaining && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {timeRemaining}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              ${formatCurrency(goal.progress_cents)}
              {goal.target_cents && ` / $${formatCurrency(goal.target_cents)}`}
            </span>
          </div>
          {goal.target_cents ? (
            <Progress value={progress} className="h-2" />
          ) : (
            <div className="h-2 bg-muted rounded-full">
              <div className="h-2 bg-primary rounded-full w-0"></div>
            </div>
          )}
        </div>
        
        {isCompleted && (
          <div className="text-center py-1">
            <Badge variant="default" className="bg-success text-success-foreground">
              🎉 Goal Achieved!
            </Badge>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={handleAddSave}>
            <Target className="mr-1 h-3 w-3" />
            Add Save
          </Button>
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(goal)}>
              <Edit3 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}