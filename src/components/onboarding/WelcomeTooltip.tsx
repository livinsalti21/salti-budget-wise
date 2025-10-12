import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function WelcomeTooltip() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { user, profile } = useAuth();

  useEffect(() => {
    const checkFirstVisit = async () => {
      if (!user) return;

      // Check if user has any saves
      const { data: saves } = await supabase
        .from('save_events')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      // Show welcome if no saves and not dismissed
      if (saves && saves.length === 0 && !dismissed) {
        setShow(true);
      }
    };

    checkFirstVisit();
  }, [user, dismissed]);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="max-w-md w-full bg-gradient-to-br from-primary/10 via-background to-accent/10 border-primary/20 shadow-2xl">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              <h2 className="text-xl font-bold">Welcome to Livin Salti! 🎉</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <p className="text-muted-foreground">
              You're all set! Here's how to get started:
            </p>

            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm">Record Your First Save</h3>
                  <p className="text-xs text-muted-foreground">
                    Tap the + button to celebrate skipping that coffee ☕
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-accent/5 rounded-lg">
                <Target className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm">Build Your Streak</h3>
                  <p className="text-xs text-muted-foreground">
                    Save daily to unlock badges and watch your wealth grow 🔥
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-success/5 rounded-lg">
                <TrendingUp className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm">See Your Future</h3>
                  <p className="text-xs text-muted-foreground">
                    Every save shows its 40-year future value at 10% growth 📈
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleDismiss}
            className="w-full bg-gradient-to-r from-primary to-accent"
            size="lg"
          >
            Let's Go! 🚀
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
