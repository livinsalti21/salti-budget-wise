import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Home,
  Car,
  Phone,
  Zap,
  Target,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Calculator,
  ShoppingBag,
  Coffee,
  Gamepad2,
  Smartphone,
  Shield,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { BudgetInput } from '@/lib/budgetUtils';
import { saveBudgetToDatabase } from '@/lib/budgetStorage';
import { computeWeeklyBudget } from '@/lib/budgetUtils';

interface SaveNStackBudgetProps {
  onBudgetCreated: (data: BudgetInput) => void;
  onBack: () => void;
}

const SaveNStackBudget = ({ onBudgetCreated, onBack }: SaveNStackBudgetProps) => {
  const [currentStep, setCurrentStep] = useState<'income' | 'bills' | 'goal' | 'review'>('income');
  const [budgetData, setBudgetData] = useState<BudgetInput>({
    incomes: [{ amount: 0, cadence: 'weekly', source: 'Primary Income' }],
    fixed_expenses: [],
    variable_preferences: {
      save_rate: 0.20,
      splits: {
        groceries: 0.35,
        gas: 0.25,
        eating_out: 0.20,
        fun: 0.15,
        misc: 0.05
      }
    },
    goals: []
  });

  const { user } = useAuth();
  const { toast } = useToast();

  const steps = [
    { id: 'income', title: 'Income', description: 'How much do you make?', emoji: '💰' },
    { id: 'bills', title: 'Bills', description: 'What do you pay regularly?', emoji: '📄' },
    { id: 'goal', title: 'Goals', description: 'What are you saving for?', emoji: '🎯' },
    { id: 'review', title: 'Review', description: 'Looks good!', emoji: '✨' }
  ];

  const getCurrentStepIndex = () => steps.findIndex(step => step.id === currentStep);
  const getProgress = () => ((getCurrentStepIndex() + 1) / steps.length) * 100;

  // Quick-entry amounts for income (weekly)
  const quickIncomes = [300, 400, 500, 600, 800, 1000];
  
  // Common bill options
  const quickBills = [
    { name: 'Rent', icon: Home, amounts: [200, 300, 400, 500] },
    { name: 'Phone', icon: Phone, amounts: [15, 25, 35, 50] },
    { name: 'Car Payment', icon: Car, amounts: [75, 100, 150, 200] },
    { name: 'Insurance', icon: Shield, amounts: [25, 50, 75, 100] },
    { name: 'Utilities', icon: Zap, amounts: [30, 50, 75, 100] }
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 'income':
        return budgetData.incomes[0]?.amount > 0;
      case 'bills':
        return true; // Optional step
      case 'goal':
        return true; // Optional step  
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id as any);
    }
  };

  const handlePrevious = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id as any);
    }
  };

  const handleIncomeSelect = (amount: number) => {
    setBudgetData(prev => ({
      ...prev,
      incomes: [{ ...prev.incomes[0], amount }]
    }));
  };

  const handleBillAdd = (name: string, amount: number) => {
    const exists = budgetData.fixed_expenses.find(exp => exp.name === name);
    if (exists) return;

    setBudgetData(prev => ({
      ...prev,
      fixed_expenses: [...prev.fixed_expenses, { 
        name, 
        amount, 
        cadence: 'weekly' 
      }]
    }));
  };

  const handleBillRemove = (name: string) => {
    setBudgetData(prev => ({
      ...prev,
      fixed_expenses: prev.fixed_expenses.filter(exp => exp.name !== name)
    }));
  };

  const handleGoalSet = (amount: number) => {
    setBudgetData(prev => ({
      ...prev,
      goals: [{ 
        name: 'My Savings Goal', 
        target_amount: amount,
        due_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
      }]
    }));
  };

  const handleCreateBudget = async () => {
    const finalBudgetData = {
      ...budgetData,
      fixed_expenses: budgetData.fixed_expenses.filter(expense => expense.amount > 0)
    };

    if (user) {
      try {
        const budgetResult = computeWeeklyBudget(finalBudgetData, 'free');
        await saveBudgetToDatabase(user.id, finalBudgetData, budgetResult, 'Save-n-Stack Budget');
      } catch (saveError) {
        console.error('Error saving Save-n-Stack budget:', saveError);
      }
    }

    onBudgetCreated(finalBudgetData);
    
    toast({
      title: "Budget Created! 🎉",
      description: "Your Save-n-Stack budget is ready to help you save!"
    });
  };

  // Real-time budget preview
  const budgetPreview = computeWeeklyBudget(budgetData, 'free');
  const weeklyIncome = budgetData.incomes[0]?.amount || 0;
  const totalBills = budgetData.fixed_expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remaining = weeklyIncome - totalBills;
  const savingsAmount = remaining * 0.20;

  const renderStepContent = () => {
    switch (currentStep) {
      case 'income':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">💰</div>
              <h2 className="text-2xl font-bold mb-2">How much do you make per week?</h2>
              <p className="text-muted-foreground">Don't worry, we'll help you budget it wisely</p>
            </div>

            {/* Quick buttons */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {quickIncomes.map((amount) => (
                <Button
                  key={amount}
                  variant={budgetData.incomes[0]?.amount === amount ? "default" : "outline"}
                  className="h-16 text-lg font-semibold"
                  onClick={() => handleIncomeSelect(amount)}
                >
                  ${amount}
                  <span className="text-sm font-normal ml-1">/week</span>
                </Button>
              ))}
            </div>

            {/* Custom input */}
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="number"
                placeholder="Enter custom amount"
                className="pl-10 h-14 text-lg text-center"
                value={budgetData.incomes[0]?.amount || ''}
                onChange={(e) => handleIncomeSelect(parseFloat(e.target.value) || 0)}
              />
            </div>

            {/* Real-time impact */}
            {weeklyIncome > 0 && (
              <Card className="bg-gradient-to-r from-success/10 to-success/5 border-success/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">With smart budgeting, you could save</p>
                      <p className="text-2xl font-bold text-success">${(weeklyIncome * 0.15).toFixed(0)}-${(weeklyIncome * 0.25).toFixed(0)}/week</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-success" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'bills':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">📄</div>
              <h2 className="text-2xl font-bold mb-2">What bills do you pay?</h2>
              <p className="text-muted-foreground">Tap to add common expenses</p>
            </div>

            {/* Quick bill categories */}
            <div className="space-y-4">
              {quickBills.map((category) => {
                const Icon = category.icon;
                const isAdded = budgetData.fixed_expenses.some(exp => exp.name === category.name);
                
                return (
                  <Card key={category.name} className={isAdded ? "bg-success/5 border-success/20" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{category.name}</span>
                        {isAdded && <Badge variant="secondary" className="ml-auto">Added</Badge>}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {category.amounts.map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            size="sm"
                            disabled={isAdded}
                            onClick={() => handleBillAdd(category.name, amount)}
                          >
                            ${amount}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Added bills */}
            {budgetData.fixed_expenses.length > 0 && (
              <Card className="bg-muted/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    Your Bills
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {budgetData.fixed_expenses.map((expense, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <span>{expense.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">${expense.amount}/week</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBillRemove(expense.name)}
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Budget preview */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Money left after bills</p>
                  <p className="text-3xl font-bold text-primary">${remaining > 0 ? remaining.toFixed(0) : '0'}/week</p>
                  {remaining > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      That's ${(remaining * 52).toFixed(0)} per year! 🎉
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'goal':
        const goalAmounts = [500, 1000, 2500, 5000, 10000];
        
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold mb-2">What's your savings goal?</h2>
              <p className="text-muted-foreground">Pick a target that excites you</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {goalAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant={budgetData.goals[0]?.target_amount === amount ? "default" : "outline"}
                  className="h-16 flex-col gap-1"
                  onClick={() => handleGoalSet(amount)}
                >
                  <span className="text-lg font-bold">${amount.toLocaleString()}</span>
                  {savingsAmount > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {Math.ceil(amount / (savingsAmount * 52))} years
                    </span>
                  )}
                </Button>
              ))}
            </div>

            {budgetData.goals.length > 0 && savingsAmount > 0 && (
              <Card className="bg-gradient-to-r from-success/10 to-success/5 border-success/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">At ${savingsAmount.toFixed(0)}/week, you'll save</p>
                    <p className="text-2xl font-bold text-success">
                      ${(savingsAmount * 52).toFixed(0)} per year
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <Target className="h-4 w-4 text-success" />
                      <span className="text-sm">
                        Goal reached in {Math.ceil(budgetData.goals[0].target_amount / (savingsAmount * 52))} years
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">✨</div>
              <h2 className="text-2xl font-bold mb-2">Your Save-n-Stack Budget</h2>
              <p className="text-muted-foreground">Smart, simple, and ready to help you save</p>
            </div>

            <Card className="bg-gradient-to-br from-background to-muted/20">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Weekly Income</span>
                  <span className="font-bold text-lg">${budgetPreview.weekly.income}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Fixed Bills</span>
                  <span className="text-destructive">-${budgetPreview.weekly.fixed}</span>
                </div>
                <div className="border-t pt-3 flex items-center justify-between">
                  <span className="text-muted-foreground">Available to Budget</span>
                  <span className="font-bold">${budgetPreview.weekly.remainder}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-success font-medium">💰 Save & Stack</span>
                  <span className="font-bold text-success">${budgetPreview.weekly.save_n_stack}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Spending Money</span>
                  <span className="font-bold">${budgetPreview.weekly.variable_total}</span>
                </div>
              </CardContent>
            </Card>

            {/* Spending categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Smart Spending Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {budgetPreview.weekly.allocations.map((allocation, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {allocation.name === 'Groceries' && <ShoppingBag className="h-4 w-4" />}
                      {allocation.name === 'Gas' && <Car className="h-4 w-4" />}
                      {allocation.name === 'Eating Out' && <Coffee className="h-4 w-4" />}
                      {allocation.name === 'Fun' && <Gamepad2 className="h-4 w-4" />}
                      {allocation.name === 'Misc' && <Smartphone className="h-4 w-4" />}
                      <span>{allocation.name}</span>
                    </div>
                    <Badge variant="outline">${allocation.weekly_amount}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-medium">Your budget status:</p>
                  <p className="text-lg font-bold text-primary capitalize">{budgetPreview.status}</p>
                  <p className="text-sm text-muted-foreground mt-2">{budgetPreview.tips[0]}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Step {getCurrentStepIndex() + 1} of {steps.length}
            </p>
          </div>
        </div>

        <Progress value={getProgress()} className="h-2" />

        <div className="flex justify-center gap-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`text-center ${
                index <= getCurrentStepIndex() 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              <div className="text-2xl">{step.emoji}</div>
              <p className="text-xs">{step.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <Card>
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 'income'}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        {currentStep === 'review' ? (
          <Button onClick={handleCreateBudget} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Create Budget
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="gap-2"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default SaveNStackBudget;