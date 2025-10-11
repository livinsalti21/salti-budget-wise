import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Lock, CheckCircle2, Target } from 'lucide-react';

interface MilestoneTimelineProps {
  currentStreak: number;
  longestStreak: number;
}

interface Milestone {
  days: number;
  title: string;
  description: string;
  emoji: string;
}

const MILESTONES: Milestone[] = [
  { days: 3, title: 'First Steps', description: 'Building the habit', emoji: '🌱' },
  { days: 7, title: 'One Week Strong', description: 'Momentum is building', emoji: '🔥' },
  { days: 14, title: 'Two Weeks', description: 'Habit is forming', emoji: '💪' },
  { days: 30, title: 'One Month', description: 'Major achievement!', emoji: '🏆' },
  { days: 50, title: 'Elite Saver', description: 'Top 5% of users', emoji: '⭐' },
  { days: 100, title: 'Century Club', description: 'Legendary status!', emoji: '👑' },
  { days: 365, title: 'Full Year', description: 'Ultimate dedication', emoji: '🎯' },
];

const MilestoneTimeline = ({ currentStreak, longestStreak }: MilestoneTimelineProps) => {
  const getNextMilestone = () => {
    return MILESTONES.find(m => m.days > currentStreak) || MILESTONES[MILESTONES.length - 1];
  };

  const nextMilestone = getNextMilestone();
  const daysToNext = Math.max(0, nextMilestone.days - currentStreak);
  const progressToNext = currentStreak >= nextMilestone.days 
    ? 100 
    : (currentStreak / nextMilestone.days) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Streak Milestones
        </CardTitle>
        <CardDescription>
          Your journey to saving mastery
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Next milestone progress */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium">Next Milestone</p>
              <p className="text-2xl font-bold text-primary">
                {nextMilestone.emoji} {nextMilestone.title}
              </p>
            </div>
            <Badge variant="secondary" className="text-lg">
              {daysToNext} {daysToNext === 1 ? 'day' : 'days'}
            </Badge>
          </div>
          <Progress value={progressToNext} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground">
            {Math.round(progressToNext)}% complete • {nextMilestone.description}
          </p>
        </div>

        {/* Milestone timeline */}
        <div className="space-y-3">
          {MILESTONES.map((milestone, index) => {
            const isAchieved = currentStreak >= milestone.days;
            const wasAchieved = longestStreak >= milestone.days;
            const isCurrent = currentStreak < milestone.days && 
                            (index === 0 || currentStreak >= MILESTONES[index - 1].days);

            return (
              <div 
                key={milestone.days}
                className={`
                  flex items-start gap-3 p-3 rounded-lg transition-all
                  ${isAchieved ? 'bg-primary/10 border border-primary/30' : 'bg-muted/30'}
                  ${isCurrent ? 'ring-2 ring-primary' : ''}
                `}
              >
                <div className={`
                  flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                  ${isAchieved ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                `}>
                  {isAchieved ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : isCurrent ? (
                    <Target className="h-5 w-5 text-primary" />
                  ) : (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{milestone.emoji}</span>
                    <p className="font-semibold">
                      {milestone.title}
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        {milestone.days} days
                      </span>
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {milestone.description}
                  </p>
                  {isAchieved && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      <Trophy className="h-3 w-3 mr-1" />
                      Achieved
                    </Badge>
                  )}
                  {!isAchieved && wasAchieved && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      Previously achieved
                    </Badge>
                  )}
                  {isCurrent && (
                    <Badge className="mt-2 text-xs">
                      Current Goal • {daysToNext} days to go
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MilestoneTimeline;
