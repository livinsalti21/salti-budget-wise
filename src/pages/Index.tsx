import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, Target, Zap, Bot, CreditCard, PiggyBank, LogOut, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import SaveStack from '@/components/SaveStack';
import SaveHistory from '@/components/SaveHistory';
import BudgetSuggestions from '@/components/BudgetSuggestions';
import TransactionFeed from '@/components/TransactionFeed';
import NetWorthProjection from '@/components/NetWorthProjection';
import SpendingChart from '@/components/SpendingChart';
import GameDashboard from '@/components/GameDashboard';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [totalBudget] = useState(4500);
  const [spent, setSpent] = useState(2850);
  const [remaining, setRemaining] = useState(totalBudget - spent);

  // Redirect to auth if not logged in
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <div className="text-center">
          <PiggyBank className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  const categories = [
    { name: 'Food & Dining', budget: 800, spent: 650, color: 'bg-accent' },
    { name: 'Transportation', budget: 600, spent: 450, color: 'bg-primary' },
    { name: 'Entertainment', budget: 400, spent: 320, color: 'bg-warning' },
    { name: 'Shopping', budget: 700, spent: 580, color: 'bg-destructive' },
    { name: 'Bills & Utilities', budget: 1200, spent: 850, color: 'bg-success' },
  ];

  const recentTransactions = [
    { id: 1, merchant: 'Starbucks', amount: -5.50, category: 'Food & Dining', time: '2 min ago' },
    { id: 2, merchant: 'Uber', amount: -12.30, category: 'Transportation', time: '15 min ago' },
    { id: 3, merchant: 'Amazon', amount: -89.99, category: 'Shopping', time: '1 hour ago' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSpent(prev => prev + Math.random() * 10);
      setRemaining(prev => prev - Math.random() * 10);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const spentPercentage = (spent / totalBudget) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Livin Salti
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Invite Friends
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Save. Match. Grow — Together. Turn skipped purchases into your future net worth.
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5" />
            <CardHeader className="relative">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Budget
              </CardTitle>
              <p className="text-2xl font-bold">${totalBudget.toLocaleString()}</p>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-accent/5" />
            <CardHeader className="relative">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Spent This Month
              </CardTitle>
              <p className="text-2xl font-bold">${spent.toFixed(0)}</p>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-success/5" />
            <CardHeader className="relative">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <PiggyBank className="h-4 w-4" />
                Remaining
              </CardTitle>
              <p className="text-2xl font-bold text-success">${remaining.toFixed(0)}</p>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-warning/10 to-warning/5" />
            <CardHeader className="relative">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                On Track
              </CardTitle>
              <p className="text-2xl font-bold">{spentPercentage < 70 ? '✓' : '⚠️'}</p>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="save-stack" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="save-stack">Save & Stack</TabsTrigger>
            <TabsTrigger value="history">My Saves</TabsTrigger>
            <TabsTrigger value="game">Challenges</TabsTrigger>
            <TabsTrigger value="dashboard">Budget</TabsTrigger>
            <TabsTrigger value="projections">Net Worth</TabsTrigger>
            <TabsTrigger value="transactions">Live Feed</TabsTrigger>
          </TabsList>

          <TabsContent value="save-stack">
            <SaveStack />
          </TabsContent>

          <TabsContent value="history">
            <SaveHistory />
          </TabsContent>

          <TabsContent value="game">
            <GameDashboard />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Budget Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Budget Overview</CardTitle>
                  <CardDescription>Your spending across categories</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categories.map((category) => {
                    const percentage = (category.spent / category.budget) * 100;
                    return (
                      <div key={category.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{category.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              ${category.spent} / ${category.budget}
                            </span>
                            <Badge variant={percentage > 80 ? "destructive" : "secondary"}>
                              {percentage.toFixed(0)}%
                            </Badge>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Spending Chart */}
              <SpendingChart />
            </div>
          </TabsContent>

          <TabsContent value="projections">
            <NetWorthProjection currentSavings={remaining} />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionFeed transactions={recentTransactions} />
          </TabsContent>
        </Tabs>

        {/* Real-time Status */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3">
              <Zap className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-sm font-medium">
                Connected & monitoring your spending in real-time
              </span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-success rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-success rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;