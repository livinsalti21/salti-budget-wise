import { ArrowLeft, Target, TrendingUp, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function GoalsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    weeklyTotal: 0,
    totalSaved: 0,
    weeklyGoal: 50, // Default $50 weekly goal
    projectedAnnual: 0,
    projectedDecade: 0
  });

  useEffect(() => {
    if (user) {
      loadGoalData();
    }
  }, [user]);

  const loadGoalData = async () => {
    try {
      // Get total saved
      const { data: totalSaveData } = await supabase
        .from('save_events')
        .select('amount_cents')
        .eq('user_id', user?.id);

      const totalSaved = totalSaveData?.reduce((sum, save) => sum + save.amount_cents, 0) || 0;

      // Get this week's savings
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - (today.getDay() === 0 ? 7 : today.getDay()) + 1);
      startOfWeek.setHours(0, 0, 0, 0);

      const { data: weeklyData } = await supabase
        .from('save_events')
        .select('amount_cents')
        .eq('user_id', user?.id)
        .gte('created_at', startOfWeek.toISOString());

      const weeklyTotal = weeklyData?.reduce((sum, save) => sum + save.amount_cents, 0) || 0;

      // Calculate projections based on current weekly rate
      const weeklyAvg = weeklyTotal || stats.weeklyGoal * 100; // Use current or default goal
      const projectedAnnual = (weeklyAvg * 52) / 100;
      const projectedDecade = ((weeklyAvg * 52 * 10) * Math.pow(1.07, 10)) / 100; // 7% annual return

      setStats({
        weeklyTotal: weeklyTotal / 100,
        totalSaved: totalSaved / 100,
        weeklyGoal: stats.weeklyGoal,
        projectedAnnual,
        projectedDecade
      });
    } catch (error) {
      console.error('Error loading goal data:', error);
    }
  };

  const progressPercentage = (stats.weeklyTotal / stats.weeklyGoal) * 100;

  return (
    <div className="pb-20 safe-area-top">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur p-4 border-b">
        <div className="flex items-center gap-3">
          <Link to="/app">
            <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Goals & Projections</h1>
            <p className="text-sm text-muted-foreground">Track your progress</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Current Week Goal */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Weekly Goal Progress
            </CardTitle>
            <CardDescription>
              Goal: ${stats.weeklyGoal} per week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>${stats.weeklyTotal.toFixed(2)} / ${stats.weeklyGoal}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {progressPercentage.toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {progressPercentage >= 100 ? "Goal achieved! 🎉" : `$${(stats.weeklyGoal - stats.weeklyTotal).toFixed(2)} to go`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Future Projections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Future Projections
            </CardTitle>
            <CardDescription>
              Based on your current saving rate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-success/5 rounded-lg border border-success/20">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-success" />
                <div className="text-xl font-bold text-success">
                  ${stats.projectedAnnual.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">This Year</div>
              </div>
              
              <div className="text-center p-4 bg-accent/5 rounded-lg border border-accent/20">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-accent" />
                <div className="text-xl font-bold text-accent">
                  ${Math.round(stats.projectedDecade).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">10 Years (7% growth)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Your Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Saved</span>
              <span className="font-medium">${stats.totalSaved.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">This Week</span>
              <span className="font-medium">${stats.weeklyTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Weekly Goal</span>
              <span className="font-medium">${stats.weeklyGoal}</span>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              🚀 Custom goal setting coming soon!
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}