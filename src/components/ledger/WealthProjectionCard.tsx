import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, Zap, Trophy } from 'lucide-react';
import { useLedger } from '@/hooks/useLedger';

interface WealthProjectionCardProps {
  className?: string;
}

export default function WealthProjectionCard({ className }: WealthProjectionCardProps) {
  const { accountSummary, formatCurrency } = useLedger();

  if (!accountSummary) {
    return (
      <Card className={`${className} bg-gradient-to-br from-muted/20 to-secondary/20 border-primary/20`}>
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="font-semibold text-foreground">Your Wealth Journey Awaits</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Start saving to unlock your 40-year wealth projection!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentBalance = accountSummary.current_balance_cents;
  const projectedWealth = accountSummary.projected_40yr_value_cents || 0;
  
  // Calculate monthly growth if we have projection data
  const monthsToRetirement = 40 * 12;
  const monthlyGrowth = projectedWealth > currentBalance 
    ? (projectedWealth - currentBalance) / monthsToRetirement
    : Math.round(currentBalance * 0.07 / 12); // 7% annual return fallback

  // Calculate progress toward first million
  const millionProgress = Math.min((projectedWealth / 100000000) * 100, 100); // $1M in cents

  // Milestone calculations
  const milestones = [
    { name: 'Six Figures', amount: 10000000, achievable: projectedWealth >= 10000000 }, // $100k in cents
    { name: 'Half Million', amount: 50000000, achievable: projectedWealth >= 50000000 }, // $500k in cents
    { name: 'Millionaire', amount: 100000000, achievable: projectedWealth >= 100000000 }, // $1M in cents
  ];

  return (
    <Card className={`${className} bg-gradient-to-br from-card via-accent/5 to-success/10 border-accent/30 shadow-lg overflow-hidden`}>
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-transparent animate-pulse" />
        <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-gradient-to-tr from-success/20 to-transparent animate-pulse delay-700" />
      </div>

      <CardHeader className="relative pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-glow">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg">Wealth Destiny</span>
          </div>
          <Badge className="bg-gradient-to-r from-success to-accent text-success-foreground">
            40 Years
          </Badge>
        </CardTitle>
        <CardDescription className="text-sm">
          Your projected wealth journey with compound growth
        </CardDescription>
      </CardHeader>
      
      <CardContent className="relative space-y-4">
        {/* Main Projection - Compact */}
        <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/10 to-success/5 border border-primary/20">
          <div className="text-xs font-medium text-muted-foreground mb-1">Future Wealth</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            {formatCurrency(projectedWealth)}
          </div>
          {millionProgress < 100 ? (
            <div className="mt-2 space-y-1">
              <Progress value={millionProgress} className="h-1.5" />
              <div className="text-xs text-muted-foreground">
                {millionProgress.toFixed(1)}% to millionaire status
              </div>
            </div>
          ) : (
            <div className="text-xs text-success font-medium mt-1 flex items-center justify-center space-x-1">
              <Trophy className="h-3 w-3" />
              <span>Millionaire Achieved!</span>
            </div>
          )}
        </div>

        {/* Compact Metrics Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center p-3 rounded-lg bg-success/10 border border-success/20">
            <div className="text-xs text-muted-foreground">Growth Multiple</div>
            <div className="text-lg font-bold text-success">{Math.round(projectedWealth / Math.max(currentBalance, 1))}x</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-accent/10 border border-accent/20">
            <div className="text-xs text-muted-foreground">Monthly Growth</div>
            <div className="text-lg font-bold text-accent">+{formatCurrency(monthlyGrowth)}</div>
          </div>
        </div>

        {/* Milestones - Compact */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Milestones</h4>
          <div className="space-y-1">
            {milestones.map((milestone) => (
              <div key={milestone.name} className="flex items-center justify-between p-2 rounded-lg bg-card/50 border border-border/50">
                <div className="flex items-center space-x-2">
                  <Target className={`h-3 w-3 ${milestone.achievable ? 'text-success' : 'text-muted-foreground'}`} />
                  <span className="text-xs font-medium">{milestone.name}</span>
                </div>
                {milestone.achievable ? (
                  <Badge variant="secondary" className="bg-success/20 text-success text-xs px-2 py-0">
                    ✓
                  </Badge>
                ) : (
                  <div className="w-3 h-3 rounded-full bg-muted" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Motivational Footer */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-primary/5 to-success/5 border border-primary/20">
          <div className="flex items-center space-x-2">
            <Zap className="h-3 w-3 text-primary flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Compound interest turns today's savings into tomorrow's fortune! 🚀
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}