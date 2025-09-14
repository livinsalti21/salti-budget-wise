import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target,
  AlertTriangle,
  CheckCircle,
  Download,
  RefreshCw,
  BarChart3,
  Wallet,
  PiggyBank
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { hasProAccess } from '@/lib/permissions/hasProAccess';
import { useIsMobile } from '@/hooks/use-mobile';
import type { BudgetInput, WeeklyBudgetResult, UserPlan } from '@/lib/budgetUtils';
import { computeWeeklyBudget, formatCurrency } from '@/lib/budgetUtils';
import { saveBudgetToDatabase } from '@/lib/budgetStorage';

interface WeeklyBudgetDashboardProps {
  budgetData: BudgetInput;
  budgetId?: string;
  onBudgetSaved?: (budgetId: string) => void;
}

const WeeklyBudgetDashboard = ({ budgetData, budgetId, onBudgetSaved }: WeeklyBudgetDashboardProps) => {
  const [result, setResult] = useState<WeeklyBudgetResult | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan>('free');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user && budgetData) {
      calculateBudget();
      checkUserPlan();
    }
  }, [user, budgetData]);

  const checkUserPlan = async () => {
    if (!user) return;
    
    const isProUser = await hasProAccess(user);
    setUserPlan(isProUser ? 'pro' : 'free');
  };

  const calculateBudget = () => {
    if (!budgetData) return;
    
    // Get user's default splits from profile
    const defaultSplits = {
      save_rate: 0.20,
      splits: {
        groceries: 0.4,
        gas: 0.2,
        eating_out: 0.2,
        fun: 0.15,
        misc: 0.05
      }
    };
    
    const budgetResult = computeWeeklyBudget(budgetData, userPlan, defaultSplits);
    setResult(budgetResult);
  };

  const saveBudget = async () => {
    if (!user || !budgetData || !result) return;

    setIsLoading(true);
    try {
      const saveResult = await saveBudgetToDatabase(user.id, budgetData, result);
      
      if (saveResult.success && saveResult.budgetId) {
        onBudgetSaved?.(saveResult.budgetId);
        toast({
          title: "Budget Saved",
          description: "Your weekly budget has been saved successfully"
        });
      } else {
        throw new Error(saveResult.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save budget",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportBudget = async () => {
    if (!budgetId || !user) return;

    try {
      const { data, error } = await supabase.functions.invoke('budget-operations', {
        body: {
          action: 'export_budget',
          userId: user.id,
          budgetId,
          format: 'csv'
        }
      });

      if (error) throw error;

      // Create and download CSV file
      const blob = new Blob([data.csv_data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budget-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Complete",
        description: "Your budget has been exported to CSV"
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export budget",
        variant: "destructive"
      });
    }
  };

  if (!result) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-success" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'critical': return <AlertTriangle className="h-5 w-5 text-destructive" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-success border-success/20 bg-success/10';
      case 'warning': return 'text-warning border-warning/20 bg-warning/10';
      case 'critical': return 'text-destructive border-destructive/20 bg-destructive/10';
      default: return '';
    }
  };

  // Mobile Overview Component
  const MobileOverview = () => (
    <div className="space-y-4">
      {/* Compact Status Card */}
      <Card className={`${getStatusColor(result.status)}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(result.status)}
              <span className="font-semibold capitalize">{result.status}</span>
            </div>
          </div>
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-background/80 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Income</p>
              <p className="text-lg font-bold text-success">${result.weekly.income}</p>
            </div>
            <div className="bg-background/80 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Expenses</p>
              <p className="text-lg font-bold text-muted-foreground">${result.weekly.fixed}</p>
            </div>
            <div className="bg-background/80 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Savings</p>
              <p className="text-lg font-bold text-primary">${result.weekly.save_n_stack}</p>
            </div>
            <div className="bg-background/80 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Spending</p>
              <p className="text-lg font-bold text-info">${result.weekly.variable_total}</p>
            </div>
          </div>

          {/* Top Tips */}
          {result.tips.length > 0 && (
            <div className="bg-background/80 rounded-lg p-3">
              <p className="text-sm text-muted-foreground mb-2">💡 Top Tip</p>
              <p className="text-sm">{result.tips[0]}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Desktop Layout
  const DesktopLayout = () => (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Weekly Budget Dashboard</h2>
          <p className="text-muted-foreground">Your personalized financial plan</p>
        </div>
        <div className="flex gap-2">
          {budgetId && (
            <Button variant="outline" size="sm" onClick={exportBudget}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
          <Button onClick={saveBudget} disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Target className="h-4 w-4 mr-2" />
            )}
            {budgetId ? 'Update Budget' : 'Save Budget'}
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <Card className={`border-2 ${getStatusColor(result.status)}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(result.status)}
            Budget Health: {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Weekly Income</p>
              <p className="text-2xl font-bold text-success">${result.weekly.income}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Fixed Expenses</p>
              <p className="text-2xl font-bold text-muted-foreground">${result.weekly.fixed}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Savings</p>
              <p className="text-2xl font-bold text-primary">${result.weekly.save_n_stack}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Spending Money</p>
              <p className="text-2xl font-bold text-info">${result.weekly.variable_total}</p>
            </div>
          </div>

          {/* Tips */}
          <div className="space-y-2">
            {result.tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-background/50 rounded">
                <span className="text-sm">{tip}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Income Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Income Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {budgetData.incomes.map((income, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
                <div>
                  <p className="font-medium">{income.source || `Income ${index + 1}`}</p>
                  <p className="text-sm text-muted-foreground">{income.cadence}</p>
                </div>
                <p className="font-bold text-success">${income.amount}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fixed Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            Fixed Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {budgetData.fixed_expenses.map((expense, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border">
                <div>
                  <p className="font-medium">{expense.name}</p>
                  <p className="text-sm text-muted-foreground">{expense.cadence}</p>
                </div>
                <p className="font-bold text-muted-foreground">${expense.amount}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Variable Spending Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Weekly Spending Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {result.weekly.allocations.map((allocation, index) => (
              <div key={index} className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{allocation.name}</p>
                  <p className="font-bold text-primary">${allocation.weekly_amount}</p>
                </div>
                <Progress 
                  value={(allocation.weekly_amount / result.weekly.variable_total) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Goals */}
      {budgetData.goals && budgetData.goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-warning" />
              Savings Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {budgetData.goals.map((goal, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
                  <div>
                    <p className="font-medium">{goal.name}</p>
                    <p className="text-sm text-muted-foreground">Due: {goal.due_date}</p>
                  </div>
                  <p className="font-bold text-warning">${goal.target_amount}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Mobile Tabbed Layout
  const MobileLayout = () => (
    <div className="space-y-4">
      {/* Mobile Header */}
      <div className="flex flex-col space-y-3">
        <div>
          <h2 className="text-xl font-bold">Budget Dashboard</h2>
          <p className="text-sm text-muted-foreground">Your weekly financial plan</p>
        </div>
        
        {/* Action Buttons - Sticky on mobile */}
        <div className="flex gap-2 w-full">
          {budgetId && (
            <Button variant="outline" size="sm" onClick={exportBudget} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          <Button onClick={saveBudget} disabled={isLoading} className="flex-1">
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Target className="h-4 w-4 mr-2" />
            )}
            {budgetId ? 'Update' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="overview" className="text-xs">
            <BarChart3 className="h-4 w-4 mr-1" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="income" className="text-xs">
            <TrendingUp className="h-4 w-4 mr-1" />
            Income
          </TabsTrigger>
          <TabsTrigger value="expenses" className="text-xs">
            <DollarSign className="h-4 w-4 mr-1" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="spending" className="text-xs">
            <Wallet className="h-4 w-4 mr-1" />
            Spending
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <MobileOverview />
        </TabsContent>

        <TabsContent value="income">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-success" />
                Income Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {budgetData.incomes.map((income, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{income.source || `Income ${index + 1}`}</p>
                      <p className="text-xs text-muted-foreground">{income.cadence}</p>
                    </div>
                    <p className="font-bold text-success">${income.amount}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                Fixed Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {budgetData.fixed_expenses.map((expense, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{expense.name}</p>
                      <p className="text-xs text-muted-foreground">{expense.cadence}</p>
                    </div>
                    <p className="font-bold text-muted-foreground">${expense.amount}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spending">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wallet className="h-5 w-5 text-primary" />
                  Weekly Spending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.weekly.allocations.map((allocation, index) => (
                    <div key={index} className="p-3 bg-primary/10 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{allocation.name}</p>
                        <p className="font-bold text-primary">${allocation.weekly_amount}</p>
                      </div>
                      <Progress 
                        value={(allocation.weekly_amount / result.weekly.variable_total) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Goals */}
            {budgetData.goals && budgetData.goals.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <PiggyBank className="h-5 w-5 text-warning" />
                    Savings Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {budgetData.goals.map((goal, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{goal.name}</p>
                          <p className="text-xs text-muted-foreground">Due: {goal.due_date}</p>
                        </div>
                        <p className="font-bold text-warning">${goal.target_amount}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <div>
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
    </div>
  );
};

export default WeeklyBudgetDashboard;