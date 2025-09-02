import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Calculator } from "lucide-react";
import BudgetPreview from "@/components/BudgetPreview";
import { BudgetFormSchema, type BudgetFormInput } from "@/lib/budget_schema";
import { createFallbackBudget, type FallbackInput } from "@/lib/budget_fallback";
import { analytics } from "@/analytics/analytics";
import type { BudgetInput } from "@/lib/budgetUtils";

interface FallbackBudgetFormProps {
  onBudgetCreated: (data: BudgetInput) => void;
  onBack: () => void;
}

export default function FallbackBudgetForm({ onBudgetCreated, onBack }: FallbackBudgetFormProps) {
  const [profile, setProfile] = useState<"student" | "family">("student");
  const [income, setIncome] = useState<string>("600");
  const [fixedExpenses, setFixedExpenses] = useState<{name: string; amount: string}[]>([
    { name: "Rent", amount: "200" }
  ]);
  const [debtMinimums, setDebtMinimums] = useState<{name: string; amount: string}[]>([]);
  const [savingsTarget, setSavingsTarget] = useState<string>("100");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const isEnabled = import.meta.env.VITE_FEATURE_BUDGET_FALLBACK_ENABLED !== "false";

  const addFixedExpense = () => {
    setFixedExpenses([...fixedExpenses, { name: "", amount: "0" }]);
  };

  const removeFixedExpense = (index: number) => {
    setFixedExpenses(fixedExpenses.filter((_, i) => i !== index));
  };

  const addDebtMinimum = () => {
    setDebtMinimums([...debtMinimums, { name: "", amount: "0" }]);
  };

  const removeDebtMinimum = (index: number) => {
    setDebtMinimums(debtMinimums.filter((_, i) => i !== index));
  };

  const updateFixedExpense = (index: number, field: 'name' | 'amount', value: string) => {
    const updated = [...fixedExpenses];
    updated[index] = { ...updated[index], [field]: value };
    setFixedExpenses(updated);
  };

  const updateDebtMinimum = (index: number, field: 'name' | 'amount', value: string) => {
    const updated = [...debtMinimums];
    updated[index] = { ...updated[index], [field]: value };
    setDebtMinimums(updated);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Track analytics event
      await analytics.track("budget_fallback_generate_clicked", {
        profile,
        income: parseFloat(income),
        fixedCount: fixedExpenses.length,
        debtCount: debtMinimums.length,
        savingsTarget: parseFloat(savingsTarget)
      });

      const formData: BudgetFormInput = {
        profile,
        income: parseFloat(income) || 0,
        fixedExpenses: fixedExpenses.map(f => ({ 
          name: f.name, 
          amount: parseFloat(f.amount) || 0 
        })),
        debtMinimums: debtMinimums.map(d => ({ 
          name: d.name, 
          amount: parseFloat(d.amount) || 0 
        })),
        savingsTarget: parseFloat(savingsTarget) || 0
      };

      const validated = BudgetFormSchema.parse(formData);
      const budgetResult = createFallbackBudget(validated as FallbackInput);
      
      setResult(budgetResult);

      // Track successful generation
      await analytics.track("budget_fallback_generated", {
        income: validated.income,
        savingsTarget: validated.savingsTarget,
        categories: budgetResult.weeklyBudget.categories.length,
        savingsActual: budgetResult.weeklyBudget.savingsTarget,
        hasShortfall: (validated.fixedExpenses.reduce((a, x) => a + x.amount, 0) + 
                      validated.debtMinimums.reduce((a, x) => a + x.amount, 0)) > validated.income
      });

    } catch (e: any) {
      await analytics.track("budget_fallback_error", { 
        message: e?.message ?? "unknown" 
      });
      
      if (e?.issues) {
        setError(e.issues.map((issue: any) => issue.message).join(", "));
      } else {
        setError(e?.message ?? "Invalid input");
      }
    }
    
    setLoading(false);
  };

  const handleUseBudget = () => {
    if (!result) return;

    // Convert fallback format to BudgetInput format
    const budgetInput: BudgetInput = {
      incomes: [{
        amount: result.weeklyBudget.incomeWeekly,
        cadence: "weekly",
        source: "Primary Income"
      }],
      fixed_expenses: result.weeklyBudget.categories
        .filter((cat: any) => !["Groceries", "Transport", "Discretionary", "Buffer"].includes(cat.name))
        .map((cat: any) => ({
          name: cat.name,
          amount: cat.amount,
          cadence: "weekly"
        })),
      variable_preferences: {
        save_rate: result.weeklyBudget.savingsTarget / result.weeklyBudget.incomeWeekly,
        splits: {
          groceries: 0.4,
          transport: 0.2,
          discretionary: 0.3,
          misc: 0.1
        }
      },
      goals: []
    };

    onBudgetCreated(budgetInput);
  };

  if (!isEnabled) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Save-n-Stack (Fallback) is currently disabled.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Save-n-Stack (Fallback)
          </span>
          <Badge variant="outline" className="text-xs">
            Deterministic
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile Selection */}
              <div className="space-y-2">
                <Label>Profile Type</Label>
                <RadioGroup value={profile} onValueChange={(value: "student" | "family") => setProfile(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="student" id="student" />
                    <Label htmlFor="student">Student</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="family" id="family" />
                    <Label htmlFor="family">Family</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Income and Savings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="income">Weekly Income</Label>
                  <Input
                    id="income"
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    placeholder="600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="savings">Savings Goal (weekly)</Label>
                  <Input
                    id="savings"
                    type="number"
                    value={savingsTarget}
                    onChange={(e) => setSavingsTarget(e.target.value)}
                    placeholder="100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fixed Expenses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Fixed Expenses</CardTitle>
                <Button variant="outline" size="sm" onClick={addFixedExpense}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {fixedExpenses.map((expense, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="Expense name"
                    value={expense.name}
                    onChange={(e) => updateFixedExpense(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={expense.amount}
                    onChange={(e) => updateFixedExpense(index, 'amount', e.target.value)}
                    className="w-24"
                  />
                  <Button
                    variant="outline" 
                    size="sm"
                    onClick={() => removeFixedExpense(index)}
                    disabled={fixedExpenses.length === 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Debt Minimums */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Debt Minimums</CardTitle>
                <Button variant="outline" size="sm" onClick={addDebtMinimum}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {debtMinimums.length === 0 ? (
                <p className="text-sm text-muted-foreground">No debt minimums added yet.</p>
              ) : (
                debtMinimums.map((debt, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="Debt name"
                      value={debt.name}
                      onChange={(e) => updateDebtMinimum(index, 'name', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Minimum"
                      value={debt.amount}
                      onChange={(e) => updateDebtMinimum(index, 'amount', e.target.value)}
                      className="w-24"
                    />
                    <Button
                      variant="outline"
                      size="sm" 
                      onClick={() => removeDebtMinimum(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Generating..." : "Generate Budget"}
          </Button>

          <div className="text-xs text-muted-foreground text-center">
            Upgrade later to AI Budgets for personalized insights.
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="space-y-4">
          {result ? (
            <>
              <BudgetPreview data={result} />
              <Button onClick={handleUseBudget} className="w-full" size="lg">
                Use This Budget
              </Button>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Generate your budget to see the preview</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}