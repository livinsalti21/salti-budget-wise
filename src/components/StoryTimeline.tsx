import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Star, TrendingUp, Calendar, Coffee, Target, Trophy, Flame } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

interface TimelineEvent {
  id: string;
  date: Date;
  type: 'save' | 'streak' | 'milestone' | 'habit' | 'goal';
  title: string;
  description: string;
  amount?: number;
  impact?: string;
  icon: React.ReactNode;
  completed: boolean;
}

const StoryTimeline = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    // Generate user's story events - in real app, this would come from database
    const generateStoryEvents = () => {
      const now = new Date();
      const events: TimelineEvent[] = [
        {
          id: '1',
          date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
          type: 'save',
          title: 'First Save Recorded',
          description: 'Started your wealth-building journey by skipping coffee',
          amount: 5.50,
          impact: '$64,000 in 30 years',
          icon: <Coffee className="h-4 w-4" />,
          completed: true
        },
        {
          id: '2',
          date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
          type: 'streak',
          title: '7-Day Streak Achieved',
          description: 'Built consistency - the foundation of wealth',
          impact: 'Habit formation milestone',
          icon: <Flame className="h-4 w-4" />,
          completed: true
        },
        {
          id: '3',
          date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          type: 'milestone',
          title: '$50 Total Saved',
          description: 'Your small habits are adding up to real money',
          amount: 50,
          impact: '10x return potential in 30 years',
          icon: <Star className="h-4 w-4" />,
          completed: true
        },
        {
          id: '4',
          date: now,
          type: 'goal',
          title: 'Next: $100 Milestone',
          description: 'You\'re 50% of the way to your next big milestone',
          amount: 100,
          impact: 'Psychological boost + compound growth',
          icon: <Target className="h-4 w-4" />,
          completed: false
        },
        {
          id: '5',
          date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days future
          type: 'milestone',
          title: '30-Day Habit Lock-In',
          description: 'When saving becomes automatic and effortless',
          impact: 'Neurologically rewired for wealth',
          icon: <Trophy className="h-4 w-4" />,
          completed: false
        }
      ];
      setEvents(events);
    };

    generateStoryEvents();
  }, [user]);

  const getEventColor = (type: string, completed: boolean) => {
    if (!completed) {
      return 'from-muted/10 to-muted/5 border-muted/30 text-muted-foreground';
    }
    
    switch (type) {
      case 'save': return 'from-success/10 to-success/5 border-success/30 text-success';
      case 'streak': return 'from-orange-500/10 to-red-500/5 border-orange-500/30 text-orange-600';
      case 'milestone': return 'from-primary/10 to-accent/5 border-primary/30 text-primary';
      case 'habit': return 'from-purple-500/10 to-purple-500/5 border-purple-500/30 text-purple-600';
      case 'goal': return 'from-warning/10 to-warning/5 border-warning/30 text-warning';
      default: return 'from-muted/10 to-muted/5 border-muted/30 text-muted-foreground';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 0) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-primary">Your Wealth Story</h3>
        </div>

        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={event.id} className="relative">
              {/* Timeline Line */}
              {index < events.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-8 bg-gradient-to-b from-primary/30 to-muted/30" />
              )}
              
              <div className="flex gap-4">
                {/* Timeline Dot */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                  event.completed 
                    ? 'bg-primary/10 border-primary/30' 
                    : 'bg-muted/10 border-muted/30'
                }`}>
                  {event.completed ? (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                {/* Event Content */}
                <div className={`flex-1 p-4 rounded-lg bg-gradient-to-r ${getEventColor(event.type, event.completed)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-white/50 dark:bg-black/20 rounded-full">
                        {event.icon}
                      </div>
                      <h4 className="font-semibold text-sm">{event.title}</h4>
                    </div>
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      {formatDate(event.date)}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">
                    {event.description}
                  </p>

                  <div className="flex items-center justify-between">
                    {event.amount && (
                      <span className="text-sm font-bold">
                        ${event.amount.toFixed(2)}
                      </span>
                    )}
                    {event.impact && (
                      <span className="text-xs text-muted-foreground bg-white/30 dark:bg-black/10 px-2 py-1 rounded">
                        💡 {event.impact}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Motivational Footer */}
        <div className="mt-6 p-4 bg-white/30 dark:bg-black/10 rounded-lg border border-white/30 dark:border-white/10 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">Every save writes your success story.</span> Small decisions today become your future freedom.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoryTimeline;