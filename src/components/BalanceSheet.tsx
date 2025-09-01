import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart,
  Download,
  RefreshCw,
  Building2,
  CreditCard,
  Wallet,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getCurrentWeekStart, formatCurrency } from '@/lib/budgetUtils';
import { hasProAccess } from '@/lib/permissions/hasProAccess';
import UpgradeModal from '@/components/ui/UpgradeModal';

interface BalanceSheetProps {
  budgetId?: string;
}

interface BalanceSheetData {
  budget_id: string;
  week_start: string;
  title: string;
  assets: {
    items: Array<{ name: string; planned: number; actual: number }>;
    total_planned: number;
    total_actual: number;
    variance: number;
  };
  liabilities: {
    items: Array<{ name: string; planned: number; actual: number }>;
    total_planned: number;
    total_actual: number;
    variance: number;
  };
  savings: {
    items: Array<{ name: string; planned: number; actual: number }>;
    total_planned: number;
    total_actual: number;
    variance: number;
  };
  net_worth: {
    planned: number;
    actual: number;
    savings_rate: number;
  };
  health_score: number;
}

export default function BalanceSheet({ budgetId }: BalanceSheetProps) {
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const isPro = hasProAccess(user);
  const FREE_LIMIT = { income: 1, expenses: 3, assets: 3, liabilities: 3 };

  useEffect(() => {
    if (user) {
      loadBalanceSheet();
    }
  }, [user, budgetId]);

  // Load real balance sheet data
  const loadBalanceSheet = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('budget-operations', {
        body: {
          action: 'get_balance_sheet',
          userId: user.id,
          budgetId
        }
      });

      if (error) throw error;
      
      setBalanceSheet(data?.balance_sheet || null);
    } catch (error: any) {
      console.error('Error loading balance sheet:', error);
      setBalanceSheet(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await loadBalanceSheet();
    setIsRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Balance sheet data updated"
    });
  };

  const exportBalanceSheet = async (format: 'csv' | 'pdf') => {
    if (!user || !balanceSheet) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('budget-operations', {
        body: {
          action: 'export_budget',
          userId: user.id,
          budgetId: balanceSheet.budget_id,
          format
        }
      });

      if (error) throw error;

      if (format === 'csv') {
        // Create downloadable CSV
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `balance-sheet-${balanceSheet.week_start}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }

      toast({
        title: "Export Complete",
        description: `Balance sheet exported as ${format.toUpperCase()}`
      });
    } catch (error) {
      console.error('Error exporting:', error);
      toast({
        title: "Export Error",
        description: "Failed to export balance sheet",
        variant: "destructive"
      });
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getHealthIcon = (score: number) => {
    if (score >= 80) return CheckCircle;
    return AlertTriangle;
  };

  const formatCurrencyValue = (cents: number) => {
    return (cents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading balance sheet...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!balanceSheet) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <PieChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Balance Sheet Data</h3>
          <p className="text-muted-foreground mb-4">
            Create a budget first to generate your balance sheet
          </p>
        </CardContent>
      </Card>
    );
  }

  const HealthIcon = getHealthIcon(balanceSheet.health_score);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Balance Sheet
              </CardTitle>
              <CardDescription>
                Financial position for week of {new Date(balanceSheet.week_start).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportBalanceSheet('csv')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HealthIcon className={`h-5 w-5 ${getHealthColor(balanceSheet.health_score)}`} />
            Financial Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress value={balanceSheet.health_score} className="h-3" />
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getHealthColor(balanceSheet.health_score)}`}>
                {balanceSheet.health_score}
              </div>
              <div className="text-sm text-muted-foreground">out of 100</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-success" />
              Income Sources
            </div>
            {!isPro && (
              <Badge variant="outline" className="text-xs">
                {balanceSheet.assets.items.length}/{FREE_LIMIT.income} Free
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {balanceSheet.assets.items.slice(0, isPro ? undefined : FREE_LIMIT.income).map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2">
                <span className="font-medium">{item.name}</span>
                <div className="text-right">
                  <div className="text-success font-semibold">
                    ${item.planned.toFixed(2)}
                  </div>
                  {item.actual > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Actual: ${item.actual.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {!isPro && balanceSheet.assets.items.length > FREE_LIMIT.income && (
              <div className="p-3 border border-dashed border-primary/30 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {balanceSheet.assets.items.length - FREE_LIMIT.income} more income sources available with Pro
                </p>
                <Button variant="outline" size="sm" onClick={() => setShowUpgradeModal(true)}>
                  Upgrade to Pro
                </Button>
              </div>
            )}
            
            <div className="border-t pt-3 flex justify-between items-center font-bold">
              <span>Total Income</span>
              <div className="text-right">
                <div className="text-success text-lg">
                  ${balanceSheet.assets.total_planned.toFixed(2)}
                </div>
                {balanceSheet.assets.variance !== 0 && (
                  <div className={`text-xs ${balanceSheet.assets.variance > 0 ? 'text-success' : 'text-destructive'}`}>
                    {balanceSheet.assets.variance > 0 ? '+' : ''}${balanceSheet.assets.variance.toFixed(2)} variance
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-destructive" />
              Expenses (Fixed & Variable)
            </div>
            {!isPro && (
              <Badge variant="outline" className="text-xs">
                {balanceSheet.liabilities.items.length}/{FREE_LIMIT.expenses} Free
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {balanceSheet.liabilities.items.slice(0, isPro ? undefined : FREE_LIMIT.expenses).map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2">
                <span className="font-medium">{item.name}</span>
                <div className="text-right">
                  <div className="text-destructive font-semibold">
                    ${item.planned.toFixed(2)}
                  </div>
                  {item.actual > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Actual: ${item.actual.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {!isPro && balanceSheet.liabilities.items.length > FREE_LIMIT.expenses && (
              <div className="p-3 border border-dashed border-primary/30 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {balanceSheet.liabilities.items.length - FREE_LIMIT.expenses} more expenses available with Pro
                </p>
                <Button variant="outline" size="sm" onClick={() => setShowUpgradeModal(true)}>
                  Upgrade to Pro
                </Button>
              </div>
            )}
            
            <div className="border-t pt-3 flex justify-between items-center font-bold">
              <span>Total Expenses</span>
              <div className="text-right">
                <div className="text-destructive text-lg">
                  ${balanceSheet.liabilities.total_planned.toFixed(2)}
                </div>
                {balanceSheet.liabilities.variance !== 0 && (
                  <div className={`text-xs ${balanceSheet.liabilities.variance < 0 ? 'text-success' : 'text-destructive'}`}>
                    {balanceSheet.liabilities.variance > 0 ? '+' : ''}${balanceSheet.liabilities.variance.toFixed(2)} variance
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Savings Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Savings & Investments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {balanceSheet.savings.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2">
                <span className="font-medium">{item.name}</span>
                <div className="text-right">
                  <div className="text-primary font-semibold">
                    ${item.planned.toFixed(2)}
                  </div>
                  {item.actual > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Actual: ${item.actual.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div className="border-t pt-3 flex justify-between items-center font-bold">
              <span>Total Savings</span>
              <div className="text-right">
                <div className="text-primary text-lg">
                  ${balanceSheet.savings.total_planned.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {balanceSheet.net_worth.savings_rate.toFixed(1)}% savings rate
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Net Worth Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Net Worth Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                ${balanceSheet.assets.total_planned.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Total Income</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                ${balanceSheet.liabilities.total_planned.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Total Expenses</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${balanceSheet.net_worth.planned > 0 ? 'text-success' : 'text-destructive'}`}>
                ${balanceSheet.net_worth.planned.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Net Position</div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Weekly Surplus</span>
              <div className="flex items-center gap-2">
                {balanceSheet.net_worth.planned > 0 ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span className={`font-bold ${balanceSheet.net_worth.planned > 0 ? 'text-success' : 'text-destructive'}`}>
                  ${balanceSheet.net_worth.planned.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="Unlimited budget items"
        title="Unlock Full Budget Tracking"
        description="Upgrade to Pro for unlimited income sources, expenses, and financial tracking."
      />
    </div>
  );
}