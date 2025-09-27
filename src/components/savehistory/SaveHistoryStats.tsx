import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PiggyBank, TrendingUp, Flame, Users } from 'lucide-react';

interface SaveHistoryStatsProps {
  totalSaved: number;
  totalSessions: number;
  streak: number;
  matches: number;
}

export default function SaveHistoryStats({ totalSaved, totalSessions, streak, matches }: SaveHistoryStatsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center w-12 h-12 bg-success/10 rounded-full mx-auto">
              <PiggyBank className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success">${(totalSaved / 100).toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Total Saved</p>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{totalSessions}</p>
              <p className="text-sm text-muted-foreground">Save Sessions</p>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-full mx-auto">
              <Flame className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">{streak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center w-12 h-12 bg-warning/10 rounded-full mx-auto">
              <Users className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">{matches}</p>
              <p className="text-sm text-muted-foreground">Friend Matches</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}