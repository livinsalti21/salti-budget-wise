import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coffee, Utensils, ShoppingCart, Car, Gamepad2, Plus, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Habit {
  id: string;
  name: string;
  icon: React.ReactNode;
  avgSaving: number;
  streak: number;
  todayStatus: 'pending' | 'saved' | 'spent';
  category: 'food' | 'transport' | 'entertainment' | 'shopping';
}

const HabitTracker = () => {
  const { toast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: '1',
      name: 'Skip Coffee Shop',
      icon: <Coffee className="h-4 w-4" />,
      avgSaving: 5.50,
      streak: 7,
      todayStatus: 'pending',
      category: 'food'
    },
    {
      id: '2', 
      name: 'Cook vs Delivery',
      icon: <Utensils className="h-4 w-4" />,
      avgSaving: 15.00,
      streak: 3,
      todayStatus: 'saved',
      category: 'food'
    },
    {
      id: '3',
      name: 'Walk vs Ride Share',
      icon: <Car className="h-4 w-4" />,
      avgSaving: 8.00,
      streak: 5,
      todayStatus: 'pending',
      category: 'transport'
    }
  ]);

  const markHabit = (habitId: string, status: 'saved' | 'spent') => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const newStreak = status === 'saved' ? habit.streak + 1 : 0;
        return { ...habit, todayStatus: status, streak: newStreak };
      }
      return habit;
    }));

    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      toast({
        title: status === 'saved' ? "Habit Win! 🎉" : "Tomorrow's a new day",
        description: status === 'saved' 
          ? `You saved $${habit.avgSaving} and kept your ${habit.name.toLowerCase()} streak going!`
          : `Your ${habit.name.toLowerCase()} streak resets, but you can start fresh tomorrow.`
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food': return 'from-orange-500/10 to-red-500/10 border-orange-500/20';
      case 'transport': return 'from-blue-500/10 to-cyan-500/10 border-blue-500/20';
      case 'entertainment': return 'from-purple-500/10 to-pink-500/10 border-purple-500/20';
      case 'shopping': return 'from-green-500/10 to-emerald-500/10 border-green-500/20';
      default: return 'from-muted/10 to-muted/5 border-muted/20';
    }
  };

  const totalPotentialSaving = habits.reduce((sum, habit) => sum + habit.avgSaving, 0);
  const todaySaved = habits
    .filter(habit => habit.todayStatus === 'saved')
    .reduce((sum, habit) => sum + habit.avgSaving, 0);

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Today's Habit Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-success/10 rounded-lg border border-success/20">
              <p className="text-2xl font-bold text-success">${todaySaved.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Saved Today</p>
            </div>
            <div className="text-center p-3 bg-warning/10 rounded-lg border border-warning/20">
              <p className="text-2xl font-bold text-warning">${totalPotentialSaving.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Daily Potential</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Habit Cards */}
      <div className="space-y-3">
        {habits.map((habit) => (
          <Card key={habit.id} className={`bg-gradient-to-r ${getCategoryColor(habit.category)} hover:shadow-md transition-all`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/50 dark:bg-black/20 rounded-full">
                    {habit.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{habit.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-success font-medium">${habit.avgSaving}/save</span>
                      {habit.streak > 0 && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                          🔥 {habit.streak} days
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {habit.todayStatus === 'pending' ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markHabit(habit.id, 'saved')}
                        className="p-2 h-8 w-8 bg-success/10 border-success/30 hover:bg-success/20"
                      >
                        <CheckCircle className="h-4 w-4 text-success" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markHabit(habit.id, 'spent')}
                        className="p-2 h-8 w-8 bg-destructive/10 border-destructive/30 hover:bg-destructive/20"
                      >
                        <XCircle className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  ) : (
                    <Badge 
                      variant={habit.todayStatus === 'saved' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {habit.todayStatus === 'saved' ? '✅ Saved' : '❌ Spent'}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Future Impact */}
              <div className="bg-white/30 dark:bg-black/10 rounded p-2 text-center">
                <p className="text-xs text-muted-foreground">
                  30-year impact: <span className="font-bold text-primary">
                    ${(habit.avgSaving * 365 * 30 * 1.08).toLocaleString()}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Habit */}
      <Card className="border-dashed border-2 border-muted-foreground/30 hover:border-primary/50 transition-colors">
        <CardContent className="p-6 text-center">
          <Button variant="ghost" className="w-full" size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Add New Habit to Track
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            What else can you skip to build wealth?
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HabitTracker;