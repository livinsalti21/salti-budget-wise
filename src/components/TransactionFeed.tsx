import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, ArrowDown, ArrowUp, Zap } from 'lucide-react';

interface Transaction {
  id: number;
  merchant: string;
  amount: number;
  category: string;
  time: string;
}

interface TransactionFeedProps {
  transactions: Transaction[];
}

const TransactionFeed = ({ transactions: initialTransactions }: TransactionFeedProps) => {
  const [transactions, setTransactions] = useState(initialTransactions);

  // Simulate real-time transactions
  useEffect(() => {
    const interval = setInterval(() => {
      const newTransaction = {
        id: Date.now(),
        merchant: ['Coffee Shop', 'Gas Station', 'Grocery Store', 'Netflix', 'Spotify'][Math.floor(Math.random() * 5)],
        amount: -(Math.random() * 50 + 5),
        category: ['Food & Dining', 'Transportation', 'Entertainment', 'Bills & Utilities'][Math.floor(Math.random() * 4)],
        time: 'Just now'
      };
      
      setTransactions(prev => [newTransaction, ...prev.slice(0, 9)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Food & Dining': return 'bg-accent';
      case 'Transportation': return 'bg-primary';
      case 'Entertainment': return 'bg-warning';
      case 'Shopping': return 'bg-destructive';
      case 'Bills & Utilities': return 'bg-success';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Live Transaction Feed
            <Zap className="h-4 w-4 text-primary animate-pulse" />
          </CardTitle>
          <CardDescription>
            Real-time updates as your spending happens
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest spending activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {transactions.map((transaction, index) => (
                  <div 
                    key={transaction.id} 
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-500 ${
                      index === 0 && transaction.time === 'Just now' 
                        ? 'bg-primary/5 border-primary/20 animate-pulse' 
                        : 'bg-card'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getCategoryColor(transaction.category)}`} />
                      <div>
                        <p className="font-medium">{transaction.merchant}</p>
                        <p className="text-sm text-muted-foreground">{transaction.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${transaction.amount < 0 ? 'text-destructive' : 'text-success'}`}>
                        {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">{transaction.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Impact</CardTitle>
            <CardDescription>How each transaction affects your budget</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-warning-light">
                <div className="flex items-center gap-2">
                  <ArrowDown className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium">Food & Dining over 80%</span>
                </div>
                <Badge variant="warning">Alert</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-success-light">
                <div className="flex items-center gap-2">
                  <ArrowUp className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium">Transportation under budget</span>
                </div>
                <Badge variant="secondary">Good</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">On track for monthly goal</span>
                </div>
                <Badge variant="secondary">Stable</Badge>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg border bg-gradient-to-r from-accent/5 to-accent/10">
              <h4 className="font-medium mb-2">Smart Prediction</h4>
              <p className="text-sm text-muted-foreground">
                Based on current spending patterns, you'll finish the month with <span className="font-medium text-success">$127 under budget</span> if you maintain this pace.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionFeed;