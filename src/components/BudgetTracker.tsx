import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, DollarSign, TrendingUp, TrendingDown, AlertCircle, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  remaining: number;
  color: string;
}

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

const BudgetTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<BudgetCategory[]>([
    { id: '1', name: 'Food & Dining', budgeted: 40000, spent: 28500, remaining: 11500, color: 'bg-blue-500' },
    { id: '2', name: 'Entertainment', budgeted: 15000, spent: 8200, remaining: 6800, color: 'bg-purple-500' },
    { id: '3', name: 'Transportation', budgeted: 20000, spent: 18900, remaining: 1100, color: 'bg-green-500' },
    { id: '4', name: 'Shopping', budgeted: 25000, spent: 31200, remaining: -6200, color: 'bg-red-500' },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState(500000); // $5000 in cents
  const [totalBudgeted, setTotalBudgeted] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [isOnTrack, setIsOnTrack] = useState(true);

  useEffect(() => {
    const budgeted = categories.reduce((sum, cat) => sum + cat.budgeted, 0);
    const spent = categories.reduce((sum, cat) => sum + cat.spent, 0);
    setTotalBudgeted(budgeted);
    setTotalSpent(spent);
    setIsOnTrack(spent <= budgeted * 0.8); // On track if spent less than 80% of budget
  }, [categories]);

  useEffect(() => {
    if (user) {
      fetchRecentTransactions();
    }
  }, [user]);

  const fetchRecentTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user?.id)
      .order('occurred_at', { ascending: false })
      .limit(10);

    if (data) {
      const formattedTransactions = data.map(t => ({
        id: t.id,
        amount: t.amount_cents,
        description: t.description || 'Transaction',
        category: 'General',
        date: new Date(t.occurred_at).toLocaleDateString(),
        type: t.type as 'income' | 'expense'
      }));
      setTransactions(formattedTransactions);
    }
  };

  const getBudgetStatus = (category: BudgetCategory) => {
    const percentage = (category.spent / category.budgeted) * 100;
    if (percentage >= 100) return { status: 'over', color: 'text-destructive', icon: TrendingDown };
    if (percentage >= 80) return { status: 'warning', color: 'text-warning', icon: AlertCircle };
    return { status: 'good', color: 'text-success', icon: TrendingUp };
  };

  const getOverallStatus = () => {
    if (!isOnTrack) return { status: 'Off Track', color: 'text-destructive', bgColor: 'bg-destructive/10' };
    return { status: 'On Track', color: 'text-success', bgColor: 'bg-success/10' };
  };

  const addExpense = async (category: string, amount: number, description: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        amount_cents: amount,
        description,
        type: 'debit'
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive"
      });
      return;
    }

    // Update local state
    setCategories(prev => prev.map(cat => 
      cat.name === category 
        ? { ...cat, spent: cat.spent + amount, remaining: cat.remaining - amount }
        : cat
    ));

    toast({
      title: "Expense Added",
      description: `$${(amount / 100).toFixed(2)} added to ${category}`,
    });

    fetchRecentTransactions();
  };

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Monthly Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${(monthlyIncome / 100).toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Total Budgeted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${(totalBudgeted / 100).toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${(totalSpent / 100).toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={`${getOverallStatus().bgColor} ${getOverallStatus().color}`}>
              {getOverallStatus().status}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              ${((monthlyIncome - totalSpent) / 100).toFixed(2)} remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Categories</CardTitle>
          <CardDescription>Track spending across different categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {categories.map((category) => {
              const percentage = Math.min((category.spent / category.budgeted) * 100, 100);
              const status = getBudgetStatus(category);
              const StatusIcon = status.icon;

              return (
                <div key={category.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${category.color}`} />
                      <span className="font-medium">{category.name}</span>
                      <StatusIcon className={`h-4 w-4 ${status.color}`} />
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${(category.spent / 100).toFixed(2)} / ${(category.budgeted / 100).toFixed(2)}
                      </p>
                      <p className={`text-sm ${status.color}`}>
                        {category.remaining < 0 ? 'Over by' : 'Remaining'}: ${Math.abs(category.remaining / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest spending activity</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${transaction.type === 'expense' ? 'text-destructive' : 'text-success'}`}>
                      {transaction.type === 'expense' ? '-' : '+'}${(transaction.amount / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">{transaction.category}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetTracker;