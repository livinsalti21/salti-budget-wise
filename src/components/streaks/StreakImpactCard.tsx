import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Target, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface StreakImpactCardProps {
  currentStreak: number;
}

const StreakImpactCard = ({ currentStreak }: StreakImpactCardProps) => {
  const { user } = useAuth();
  const [totalSaved, setTotalSaved] = useState(0);
  const [futureValue, setFutureValue] = useState(0);
  const [streakData, setStreakData] = useState<Array<{ day: number; saved: number }>>([]);

  useEffect(() => {
    if (user) {
      loadImpactData();
    }
  }, [user, currentStreak]);

  const loadImpactData = async () => {
    if (!user) return;

    // Get user account data for total saved and future value
    const { data: accountData } = await supabase
      .from('user_accounts')
      .select('current_balance_cents, projected_40yr_value_cents')
      .eq('user_id', user.id)
      .single();

    if (accountData) {
      setTotalSaved(accountData.current_balance_cents || 0);
      setFutureValue(accountData.projected_40yr_value_cents || 0);
    }

    // Get last 30 days of saves for chart
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: saves } = await supabase
      .from('save_events')
      .select('created_at, amount_cents')
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (saves && saves.length > 0) {
      let runningTotal = 0;
      const chartData = saves.map((save, index) => {
        runningTotal += save.amount_cents;
        return {
          day: index + 1,
          saved: runningTotal / 100
        };
      });
      setStreakData(chartData);
    }
  };

  const averageDailySave = currentStreak > 0 ? totalSaved / currentStreak : 0;
  const projectedYearSavings = averageDailySave * 365;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Your Consistency Impact
        </CardTitle>
        <CardDescription>
          Because of your {currentStreak}-day streak, you've built real wealth
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <p className="text-xs font-medium text-muted-foreground">Total Saved</p>
            </div>
            <p className="text-2xl font-bold text-primary">
              ${(totalSaved / 100).toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ${(averageDailySave / 100).toFixed(2)}/day average
            </p>
          </div>

          <div className="p-4 bg-secondary/50 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-xs font-medium text-muted-foreground">Future Value</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              ${(futureValue / 100).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              In 40 years @ 10% growth
            </p>
          </div>
        </div>

        {/* Motivational message */}
        <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
          <p className="font-semibold mb-2">💡 Your consistency is paying off!</p>
          <p className="text-sm text-muted-foreground">
            {currentStreak > 0 ? (
              <>
                At your current pace, you're on track to save{' '}
                <span className="font-semibold text-foreground">
                  ${(projectedYearSavings / 100).toLocaleString()}
                </span>{' '}
                this year. Keep it up!
              </>
            ) : (
              <>Start your streak today to see your projected impact!</>
            )}
          </p>
        </div>

        {/* Growth chart */}
        {streakData.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-3">Last 30 Days Growth</p>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={streakData}>
                <defs>
                  <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="day" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Saved']}
                  labelFormatter={(label) => `Day ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="saved"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSaved)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Call to action */}
        {currentStreak === 0 && (
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium mb-1">Start your streak today!</p>
            <p className="text-xs text-muted-foreground">
              Even $1 counts. Consistency beats perfection.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StreakImpactCard;
