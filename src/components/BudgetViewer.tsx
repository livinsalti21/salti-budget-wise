import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, DollarSign, TrendingUp, TrendingDown, AlertCircle, Target, Calendar, Edit3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BudgetItem {
  id: string;
  category: string;
  planned_cents: number;
  actual_cents: number;
}

interface WeeklyBudget {
  id: string;
  title: string;
  week_start_date: string;
  items: BudgetItem[];
}

const BudgetViewer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentBudget, setCurrentBudget] = useState<WeeklyBudget | null>(null);
  const [budgetHistory, setBudgetHistory] = useState<WeeklyBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    if (user) {
      loadCurrentWeekBudget();
      loadBudgetHistory();
    }
  }, [user]);

  const getCurrentWeekStart = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);
    return weekStart.toISOString().split('T')[0];
  };

  const loadCurrentWeekBudget = async () => {
    if (!user) return;

    const weekStart = getCurrentWeekStart();
    
    const { data: budget, error } = await supabase
      .from('budgets')
      .select(`
        id,
        title,
        week_start_date,
        budget_items (
          id,
          category,
          planned_cents,
          actual_cents
        )
      `)
      .eq('user_id', user.id)
      .eq('week_start_date', weekStart)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading budget:', error);
    } else if (budget) {
      setCurrentBudget({
        id: budget.id,
        title: budget.title,
        week_start_date: budget.week_start_date,
        items: budget.budget_items || []
      });
    }
    
    setLoading(false);
  };

  const loadBudgetHistory = async () => {
    if (!user) return;

    const { data: budgets, error } = await supabase
      .from('budgets')
      .select(`
        id,
        title,
        week_start_date,
        budget_items (
          id,
          category,
          planned_cents,
          actual_cents
        )
      `)
      .eq('user_id', user.id)
      .order('week_start_date', { ascending: false })
      .limit(8);

    if (budgets) {
      setBudgetHistory(budgets.map(b => ({
        id: b.id,
        title: b.title,
        week_start_date: b.week_start_date,
        items: b.budget_items || []
      })));
    }
  };

  const addExpenseToCategory = async () => {
    if (!currentBudget || !selectedCategory || !newExpenseAmount) return;

    const amountCents = Math.round(parseFloat(newExpenseAmount) * 100);
    
    // Find the budget item for this category
    const item = currentBudget.items.find(i => i.category === selectedCategory);
    if (!item) return;

    const { error } = await supabase
      .from('budget_items')
      .update({ actual_cents: item.actual_cents + amountCents })
      .eq('id', item.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive"
      });
      return;
    }

    // Update local state
    setCurrentBudget(prev => ({
      ...prev!,
      items: prev!.items.map(i => 
        i.id === item.id 
          ? { ...i, actual_cents: i.actual_cents + amountCents }
          : i
      )
    }));

    toast({
      title: "Expense Added",
      description: `$${newExpenseAmount} added to ${selectedCategory}`,
    });

    setNewExpenseAmount('');
    setSelectedCategory('');
  };

  const getBudgetStatus = (planned: number, actual: number) => {
    const percentage = (actual / planned) * 100;
    if (percentage >= 100) return { status: 'over', color: 'text-destructive', icon: TrendingDown };
    if (percentage >= 80) return { status: 'warning', color: 'text-warning', icon: AlertCircle };
    return { status: 'good', color: 'text-success', icon: TrendingUp };
  };

  const getWeeklyTotals = (budget: WeeklyBudget) => {
    const totalPlanned = budget.items.reduce((sum, item) => sum + item.planned_cents, 0);
    const totalActual = budget.items.reduce((sum, item) => sum + item.actual_cents, 0);
    return { totalPlanned, totalActual, remaining: totalPlanned - totalActual };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your budget...</p>
        </div>
      </div>
    );
  }

  if (!currentBudget) {
    return (
      <div className="text-center p-8 space-y-4">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
        <div>
          <h3 className="font-semibold">No Budget for This Week</h3>
          <p className="text-muted-foreground">Create a weekly budget to start tracking your expenses</p>
        </div>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Weekly Budget
        </Button>
      </div>
    );
  }

  const { totalPlanned, totalActual, remaining } = getWeeklyTotals(currentBudget);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">Current Week</TabsTrigger>
          <TabsTrigger value="history">Budget History</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {/* Week Overview */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {currentBudget.title}
                  </CardTitle>
                  <CardDescription>
                    Week of {new Date(currentBudget.week_start_date).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit Budget
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Planned</p>
                  <p className="text-2xl font-bold text-primary">${(totalPlanned / 100).toFixed(2)}</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Spent</p>
                  <p className="text-2xl font-bold text-foreground">${(totalActual / 100).toFixed(2)}</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-success' : 'text-destructive'}`}>
                    ${Math.abs(remaining / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Categories</CardTitle>
              <CardDescription>Track your weekly spending by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {currentBudget.items.map((item) => {
                  const percentage = Math.min((item.actual_cents / item.planned_cents) * 100, 100);
                  const status = getBudgetStatus(item.planned_cents, item.actual_cents);
                  const StatusIcon = status.icon;
                  const remaining = item.planned_cents - item.actual_cents;

                  return (
                    <div key={item.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.category}</span>
                          <StatusIcon className={`h-4 w-4 ${status.color}`} />
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ${(item.actual_cents / 100).toFixed(2)} / ${(item.planned_cents / 100).toFixed(2)}
                          </p>
                          <p className={`text-sm ${status.color}`}>
                            {remaining < 0 ? 'Over by' : 'Remaining'}: ${Math.abs(remaining / 100).toFixed(2)}
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

          {/* Add Expense */}
          <Card>
            <CardHeader>
              <CardTitle>Add Expense</CardTitle>
              <CardDescription>Record a new expense to your budget</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="category">Category</Label>
                  <select 
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="">Select category</option>
                    {currentBudget.items.map(item => (
                      <option key={item.id} value={item.category}>{item.category}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newExpenseAmount}
                    onChange={(e) => setNewExpenseAmount(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addExpenseToCategory} disabled={!selectedCategory || !newExpenseAmount}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget History</CardTitle>
              <CardDescription>Your past weekly budgets and spending patterns</CardDescription>
            </CardHeader>
            <CardContent>
              {budgetHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No budget history yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {budgetHistory.map((budget) => {
                    const { totalPlanned, totalActual } = getWeeklyTotals(budget);
                    const performance = totalActual <= totalPlanned ? 'On Track' : 'Over Budget';
                    const performanceColor = totalActual <= totalPlanned ? 'text-success' : 'text-destructive';

                    return (
                      <div key={budget.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium">{budget.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Week of {new Date(budget.week_start_date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline" className={performanceColor}>
                            {performance}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Planned</p>
                            <p className="font-semibold">${(totalPlanned / 100).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Spent</p>
                            <p className="font-semibold">${(totalActual / 100).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Difference</p>
                            <p className={`font-semibold ${totalActual <= totalPlanned ? 'text-success' : 'text-destructive'}`}>
                              {totalActual <= totalPlanned ? '-' : '+'}${Math.abs((totalActual - totalPlanned) / 100).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BudgetViewer;