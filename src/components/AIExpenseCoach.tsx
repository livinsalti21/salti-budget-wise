import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AISuggestion {
  id: string;
  suggestion_text: string;
  category: string;
  potential_savings_cents: number;
  future_value_projection: any;
  is_applied: boolean;
  created_at: string;
}

export const AIExpenseCoach: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (user) {
      loadSuggestions();
    }
  }, [user]);

  const loadSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_suggestions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const runAnalysis = async () => {
    if (!user) return;

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-expense-coach', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Analysis Complete",
        description: `Generated ${data.suggestions?.length || 0} new suggestions`,
      });

      await loadSuggestions();
    } catch (error) {
      console.error('Error running analysis:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze your spending patterns",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const applySuggestion = async (suggestionId: string) => {
    try {
      const { error } = await supabase
        .from('ai_suggestions')
        .update({ is_applied: true })
        .eq('id', suggestionId);

      if (error) throw error;

      setSuggestions(prev => 
        prev.map(s => s.id === suggestionId ? { ...s, is_applied: true } : s)
      );

      toast({
        title: "Suggestion Applied",
        description: "Great job implementing this money-saving tip!",
      });
    } catch (error) {
      console.error('Error applying suggestion:', error);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      food: 'bg-orange-100 text-orange-800',
      transportation: 'bg-blue-100 text-blue-800',
      entertainment: 'bg-purple-100 text-purple-800',
      shopping: 'bg-pink-100 text-pink-800',
      utilities: 'bg-green-100 text-green-800',
      default: 'bg-gray-100 text-gray-800',
    };
    return colors[category.toLowerCase()] || colors.default;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Expense Coach
              </CardTitle>
              <CardDescription>
                AI-powered suggestions to optimize your spending and boost your future wealth
              </CardDescription>
            </div>
            <Button onClick={runAnalysis} disabled={analyzing}>
              {analyzing ? 'Analyzing...' : 'Run Analysis'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {suggestions.length === 0 && !analyzing && (
        <Card>
          <CardContent className="text-center py-8">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Suggestions Yet</h3>
            <p className="text-muted-foreground mb-4">
              Run an analysis to get personalized money-saving suggestions
            </p>
            <Button onClick={runAnalysis} disabled={analyzing}>
              Get AI Suggestions
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id} className={suggestion.is_applied ? 'bg-green-50 border-green-200' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className={getCategoryColor(suggestion.category)}>
                      {suggestion.category}
                    </Badge>
                    {suggestion.is_applied && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Applied
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-foreground mb-4">
                    {suggestion.suggestion_text}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Monthly Savings</p>
                        <p className="font-semibold text-green-600">
                          {formatCurrency(suggestion.potential_savings_cents)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">20-Year Value</p>
                        <p className="font-semibold text-blue-600">
                          {formatCurrency(suggestion.future_value_projection.future_value_20yr * 100)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Suggested</p>
                        <p className="text-sm">
                          {new Date(suggestion.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {!suggestion.is_applied && (
                  <Button
                    size="sm"
                    onClick={() => applySuggestion(suggestion.id)}
                    className="ml-4"
                  >
                    Apply
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};