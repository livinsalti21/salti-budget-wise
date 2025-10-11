import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SaveDay {
  date: string;
  amount: number;
  count: number;
}

const StreakCalendar = () => {
  const { user } = useAuth();
  const [saveDays, setSaveDays] = useState<SaveDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSaveHistory();
    }
  }, [user]);

  const loadSaveHistory = async () => {
    if (!user) return;

    // Get last 60 days of saves
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const { data } = await supabase
      .from('save_events')
      .select('created_at, amount_cents')
      .eq('user_id', user.id)
      .gte('created_at', sixtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (data) {
      // Group by date
      const dayMap = new Map<string, { amount: number; count: number }>();
      
      data.forEach(save => {
        const date = new Date(save.created_at).toISOString().split('T')[0];
        const existing = dayMap.get(date) || { amount: 0, count: 0 };
        dayMap.set(date, {
          amount: existing.amount + save.amount_cents,
          count: existing.count + 1
        });
      });

      const days = Array.from(dayMap.entries()).map(([date, { amount, count }]) => ({
        date,
        amount,
        count
      }));

      setSaveDays(days);
    }
    setIsLoading(false);
  };

  const getIntensity = (amount: number): string => {
    if (amount === 0) return 'bg-muted';
    if (amount < 1000) return 'bg-primary/20';
    if (amount < 2500) return 'bg-primary/40';
    if (amount < 5000) return 'bg-primary/60';
    if (amount < 10000) return 'bg-primary/80';
    return 'bg-primary';
  };

  // Generate last 60 days
  const generateDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 59; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const saveDay = saveDays.find(d => d.date === dateStr);
      
      days.push({
        date: dateStr,
        amount: saveDay?.amount || 0,
        count: saveDay?.count || 0,
        dayOfWeek: date.getDay()
      });
    }
    
    return days;
  };

  const days = generateDays();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Your Saving Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading calendar...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Your Saving Calendar
        </CardTitle>
        <CardDescription>
          Last 60 days • Darker = more saved
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="space-y-2">
            {/* Day labels */}
            <div className="flex gap-1 mb-2">
              <div className="w-8 text-xs text-muted-foreground">Mon</div>
              <div className="flex-1"></div>
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(12px,1fr))] gap-1">
              {days.map((day) => {
                const date = new Date(day.date);
                const formattedDate = date.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                });

                return (
                  <Tooltip key={day.date}>
                    <TooltipTrigger asChild>
                      <div
                        className={`
                          aspect-square rounded-sm cursor-pointer 
                          transition-all hover:ring-2 hover:ring-primary
                          ${getIntensity(day.amount)}
                        `}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs">
                        <p className="font-semibold">{formattedDate}</p>
                        {day.count > 0 ? (
                          <>
                            <p>{day.count} save{day.count > 1 ? 's' : ''}</p>
                            <p className="font-bold">${(day.amount / 100).toFixed(2)}</p>
                          </>
                        ) : (
                          <p className="text-muted-foreground">No saves</p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-muted" />
                <div className="w-3 h-3 rounded-sm bg-primary/20" />
                <div className="w-3 h-3 rounded-sm bg-primary/40" />
                <div className="w-3 h-3 rounded-sm bg-primary/60" />
                <div className="w-3 h-3 rounded-sm bg-primary/80" />
                <div className="w-3 h-3 rounded-sm bg-primary" />
              </div>
              <span>More</span>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};

export default StreakCalendar;
