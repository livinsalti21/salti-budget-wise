import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Trash2, 
  DollarSign, 
  CreditCard, 
  Target, 
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Lock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { hasProAccess } from '@/lib/permissions/hasProAccess';
import BudgetPaywallModal from '@/components/ui/BudgetPaywallModal';
import type { BudgetInput } from '@/lib/budgetUtils';

interface EnhancedManualInputProps {
  onBudgetCreated: (data: BudgetInput) => void;
  onBack: () => void;
}

const EnhancedManualInput = ({ onBudgetCreated, onBack }: EnhancedManualInputProps) => {
  const [currentStep, setCurrentStep] = useState<'income' | 'expenses' | 'goals' | 'review'>('income');
  const [budgetData, setBudgetData] = useState<BudgetInput>({
    incomes: [{ amount: 0, cadence: 'monthly', source: '' }],
    fixed_expenses: [],
    variable_preferences: {
      save_rate: 0.20,
      splits: {
        groceries: 0.4,
        gas: 0.2,
        eating_out: 0.2,
        fun: 0.15,
        misc: 0.05
      }
    },
    goals: []
  });
  const [paywallModal, setPaywallModal] = useState<{ isOpen: boolean; feature: string }>({ 
    isOpen: false, 
    feature: '' 
  });
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Mock user plan - in real app, get from profile
  const isPro = hasProAccess({ plan: 'free' } as any);

  const steps = [
    { id: 'income', title: 'Income', description: 'Add your income sources' },
    { id: 'expenses', title: 'Fixed Expenses', description: 'Add bills and fixed costs' },
    { id: 'goals', title: 'Savings Goals', description: 'Set your financial targets' },
    { id: 'review', title: 'Review', description: 'Review and create budget' }
  ];

  const getCurrentStepIndex = () => steps.findIndex(step => step.id === currentStep);
  const getProgress = () => ((getCurrentStepIndex() + 1) / steps.length) * 100;

  const addIncome = () => {
    if (!isPro && budgetData.incomes.length >= 1) {
      setPaywallModal({ isOpen: true, feature: 'MULTIPLE_INCOMES' });
      return;
    }
    
    setBudgetData(prev => ({
      ...prev,
      incomes: [...prev.incomes, { amount: 0, cadence: 'monthly', source: '' }]
    }));
  };

  const updateIncome = (index: number, field: keyof typeof budgetData.incomes[0], value: string | number) => {
    setBudgetData(prev => ({
      ...prev,
      incomes: prev.incomes.map((income, i) => 
        i === index ? { ...income, [field]: value } : income
      )
    }));
  };

  const removeIncome = (index: number) => {
    if (budgetData.incomes.length > 1) {
      setBudgetData(prev => ({
        ...prev,
        incomes: prev.incomes.filter((_, i) => i !== index)
      }));
    }
  };

  const addExpense = () => {
    if (!isPro && budgetData.fixed_expenses.length >= 4) {
      setPaywallModal({ isOpen: true, feature: 'UNLIMITED_BILLS' });
      return;
    }
    
    setBudgetData(prev => ({
      ...prev,
      fixed_expenses: [...prev.fixed_expenses, { name: '', amount: 0, cadence: 'monthly' }]
    }));
  };

  const updateExpense = (index: number, field: keyof typeof budgetData.fixed_expenses[0], value: string | number) => {
    setBudgetData(prev => ({
      ...prev,
      fixed_expenses: prev.fixed_expenses.map((expense, i) => 
        i === index ? { ...expense, [field]: value } : expense
      )
    }));
  };

  const removeExpense = (index: number) => {
    setBudgetData(prev => ({
      ...prev,
      fixed_expenses: prev.fixed_expenses.filter((_, i) => i !== index)
    }));
  };

  const addGoal = () => {
    if (!isPro && budgetData.goals.length >= 1) {
      setPaywallModal({ isOpen: true, feature: 'MULTIPLE_GOALS' });
      return;
    }
    
    setBudgetData(prev => ({
      ...prev,
      goals: [...prev.goals, { name: '', target_amount: 0, due_date: '' }]
    }));
  };

  const updateGoal = (index: number, field: keyof typeof budgetData.goals[0], value: string | number) => {
    setBudgetData(prev => ({
      ...prev,
      goals: prev.goals.map((goal, i) => 
        i === index ? { ...goal, [field]: value } : goal
      )
    }));
  };

  const removeGoal = (index: number) => {
    setBudgetData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'income':
        return budgetData.incomes.some(income => income.amount > 0 && income.source);
      case 'expenses':
        return true; // Optional step
      case 'goals':
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

  const handleCreateBudget = () => {
    // Validate required fields
    const validIncomes = budgetData.incomes.filter(income => income.amount > 0 && income.source);
    if (validIncomes.length === 0) {
      toast({
        title: "Income Required",
        description: "Please add at least one income source",
        variant: "destructive"
      });
      return;
    }

    const finalBudgetData = {
      ...budgetData,
      incomes: validIncomes,
      fixed_expenses: budgetData.fixed_expenses.filter(expense => expense.name && expense.amount > 0),
      goals: budgetData.goals.filter(goal => goal.name && goal.target_amount > 0 && goal.due_date)
    };

    onBudgetCreated(finalBudgetData);
    
    toast({
      title: "Budget Created! 🎉",
      description: "Your manual budget has been created successfully"
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'income':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-success" />
                Income Sources
              </CardTitle>
              <CardDescription>
                Add all your income sources (salary, freelance, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {budgetData.incomes.map((income, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label htmlFor={`income-source-${index}`}>Source</Label>
                    <Input
                      id={`income-source-${index}`}
                      placeholder="e.g., Salary, Freelance"
                      value={income.source}
                      onChange={(e) => updateIncome(index, 'source', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`income-amount-${index}`}>Amount</Label>
                    <Input
                      id={`income-amount-${index}`}
                      type="number"
                      placeholder="0"
                      value={income.amount || ''}
                      onChange={(e) => updateIncome(index, 'amount', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Frequency</Label>
                    <Select 
                      value={income.cadence} 
                      onValueChange={(value) => updateIncome(index, 'cadence', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    {budgetData.incomes.length > 1 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => removeIncome(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              <Button 
                onClick={addIncome} 
                variant="outline" 
                className="w-full"
                disabled={!isPro && budgetData.incomes.length >= 1}
              >
                {!isPro && budgetData.incomes.length >= 1 ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Multiple Incomes (Pro)
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Income Source
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );

      case 'expenses':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-destructive" />
                Fixed Expenses
              </CardTitle>
              <CardDescription>
                Add your regular bills and fixed costs (rent, insurance, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {budgetData.fixed_expenses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No fixed expenses added yet</p>
                  <p className="text-sm">Add your bills and regular payments</p>
                </div>
              ) : (
                budgetData.fixed_expenses.map((expense, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div>
                      <Label htmlFor={`expense-name-${index}`}>Expense Name</Label>
                      <Input
                        id={`expense-name-${index}`}
                        placeholder="e.g., Rent, Car Payment"
                        value={expense.name}
                        onChange={(e) => updateExpense(index, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`expense-amount-${index}`}>Amount</Label>
                      <Input
                        id={`expense-amount-${index}`}
                        type="number"
                        placeholder="0"
                        value={expense.amount || ''}
                        onChange={(e) => updateExpense(index, 'amount', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Frequency</Label>
                      <Select 
                        value={expense.cadence} 
                        onValueChange={(value) => updateExpense(index, 'cadence', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => removeExpense(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
              
              <Button 
                onClick={addExpense} 
                variant="outline" 
                className="w-full"
                disabled={!isPro && budgetData.fixed_expenses.length >= 4}
              >
                {!isPro && budgetData.fixed_expenses.length >= 4 ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Unlimited Bills (Pro)
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Fixed Expense
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );

      case 'goals':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Savings Goals
              </CardTitle>
              <CardDescription>
                Set your financial targets and deadlines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {budgetData.goals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No savings goals added yet</p>
                  <p className="text-sm">Add goals to stay motivated</p>
                </div>
              ) : (
                budgetData.goals.map((goal, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div>
                      <Label htmlFor={`goal-name-${index}`}>Goal Name</Label>
                      <Input
                        id={`goal-name-${index}`}
                        placeholder="e.g., Emergency Fund"
                        value={goal.name}
                        onChange={(e) => updateGoal(index, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`goal-amount-${index}`}>Target Amount</Label>
                      <Input
                        id={`goal-amount-${index}`}
                        type="number"
                        placeholder="0"
                        value={goal.target_amount || ''}
                        onChange={(e) => updateGoal(index, 'target_amount', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`goal-date-${index}`}>Target Date</Label>
                      <Input
                        id={`goal-date-${index}`}
                        type="date"
                        value={goal.due_date}
                        onChange={(e) => updateGoal(index, 'due_date', e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => removeGoal(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
              
              <Button 
                onClick={addGoal} 
                variant="outline" 
                className="w-full"
                disabled={!isPro && budgetData.goals.length >= 1}
              >
                {!isPro && budgetData.goals.length >= 1 ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Multiple Goals (Pro)
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Savings Goal
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );

      case 'review':
        const totalWeeklyIncome = budgetData.incomes.reduce((sum, income) => {
          const weekly = income.cadence === 'monthly' ? income.amount / 4.345 : income.amount;
          return sum + weekly;
        }, 0);
        
        const totalWeeklyExpenses = budgetData.fixed_expenses.reduce((sum, expense) => {
          const weekly = expense.cadence === 'monthly' ? expense.amount / 4.345 : expense.amount;
          return sum + weekly;
        }, 0);

        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Budget Summary
                </CardTitle>
                <CardDescription>
                  Review your budget before creating
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-success">
                      ${totalWeeklyIncome.toFixed(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Weekly Income</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-destructive">
                      ${totalWeeklyExpenses.toFixed(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Fixed Expenses</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      ${(totalWeeklyIncome - totalWeeklyExpenses).toFixed(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Remaining</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Income Summary */}
                  <div>
                    <h4 className="font-semibold text-success mb-2">Income Sources</h4>
                    <div className="space-y-2">
                      {budgetData.incomes.filter(income => income.source && income.amount > 0).map((income, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-success/10 rounded">
                          <span>{income.source}</span>
                          <Badge variant="outline">${income.amount} {income.cadence}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expenses Summary */}
                  <div>
                    <h4 className="font-semibold text-destructive mb-2">Fixed Expenses</h4>
                    <div className="space-y-2">
                      {budgetData.fixed_expenses.filter(expense => expense.name && expense.amount > 0).length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No fixed expenses added</p>
                      ) : (
                        budgetData.fixed_expenses.filter(expense => expense.name && expense.amount > 0).map((expense, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-destructive/10 rounded">
                            <span>{expense.name}</span>
                            <Badge variant="outline">${expense.amount} {expense.cadence}</Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Goals Summary */}
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-primary mb-2">Savings Goals</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {budgetData.goals.filter(goal => goal.name && goal.target_amount > 0).length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No savings goals added</p>
                      ) : (
                        budgetData.goals.filter(goal => goal.name && goal.target_amount > 0).map((goal, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-primary/10 rounded">
                            <span>{goal.name}</span>
                            <Badge variant="outline">${goal.target_amount} by {goal.due_date}</Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
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
    <div className="space-y-6">
      {/* Header & Progress */}
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">Manual Budget Creation</h3>
          <p className="text-muted-foreground">
            Step {getCurrentStepIndex() + 1} of {steps.length}: {steps[getCurrentStepIndex()].description}
          </p>
        </div>
        
        <div className="space-y-2">
          <Progress value={getProgress()} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground">
            {steps.map((step, index) => (
              <span 
                key={step.id} 
                className={index <= getCurrentStepIndex() ? 'text-primary font-medium' : ''}
              >
                {step.title}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          onClick={getCurrentStepIndex() === 0 ? onBack : handlePrevious}
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {getCurrentStepIndex() === 0 ? 'Back to Methods' : 'Previous'}
        </Button>
        
        {currentStep === 'review' ? (
          <Button onClick={handleCreateBudget} disabled={!canProceed()}>
            Create Budget
            <CheckCircle className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={!canProceed()}>
            Next Step
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Paywall Modal */}
      <BudgetPaywallModal
        isOpen={paywallModal.isOpen}
        onClose={() => setPaywallModal({ isOpen: false, feature: '' })}
        feature={paywallModal.feature}
      />
    </div>
  );
};

export default EnhancedManualInput;