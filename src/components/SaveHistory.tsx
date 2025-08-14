import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, PiggyBank, TrendingUp, Users, Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Save {
  id: string;
  amount_cents: number;
  reason: string;
  created_at: string;
}

const SaveHistory = () => {
  const [saves, setSaves] = useState<Save[]>([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const [streak, setStreak] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSaves();
    }
  }, [user]);

  const fetchSaves = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('saves')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setSaves(data);
      const total = data.reduce((sum, save) => sum + save.amount_cents, 0);
      setTotalSaved(total);
      
      // Calculate streak (simplified)
      setStreak(data.length);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const calculateFutureValue = (amount: number) => {
    const principal = amount / 100;
    const annualRate = 0.07;
    const years = 10;
    return principal * Math.pow(1 + annualRate, years);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PiggyBank className="h-4 w-4" />
              Total Saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">${(totalSaved / 100).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">
              Future value: ${calculateFutureValue(totalSaved).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Save Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-warning">{streak}</p>
            <p className="text-xs text-muted-foreground">Saves this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Matches Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-xs text-muted-foreground">Invite friends to match!</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Saves */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Saves
          </CardTitle>
          <CardDescription>
            Your latest Save & Stack activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {saves.length === 0 ? (
            <div className="text-center py-8">
              <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No saves yet. Start stacking!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {saves.map((save) => (
                <div key={save.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">${(save.amount_cents / 100).toFixed(2)}</p>
                      <Badge variant="secondary">{save.reason}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{formatDate(save.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-success">
                      ${calculateFutureValue(save.amount_cents).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">in 10 years</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SaveHistory;