// PHASE 2: Enhanced ledger display with transaction sources
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLedger } from '@/hooks/useLedger';
import { format } from 'date-fns';
import { useEffect } from 'react';

export default function UserLedger() {
  const { 
    ledgerHistory, 
    accountSummary, 
    loading, 
    fetchLedgerHistory,
    formatCurrency,
    getTransactionDescription,
    getTransactionIcon
  } = useLedger();

  useEffect(() => {
    fetchLedgerHistory();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Summary */}
      {accountSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Wealth Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{formatCurrency(accountSummary.current_balance_cents)}</div>
                <div className="text-sm text-muted-foreground">Current Balance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formatCurrency(accountSummary.total_inflow_cents)}</div>
                <div className="text-sm text-muted-foreground">Total Invested</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formatCurrency(accountSummary.projected_40yr_value_cents)}</div>
                <div className="text-sm text-muted-foreground">40-Year Wealth</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ledger History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {ledgerHistory.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions yet</p>
          ) : (
            <div className="space-y-4">
              {ledgerHistory.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className="text-2xl mt-1">{getTransactionIcon(entry)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <Badge variant={entry.transaction_type === 'SAVE' ? 'default' : 'secondary'}>
                        {entry.transaction_type.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(entry.created_at), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <p className="font-medium">{getTransactionDescription(entry)}</p>
                    {entry.transaction_type === 'MATCH_RECEIVED' && entry.original_save_amount_cents && (
                      <p className="text-sm text-muted-foreground">
                        Matched your {formatCurrency(entry.original_save_amount_cents)} save
                      </p>
                    )}
                    {entry.has_friend_match && entry.friend_match_name && (
                      <TooltipProvider>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">Friend Streak Active</Badge>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xs text-muted-foreground cursor-help">ℹ️</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs max-w-xs">
                                Friend matches = accountability. You both save to your own accounts.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    )}
                    {entry.future_value_40yr_cents > 0 && (
                      <p className="text-sm text-muted-foreground">40yr: {formatCurrency(entry.future_value_40yr_cents)}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${entry.amount_cents >= 0 ? 'text-primary' : 'text-destructive'}`}>
                      {entry.amount_cents >= 0 ? '+' : ''}{formatCurrency(entry.amount_cents)}
                    </p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(entry.running_balance_cents)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
