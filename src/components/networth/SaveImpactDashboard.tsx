import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, DollarSign, Calendar, Target } from "lucide-react";
import { format } from "date-fns";

interface LedgerEntry {
  id: string;
  transaction_type: 'SAVE' | 'MATCH_RECEIVED' | 'ADJUSTMENT';
  amount_cents: number;
  running_balance_cents: number;
  description?: string;
  future_value_40yr_cents: number;
  created_at: string;
}

interface AccountSummary {
  current_balance_cents: number;
  projected_40yr_value_cents: number;
  total_inflow_cents: number;
}

interface SaveImpactDashboardProps {
  ledgerHistory: LedgerEntry[];
  accountSummary: AccountSummary | null;
}

export default function SaveImpactDashboard({ ledgerHistory, accountSummary }: SaveImpactDashboardProps) {
  const formatCurrency = (cents: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  // Filter only saves (not matches or adjustments)
  const saveEntries = ledgerHistory.filter(entry => entry.transaction_type === 'SAVE');
  
  // Calculate total future value from saves
  const totalFutureValue = saveEntries.reduce((sum, entry) => sum + entry.future_value_40yr_cents, 0);
  
  // Sort saves by future value contribution (highest first)
  const sortedSaves = [...saveEntries].sort((a, b) => b.future_value_40yr_cents - a.future_value_40yr_cents);
  
  // Get top performing saves
  const topSaves = sortedSaves.slice(0, 10);

  if (!accountSummary || saveEntries.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Start Your Wealth Journey</h3>
          <p className="text-muted-foreground">
            Make your first save to see how each contribution builds your future wealth!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Impact Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saves</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{saveEntries.length}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(accountSummary.current_balance_cents)} saved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Future Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalFutureValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              In 40 years from your saves
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Multiple</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accountSummary.current_balance_cents > 0 
                ? `${(totalFutureValue / accountSummary.current_balance_cents).toFixed(1)}x`
                : '0x'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Compound growth multiplier
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Individual Save Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Individual Save Impact
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            See how each of your saves contributes to your long-term wealth
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topSaves.map((save, index) => {
              const contributionPercent = totalFutureValue > 0 
                ? (save.future_value_40yr_cents / totalFutureValue) * 100 
                : 0;
              
              return (
                <div key={save.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-sm font-semibold">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{save.description || 'Save'}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(save.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Saved</p>
                      <p className="font-semibold">{formatCurrency(save.amount_cents)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Future Value (40yr)</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(save.future_value_40yr_cents)}
                      </span>
                    </div>
                    <Progress value={contributionPercent} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{contributionPercent.toFixed(1)}% of total future wealth</span>
                      <span>
                        {(save.future_value_40yr_cents / save.amount_cents).toFixed(1)}x growth
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {saveEntries.length > 10 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                Showing top 10 saves • {saveEntries.length - 10} more saves contributing to your wealth
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}