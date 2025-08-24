import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, DollarSign, Target, CreditCard, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { BudgetInput } from '@/lib/budgetUtils';

interface AiBudgetInputProps {
  onBudgetExtracted: (data: BudgetInput) => void;
}

const AiBudgetInput = ({ onBudgetExtracted }: AiBudgetInputProps) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<BudgetInput | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAiExtraction = async () => {
    if (!user || !inputText.trim()) {
      toast({
        title: "Missing Information",
        description: "Please describe your financial situation",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-budget-assistant', {
        body: { input_text: inputText }
      });

      if (error) throw error;

      if (data.success && data.extracted_data) {
        setExtractedData(data.extracted_data);
        onBudgetExtracted(data.extracted_data);
        
        toast({
          title: "Budget Analyzed! 🎉",
          description: "Your financial information has been processed"
        });

        // Show tips if available
        if (data.tips && data.tips.length > 0) {
          setTimeout(() => {
            toast({
              title: "💡 AI Tips",
              description: data.tips[0],
              duration: 6000
            });
          }, 2000);
        }
      } else {
        throw new Error(data.error || 'Failed to process budget');
      }
    } catch (error: any) {
      console.error('AI extraction error:', error);
      toast({
        title: "Processing Error",
        description: error.message || "Failed to analyze your budget. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const clearData = () => {
    setInputText('');
    setExtractedData(null);
  };

  const examplePrompts = [
    "I make $2,400 monthly. Rent is $800, car payment $300, phone $50. Want to save $400/month for vacation by December.",
    "Biweekly paycheck of $1,200. Fixed costs: rent $900/month, utilities $120, gym $45. Goal: emergency fund $5,000 by next year.",
    "Income: $3,000/month + $500 side hustle. Expenses: mortgage $1,200, insurance $180, groceries ~$400. Saving for house down payment $50,000."
  ];

  return (
    <div className="space-y-6">
      <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Budget Assistant
          </CardTitle>
          <CardDescription>
            Describe your income, expenses, and goals in plain English. Our AI will create your personalized weekly budget.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Example: I make $2,000 monthly. My rent is $600, car payment $250, groceries around $300. I want to save $500 for a vacation by summer..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {inputText.length}/500 characters
              </span>
              <div className="flex gap-2">
                {inputText && (
                  <Button variant="ghost" size="sm" onClick={clearData}>
                    Clear
                  </Button>
                )}
                <Button 
                  onClick={handleAiExtraction}
                  disabled={!inputText.trim() || isProcessing}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analyze Budget
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Example Prompts */}
          <div>
            <p className="text-sm font-medium mb-2">Need inspiration? Try these examples:</p>
            <div className="space-y-2">
              {examplePrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-left h-auto p-3 whitespace-normal justify-start"
                  onClick={() => setInputText(prompt)}
                >
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {prompt}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extracted Data Preview */}
      {extractedData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">✅ Budget Analysis Complete</CardTitle>
            <CardDescription>Here's what we extracted from your input</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Income */}
              {extractedData.incomes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <DollarSign className="h-4 w-4 text-success" />
                    Income Sources
                  </div>
                  {extractedData.incomes.map((income, index) => (
                    <Badge key={index} variant="outline" className="mr-1">
                      ${income.amount} {income.cadence}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Fixed Expenses */}
              {extractedData.fixed_expenses.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CreditCard className="h-4 w-4 text-destructive" />
                    Fixed Expenses
                  </div>
                  {extractedData.fixed_expenses.map((expense, index) => (
                    <Badge key={index} variant="outline" className="mr-1">
                      {expense.name}: ${expense.amount} {expense.cadence}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Goals */}
              {extractedData.goals.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Target className="h-4 w-4 text-primary" />
                    Savings Goals
                  </div>
                  {extractedData.goals.map((goal, index) => (
                    <Badge key={index} variant="outline" className="mr-1">
                      {goal.name}: ${goal.target_amount} by {goal.due_date}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Save Rate */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Save Rate
                </div>
                <Badge variant="outline">
                  {(extractedData.variable_preferences.save_rate * 100).toFixed(0)}% of remaining income
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AiBudgetInput;