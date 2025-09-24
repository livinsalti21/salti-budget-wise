import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, Calendar, DollarSign } from 'lucide-react';
import { useLedger } from '@/hooks/useLedger';

interface WealthProjectionCardProps {
  className?: string;
}

export default function WealthProjectionCard({ className }: WealthProjectionCardProps) {
  const { accountSummary, formatCurrency } = useLedger();

  if (!accountSummary) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Start saving to see your wealth projection</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate additional metrics
  const monthsToRetirement = 40 * 12;
  const monthlyGrowth = accountSummary.current_balance_cents > 0 
    ? (accountSummary.projected_40yr_value_cents - accountSummary.current_balance_cents) / monthsToRetirement
    : 0;

  // Calculate wealth multiplier
  const wealthMultiplier = accountSummary.current_balance_cents > 0
    ? accountSummary.projected_40yr_value_cents / accountSummary.current_balance_cents
    : 0;

  return (
    <Card className={`bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 border-primary/20 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Your Wealth Trajectory
        </CardTitle>
        <CardDescription>Compound growth projection over 40 years</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Projection */}
        <div className="text-center p-6 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 animate-pulse" />
          <div className="relative">
            <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              {formatCurrency(accountSummary.projected_40yr_value_cents)}
            </div>
            <div className="text-muted-foreground">Projected wealth in 40 years</div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-lg bg-background/50">
            <Target className="h-5 w-5 mx-auto mb-2 text-primary" />
            <div className="text-lg font-bold">
              {wealthMultiplier > 0 ? `${wealthMultiplier.toFixed(1)}x` : '0x'}
            </div>
            <div className="text-sm text-muted-foreground">Wealth Multiplier</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-background/50">
            <Calendar className="h-5 w-5 mx-auto mb-2 text-accent" />
            <div className="text-lg font-bold">
              {formatCurrency(monthlyGrowth)}
            </div>
            <div className="text-sm text-muted-foreground">Monthly Growth</div>
          </div>
        </div>

        {/* Milestones */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Wealth Milestones</h4>
          <div className="space-y-2">
            {[
              { amount: 100000, label: "Six Figures", years: 15 },
              { amount: 500000, label: "Half Million", years: 25 },
              { amount: 1000000, label: "Millionaire", years: 32 }
            ].map((milestone) => {
              const isAchievable = accountSummary.projected_40yr_value_cents >= milestone.amount * 100;
              return (
                <div key={milestone.amount} className={`flex justify-between text-sm p-2 rounded ${
                  isAchievable ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200' : 'bg-gray-50 text-gray-500 dark:bg-gray-900/20 dark:text-gray-400'
                }`}>
                  <span>{milestone.label}</span>
                  <span>{isAchievable ? `~Year ${milestone.years}` : 'Keep saving!'}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}