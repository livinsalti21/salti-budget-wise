import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Lock, 
  History,
  FileDown,
  Calendar,
  AlertCircle,
  CheckCircle,
  Crown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { hasProAccess } from '@/lib/permissions/hasProAccess';
import BudgetPaywallModal from '@/components/ui/BudgetPaywallModal';
import type { BudgetInput, WeeklyBudgetResult, UserPlan } from '@/lib/budgetUtils';
import { computeWeeklyBudget, getCurrentWeekStart, getCurrentWeekEnd } from '@/lib/budgetUtils';
import { saveBudgetToDatabase } from '@/lib/budgetStorage';

interface WeeklyBudgetDashboardProps {
  budgetData: BudgetInput;
  budgetId?: string;
  onBudgetSaved?: (budgetId: string) => void;
}

const WeeklyBudgetDashboard = ({ budgetData, budgetId, onBudgetSaved }: WeeklyBudgetDashboardProps) => {
  const [budgetResult, setBudgetResult] = useState<WeeklyBudgetResult | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan>('free');
  const [defaultSplits, setDefaultSplits] = useState<any>(null);
  const [saveRate, setSaveRate] = useState<number[]>([20]);
  const [categorySliders, setCategorySliders] = useState<Record<string, number>>({});
  const [paywallModal, setPaywallModal] = useState<{ isOpen: boolean; feature: string }>({ isOpen: false, feature: '' });
  const [historyData, setHistoryData] = useState<any[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const isPro = hasProAccess({ plan: userPlan } as any);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  useEffect(() => {
    if (budgetData && userPlan) {
      computeBudget();
    }
  }, [budgetData, userPlan, defaultSplits, saveRate, categorySliders]);

  const loadUserProfile = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, default_splits')
      .eq('id', user.id)
      .single();

    if (profile) {
      setUserPlan((profile.plan as UserPlan) || 'free');
      setDefaultSplits(profile.default_splits);
      
      if (profile.default_splits && typeof profile.default_splits === 'object') {
        const splits = profile.default_splits as any;
        if (splits.save_rate) {
          setSaveRate([splits.save_rate * 100]);
        }
        
        if (splits.splits) {
          const sliders: Record<string, number> = {};
          Object.entries(splits.splits).forEach(([key, value]) => {
            sliders[key] = (value as number) * 100;
          });
          setCategorySliders(sliders);
        }
      }
    }
  };

  const computeBudget = () => {
    if (!budgetData) return;

    // Update budget data with current sliders if Pro
    let updatedBudgetData = { ...budgetData };
    if (isPro) {
      updatedBudgetData.variable_preferences = {
        save_rate: saveRate[0] / 100,
        splits: Object.entries(categorySliders).reduce((acc, [key, value]) => {
          acc[key] = value / 100;
          return acc;
        }, {} as Record<string, number>)
      };
    }

    const result = computeWeeklyBudget(updatedBudgetData, userPlan, defaultSplits);
    setBudgetResult(result);

    // Save to database
    saveBudgetToSupabase(result);
  };

  const saveBudgetToSupabase = async (result: WeeklyBudgetResult) => {
    if (!user) return;

    try {
      const { success, budgetId: savedBudgetId, error } = await saveBudgetToDatabase(
        user.id,
        budgetData,
        result
      );

      if (success && savedBudgetId && onBudgetSaved) {
        onBudgetSaved(savedBudgetId);
      }

      if (error) {
        console.error('Error saving budget:', error);
        toast({
          title: "Save Error",
          description: "Failed to save budget to database",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const handleSliderChange = (feature: string, value: number[]) => {
    if (!isPro) {
      setPaywallModal({ isOpen: true, feature });
      return;
    }

    if (feature === 'save_rate') {
      setSaveRate(value);
    } else {
      setCategorySliders(prev => ({ ...prev, [feature]: value[0] }));
    }
  };

  const updateUserDefaults = async () => {
    if (!user || !isPro) return;

    const newDefaults = {
      save_rate: saveRate[0] / 100,
      splits: Object.entries(categorySliders).reduce((acc, [key, value]) => {
        acc[key] = value / 100;
        return acc;
      }, {} as Record<string, number>)
    };

    await supabase
      .from('profiles')
      .update({ default_splits: newDefaults })
      .eq('id', user.id);

    toast({
      title: "Settings Saved",
      description: "Your budget preferences have been updated"
    });
  };

  const loadHistory = async () => {
    if (!isPro) {
      setPaywallModal({ isOpen: true, feature: 'HISTORY' });
      return;
    }

    const { data } = await supabase
      .from('weekly_budgets')
      .select('*')
      .eq('user_id', user?.id)
      .order('week_start_date', { ascending: false })
      .limit(12);

    setHistoryData(data || []);
  };

  const exportBudget = (format: 'csv' | 'pdf') => {
    if (!isPro) {
      setPaywallModal({ isOpen: true, feature: 'EXPORT' });
      return;
    }

    // Implementation for export functionality
    toast({
      title: "Export Started",
      description: `Preparing ${format.toUpperCase()} export...`
    });
  };

  if (!budgetResult) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Computing your weekly budget...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusColor = {
    healthy: 'text-success',
    warning: 'text-warning', 
    critical: 'text-destructive'
  }[budgetResult.status];

  const statusIcon = {
    healthy: CheckCircle,
    warning: AlertCircle,
    critical: AlertCircle
  }[budgetResult.status];

  const StatusIcon = statusIcon;

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Budget Overview
              </CardTitle>
              <CardDescription>
                Week of {new Date(getCurrentWeekStart()).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon className={`h-5 w-5 ${statusColor}`} />
              <Badge variant="outline" className={statusColor}>
                {budgetResult.status.charAt(0).toUpperCase() + budgetResult.status.slice(1)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                ${budgetResult.weekly.income}
              </div>
              <div className="text-sm text-muted-foreground">Weekly Income</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                ${budgetResult.weekly.fixed}
              </div>
              <div className="text-sm text-muted-foreground">Fixed Expenses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                ${budgetResult.weekly.save_n_stack}
              </div>
              <div className="text-sm text-muted-foreground">Save n Stack</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                ${budgetResult.weekly.variable_total}
              </div>
              <div className="text-sm text-muted-foreground">Variable Spending</div>
            </div>
          </div>

          {/* AI Tips */}
          {budgetResult.tips.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-sm">💡 AI Insights</h4>
              {budgetResult.tips.map((tip, index) => (
                <p key={index} className="text-sm text-muted-foreground">{tip}</p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Current Week</TabsTrigger>
          <TabsTrigger value="customize" className="relative">
            Customize
            {!isPro && <Crown className="h-3 w-3 ml-1 text-primary" />}
          </TabsTrigger>
          <TabsTrigger value="history" onClick={loadHistory} className="relative">
            History
            {!isPro && <Crown className="h-3 w-3 ml-1 text-primary" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Spending Plan</CardTitle>
              <CardDescription>How your money is allocated this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetResult.weekly.allocations.map((allocation, index) => {
                  const percentage = budgetResult.weekly.variable_total > 0 
                    ? (allocation.weekly_amount / budgetResult.weekly.variable_total) * 100 
                    : 0;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{allocation.name}</span>
                        <div className="text-right">
                          <div className="font-semibold">${allocation.weekly_amount}</div>
                          <div className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</div>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Save n Stack Action */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Save n Stack This Week
              </CardTitle>
              <CardDescription>
                Your automated savings goal for this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-primary">
                    ${budgetResult.weekly.save_n_stack}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {((budgetResult.weekly.save_n_stack / budgetResult.weekly.income) * 100).toFixed(1)}% of income
                  </div>
                </div>
                <Button 
                  size="lg"
                  onClick={() => !isPro && setPaywallModal({ isOpen: true, feature: 'AUTOMATION' })}
                  className="relative"
                >
                  {!isPro && <Lock className="mr-2 h-4 w-4" />}
                  {isPro ? 'Schedule Transfer' : 'Schedule (Pro)'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customize" className="space-y-6">
          {/* Save Rate Slider */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {!isPro && <Lock className="h-4 w-4 text-muted-foreground" />}
                Save Rate
                {!isPro && <Badge variant="outline" className="ml-2">Pro</Badge>}
              </CardTitle>
              <CardDescription>
                {isPro ? 'Adjust how much of your remaining income to save' : 'Fixed at 20% for Free users'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm w-12">0%</span>
                  <div className="flex-1">
                    <Slider
                      value={saveRate}
                      onValueChange={(value) => handleSliderChange('save_rate', value)}
                      max={50}
                      step={5}
                      disabled={!isPro}
                      className={!isPro ? 'opacity-50' : ''}
                    />
                  </div>
                  <span className="text-sm w-12">50%</span>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-primary">{saveRate[0]}%</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    = ${((budgetResult.weekly.remainder * saveRate[0]) / 100).toFixed(2)}/week
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Splits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {!isPro && <Lock className="h-4 w-4 text-muted-foreground" />}
                Category Splits
                {!isPro && <Badge variant="outline" className="ml-2">Pro</Badge>}
              </CardTitle>
              <CardDescription>
                {isPro ? 'Customize how your variable spending is allocated' : 'Fixed default splits for Free users'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(budgetResult.weekly.allocations[0] ? { 
                  groceries: 40,
                  gas: 20,
                  eating_out: 20,
                  fun: 15,
                  misc: 5
                } : {}).map(([category, defaultValue]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">
                        {category.replace('_', ' ')}
                      </span>
                      <span className="text-sm">
                        {categorySliders[category] || defaultValue}%
                      </span>
                    </div>
                    <Slider
                      value={[categorySliders[category] || defaultValue]}
                      onValueChange={(value) => handleSliderChange(category, value)}
                      max={60}
                      step={5}
                      disabled={!isPro}
                      className={!isPro ? 'opacity-50' : ''}
                    />
                  </div>
                ))}
              </div>
              
              {isPro && (
                <div className="pt-4 border-t">
                  <Button onClick={updateUserDefaults} variant="outline" className="w-full">
                    Save as Default
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Budget History
                  </CardTitle>
                  <CardDescription>Track your weekly budget performance over time</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => exportBudget('csv')}>
                    <FileDown className="mr-2 h-4 w-4" />
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportBudget('pdf')}>
                    <FileDown className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!isPro ? (
                <div className="text-center py-8 space-y-4">
                  <Lock className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                  <div>
                    <h3 className="font-semibold">History & Analytics</h3>
                    <p className="text-muted-foreground">Track trends and export your budget data with Pro</p>
                  </div>
                  <Button onClick={() => setPaywallModal({ isOpen: true, feature: 'HISTORY' })}>
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Pro
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {historyData.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No budget history yet. Come back next week!</p>
                    </div>
                  ) : (
                    historyData.map((budget, index) => (
                      <div key={budget.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">
                              Week of {new Date(budget.week_start_date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {Math.abs(new Date().getTime() - new Date(budget.week_start_date).getTime()) / (1000 * 60 * 60 * 24 * 7) > 1 ? 
                                `${Math.floor(Math.abs(new Date().getTime() - new Date(budget.week_start_date).getTime()) / (1000 * 60 * 60 * 24 * 7))} weeks ago` :
                                'Current week'
                              }
                            </div>
                          </div>
                          <Badge variant="outline">
                            ${budget.save_n_stack} saved
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Income</div>
                            <div className="font-semibold">${budget.income_weekly}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Fixed</div>
                            <div className="font-semibold">${budget.fixed_weekly}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Variable</div>
                            <div className="font-semibold">${budget.variable_total}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Saved</div>
                            <div className="font-semibold text-success">${budget.save_n_stack}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <BudgetPaywallModal
        isOpen={paywallModal.isOpen}
        onClose={() => setPaywallModal({ isOpen: false, feature: '' })}
        feature={paywallModal.feature}
      />
    </div>
  );
};

export default WeeklyBudgetDashboard;