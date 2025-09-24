import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Clock } from 'lucide-react';
import { useLedger } from '@/hooks/useLedger';
import { format } from 'date-fns';

export default function UserLedger() {
  const { 
    ledgerHistory, 
    accountSummary, 
    loading, 
    fetchLedgerHistory, 
    formatCurrency, 
    getTransactionDescription 
  } = useLedger();

  useEffect(() => {
    fetchLedgerHistory();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-gradient-to-r from-background/50 to-background/30 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Summary */}
      {accountSummary && (
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Wealth Summary
            </CardTitle>
            <CardDescription>Your financial wealth trajectory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-background/50">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(accountSummary.current_balance_cents)}
                </div>
                <div className="text-sm text-muted-foreground">Current Balance</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-background/50">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(accountSummary.total_inflow_cents)}
                </div>
                <div className="text-sm text-muted-foreground">Total Invested</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 relative overflow-hidden">
                <TrendingUp className="absolute top-2 right-2 h-4 w-4 text-primary/50" />
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {formatCurrency(accountSummary.projected_40yr_value_cents)}
                </div>
                <div className="text-sm text-muted-foreground">40-Year Wealth</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ledger History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Wealth Building History
          </CardTitle>
          <CardDescription>Your complete transaction ledger</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {ledgerHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet. Start building your wealth!</p>
            </div>
          ) : (
            ledgerHistory.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge 
                      variant={entry.transaction_type === 'SAVE' ? 'default' : 'secondary'}
                      className={entry.transaction_type === 'SAVE' ? 'bg-primary text-primary-foreground' : ''}
                    >
                      {entry.transaction_type.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(entry.created_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  <p className="font-medium">{getTransactionDescription(entry)}</p>
                  {entry.future_value_40yr_cents > 0 && (
                    <p className="text-sm text-muted-foreground">
                      40-year value: {formatCurrency(entry.future_value_40yr_cents)}
                    </p>
                  )}
                </div>
                <div className="text-right space-y-1">
                  <div className="text-lg font-bold text-green-600">
                    +{formatCurrency(entry.amount_cents)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Balance: {formatCurrency(entry.running_balance_cents)}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}