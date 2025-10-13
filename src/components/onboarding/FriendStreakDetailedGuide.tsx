// ============================================
// PHASE 6: Friend Streak Onboarding Guide
// ============================================
// Explains how friend streaks work (accountability, NOT money transfer)

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Zap, Calendar } from 'lucide-react';

export function FriendStreakDetailedGuide() {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Users className="h-6 w-6 text-primary" />
          How Friend Streaks Work
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Step 1: Connect */}
        <div className="p-4 border border-border rounded-lg bg-card hover:bg-accent/5 transition-colors">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base mb-2">Connect with a Friend</h3>
              <p className="text-sm text-muted-foreground">
                Send a friend invite. When they accept, you can start tracking streaks together.
              </p>
            </div>
          </div>
        </div>

        {/* Step 2: Match */}
        <div className="p-4 border border-border rounded-lg bg-card hover:bg-accent/5 transition-colors">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base mb-2">They Save, You Match</h3>
              <p className="text-sm text-muted-foreground mb-2">
                When your friend saves, you'll see it in your feed. Click "Match This Save" 
                and make your own save (any amount).
              </p>
              <div className="mt-2 p-3 bg-primary/10 rounded-md border border-primary/20">
                <p className="text-xs font-medium text-foreground">
                  💡 Example: Jane saves $10. You match by saving $15.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  You both save to your own accounts. No money transfers between friends.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Build Streak */}
        <div className="p-4 border border-border rounded-lg bg-card hover:bg-accent/5 transition-colors">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                Build Your Streak
                <Calendar className="h-4 w-4 text-primary" />
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Keep matching daily to build a streak. Hit milestones for rewards!
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">3 days 🔥</Badge>
                <Badge variant="outline" className="text-xs">7 days 💪</Badge>
                <Badge variant="outline" className="text-xs">14 days 🌟</Badge>
                <Badge variant="outline" className="text-xs">30 days 🏆</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Important Note */}
        <div className="p-4 bg-accent/50 rounded-lg border border-accent">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm mb-1">Important:</p>
              <p className="text-xs text-muted-foreground">
                Friend matches are for <span className="font-semibold text-foreground">accountability and motivation</span>. 
                You each save to your own accounts. No money transfers between friends.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/10">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm mb-2">Why Friend Streaks?</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>✓ Stay motivated by saving together</li>
                <li>✓ Build healthy financial habits</li>
                <li>✓ Celebrate milestones as a team</li>
                <li>✓ Friendly competition drives consistency</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
