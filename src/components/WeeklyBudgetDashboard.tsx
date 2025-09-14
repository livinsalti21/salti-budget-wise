import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target,
  AlertTriangle,
  CheckCircle,
  Download,
  RefreshCw,
  PiggyBank,
  Calculator,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { hasProAccess } from '@/lib/permissions/hasProAccess';
import type { BudgetInput, WeeklyBudgetResult, UserPlan } from '@/lib/budgetUtils';
import { computeWeeklyBudget, formatCurrency } from '@/lib/budgetUtils';
import UpgradeModal from '@/components/ui/UpgradeModal';
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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
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

  if (isMobile) {
    return (
      <div className="pb-20"> {/* Add bottom padding for sticky actions */}
        {/* Mobile Header */}
        <div className="space-y-4 mb-6">
          <div className="text-center">
            <h2 className="text-xl font-bold">Weekly Budget</h2>
            <p className="text-sm text-muted-foreground">Your financial overview</p>
          </div>

          {/* Mobile Status Card */}
          <Card className={`border-2 ${getStatusColor(result.status)}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-3">
                {getStatusIcon(result.status)}
                <span className="font-medium text-sm">
                  {result.status.charAt(0).toUpperCase() + result.status.slice(1)} Budget
                </span>
              </div>
              
              {/* Horizontal scrolling metrics */}
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-1">
                <div className="flex-shrink-0 text-center min-w-20">
                  <p className="text-xs text-muted-foreground">Income</p>
                  <p className="text-lg font-bold text-success">${result.weekly.income}</p>
                </div>
                <div className="flex-shrink-0 text-center min-w-20">
                  <p className="text-xs text-muted-foreground">Fixed</p>
                  <p className="text-lg font-bold text-muted-foreground">${result.weekly.fixed}</p>
                </div>
                <div className="flex-shrink-0 text-center min-w-20">
                  <p className="text-xs text-muted-foreground">Savings</p>
                  <p className="text-lg font-bold text-primary">${result.weekly.save_n_stack}</p>
                </div>
                <div className="flex-shrink-0 text-center min-w-20">
                  <p className="text-xs text-muted-foreground">Spending</p>
                  <p className="text-lg font-bold text-info">${result.weekly.variable_total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="text-xs">
              <BarChart3 className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="income" className="text-xs">
              <TrendingUp className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Income</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="text-xs">
              <DollarSign className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Fixed</span>
            </TabsTrigger>
            <TabsTrigger value="spending" className="text-xs">
              <Target className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Spending</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Tips Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Budget Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.tips.map((tip, index) => (
                  <div key={index} className="text-sm p-2 bg-background/50 rounded border-l-2 border-primary">
                    {tip}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Goals Preview */}
            {budgetData.goals && budgetData.goals.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <PiggyBank className="h-4 w-4" />
                    Savings Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {budgetData.goals.slice(0, userPlan === 'free' ? 1 : 2).map((goal, index) => (
                      <div key={index} className="p-3 bg-warning/10 rounded border border-warning/20">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{goal.name}</p>
                            <p className="text-xs text-muted-foreground">{goal.due_date}</p>
                          </div>
                          <p className="font-bold text-warning text-sm">${goal.target_amount}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="income" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  Income Sources
                  {userPlan === 'free' && budgetData.incomes.length >= 1 && (
                    <Badge variant="outline" className="text-xs">Free: 1</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {budgetData.incomes.slice(0, userPlan === 'free' ? 1 : undefined).map((income, index) => (
                  <div key={index} className="p-3 bg-success/10 rounded border border-success/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{income.source || `Income ${index + 1}`}</p>
                        <p className="text-xs text-muted-foreground">{income.cadence}</p>
                      </div>
                      <p className="font-bold text-success">${income.amount}</p>
                    </div>
                  </div>
                ))}
                
                {userPlan === 'free' && budgetData.incomes.length > 1 && (
                  <div className="p-3 bg-muted/50 rounded border border-dashed">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {budgetData.incomes.length - 1} more source{budgetData.incomes.length > 2 ? 's' : ''}
                      </p>
                      <Button size="sm" variant="outline" onClick={() => setShowUpgradeModal(true)}>
                        Upgrade
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Fixed Expenses
                  {userPlan === 'free' && budgetData.fixed_expenses.length >= 4 && (
                    <Badge variant="outline" className="text-xs">Free: 4</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {budgetData.fixed_expenses.slice(0, userPlan === 'free' ? 4 : undefined).map((expense, index) => (
                  <div key={index} className="p-3 bg-muted/20 rounded border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{expense.name}</p>
                        <p className="text-xs text-muted-foreground">{expense.cadence}</p>
                      </div>
                      <p className="font-bold text-muted-foreground">${expense.amount}</p>
                    </div>
                  </div>
                ))}
                
                {userPlan === 'free' && budgetData.fixed_expenses.length > 4 && (
                  <div className="p-3 bg-muted/50 rounded border border-dashed">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {budgetData.fixed_expenses.length - 4} more expense{budgetData.fixed_expenses.length > 5 ? 's' : ''}
                      </p>
                      <Button size="sm" variant="outline" onClick={() => setShowUpgradeModal(true)}>
                        Upgrade
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spending" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Weekly Spending Plan
                  {userPlan === 'free' && (
                    <Badge variant="secondary" className="text-xs">Default</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.weekly.allocations.map((allocation, index) => (
                  <div key={index} className="p-3 bg-primary/10 rounded border border-primary/20">
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
                
                {userPlan === 'free' && (
                  <div className="p-3 bg-muted/50 rounded border border-dashed">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Custom categories & percentages
                      </p>
                      <Button size="sm" variant="outline" onClick={() => setShowUpgradeModal(true)}>
                        Upgrade
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sticky Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t">
          <div className="flex gap-2">
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

        <UpgradeModal 
          isOpen={showUpgradeModal} 
          onClose={() => setShowUpgradeModal(false)}
          feature="unlimited budget items"
        />
      </div>
    );
  }

  // Desktop layout (existing layout)
  return (
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
            {userPlan === 'free' && budgetData.incomes.length >= 1 && (
              <Badge variant="outline" className="text-xs">Free: 1 source</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {budgetData.incomes.slice(0, userPlan === 'free' ? 1 : undefined).map((income, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
                <div>
                  <p className="font-medium">{income.source || `Income ${index + 1}`}</p>
                  <p className="text-sm text-muted-foreground">{income.cadence}</p>
                </div>
                <p className="font-bold text-success">${income.amount}</p>
              </div>
            ))}
            
            {userPlan === 'free' && budgetData.incomes.length > 1 && (
              <div className="p-3 bg-muted/50 rounded-lg border border-dashed">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {budgetData.incomes.length - 1} more income source{budgetData.incomes.length > 2 ? 's' : ''} (Pro feature)
                  </p>
                  <Button size="sm" variant="outline" onClick={() => setShowUpgradeModal(true)}>
                    Upgrade
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fixed Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            Fixed Expenses
            {userPlan === 'free' && budgetData.fixed_expenses.length >= 4 && (
              <Badge variant="outline" className="text-xs">Free: 4 expenses</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {budgetData.fixed_expenses.slice(0, userPlan === 'free' ? 4 : undefined).map((expense, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border">
                <div>
                  <p className="font-medium">{expense.name}</p>
                  <p className="text-sm text-muted-foreground">{expense.cadence}</p>
                </div>
                <p className="font-bold text-muted-foreground">${expense.amount}</p>
              </div>
            ))}
            
            {userPlan === 'free' && budgetData.fixed_expenses.length > 4 && (
              <div className="p-3 bg-muted/50 rounded-lg border border-dashed">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {budgetData.fixed_expenses.length - 4} more expense{budgetData.fixed_expenses.length > 5 ? 's' : ''} (Pro feature)
                  </p>
                  <Button size="sm" variant="outline" onClick={() => setShowUpgradeModal(true)}>
                    Upgrade
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Variable Spending Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Weekly Spending Plan
            {userPlan === 'free' && (
              <Badge variant="secondary" className="text-xs">Free: Default categories</Badge>
            )}
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
          
          {userPlan === 'free' && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-dashed">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Customize spending categories and percentages
                </p>
                <Button size="sm" variant="outline" onClick={() => setShowUpgradeModal(true)}>
                  Upgrade for Custom Categories
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Goals */}
      {budgetData.goals && budgetData.goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-warning" />
              Savings Goals
              {userPlan === 'free' && budgetData.goals.length >= 1 && (
                <Badge variant="outline" className="text-xs">Free: 1 goal</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {budgetData.goals.slice(0, userPlan === 'free' ? 1 : undefined).map((goal, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
                  <div>
                    <p className="font-medium">{goal.name}</p>
                    <p className="text-sm text-muted-foreground">Due: {goal.due_date}</p>
                  </div>
                  <p className="font-bold text-warning">${goal.target_amount}</p>
                </div>
              ))}
              
              {userPlan === 'free' && budgetData.goals.length > 1 && (
                <div className="p-3 bg-muted/50 rounded-lg border border-dashed">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {budgetData.goals.length - 1} more goal{budgetData.goals.length > 2 ? 's' : ''} (Pro feature)
                    </p>
                    <Button size="sm" variant="outline" onClick={() => setShowUpgradeModal(true)}>
                      Upgrade
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        feature="unlimited budget items"
      />
    </div>
  );
};

export default WeeklyBudgetDashboard;