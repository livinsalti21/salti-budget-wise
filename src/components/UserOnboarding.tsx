import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Target, Zap, Gift, ArrowRight, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingSuggestion {
  id: string;
  suggestion_type: 'stacklet' | 'payday_rule';
  title: string;
  emoji?: string;
  target_cents?: number;
  amount_cents?: number;
  cadence?: string;
  is_applied: boolean;
}

const UserOnboarding = () => {
  const [suggestions, setSuggestions] = useState<OnboardingSuggestion[]>([]);
  const [appliedCount, setAppliedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const loadSuggestions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('onboarding_suggestions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at');

    if (error) {
      console.error('Error loading suggestions:', error);
    } else {
      setSuggestions((data || []) as OnboardingSuggestion[]);
      const applied = (data || []).filter(s => s.is_applied).length;
      setAppliedCount(applied);
      
      // Show onboarding if user has suggestions and hasn't completed them all
      setShowOnboarding((data || []).length > 0 && applied < (data || []).length);
    }
  };

  const createInitialSuggestions = async () => {
    if (!user) return;

    // Check if suggestions already exist
    const { data: existing } = await supabase
      .from('onboarding_suggestions')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (existing && existing.length > 0) {
      return; // Already have suggestions
    }

    // Create initial suggestions
    const { error } = await supabase.rpc('create_onboarding_suggestions', {
      target_user_id: user.id
    });

    if (error) {
      console.error('Error creating suggestions:', error);
    } else {
      loadSuggestions();
    }
  };

  useEffect(() => {
    if (user) {
      loadSuggestions().then(() => {
        createInitialSuggestions();
      });
    }
  }, [user]);

  const applySuggestion = async (suggestion: OnboardingSuggestion) => {
    if (!user) return;
    
    setIsLoading(true);

    try {
      if (suggestion.suggestion_type === 'stacklet') {
        // Create stacklet
        const { error: stackletError } = await supabase
          .from('stacklets')
          .insert({
            user_id: user.id,
            title: suggestion.title,
            emoji: suggestion.emoji || '🎯',
            target_cents: suggestion.target_cents,
            asset_type: 'CASH'
          });

        if (stackletError) throw stackletError;

      } else if (suggestion.suggestion_type === 'payday_rule') {
        // Get user's first stacklet to attach rule to
        const { data: stacklets } = await supabase
          .from('stacklets')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (stacklets && stacklets.length > 0) {
          const nextFriday = new Date();
          const daysUntilFriday = (5 + 7 - nextFriday.getDay()) % 7;
          nextFriday.setDate(nextFriday.getDate() + daysUntilFriday);

          const { error: ruleError } = await supabase
            .from('payday_rules')
            .insert({
              user_id: user.id,
              stacklet_id: stacklets[0].id,
              trigger_cadence: suggestion.cadence as 'weekly' | 'biweekly' | 'monthly',
              amount_cents: suggestion.amount_cents || 2500,
              next_run_at: nextFriday.toISOString(),
            });

          if (ruleError) throw ruleError;
        }
      }

      // Mark suggestion as applied
      const { error: updateError } = await supabase
        .from('onboarding_suggestions')
        .update({ is_applied: true })
        .eq('id', suggestion.id);

      if (updateError) throw updateError;

      toast({
        title: "Applied! ✨",
        description: `${suggestion.title} has been set up for you.`,
      });

      loadSuggestions();

    } catch (error) {
      console.error('Error applying suggestion:', error);
      toast({
        title: "Error applying suggestion",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('onboarding_dismissed', 'true');
  };

  const progressPercentage = suggestions.length > 0 ? (appliedCount / suggestions.length) * 100 : 0;

  if (!showOnboarding || suggestions.length === 0) {
    return null; // Don't show if onboarding is complete or no suggestions
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Welcome to Livin Salti! Get Started
        </CardTitle>
        <CardDescription>
          Let's set up your first stacklets and saving rules to get you started
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Setup Progress</span>
            <span className="font-medium">{appliedCount}/{suggestions.length} complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Suggestions */}
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
              suggestion.is_applied 
                ? 'bg-success/10 border-success/20' 
                : 'bg-background border-border hover:border-primary/20'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  suggestion.is_applied 
                    ? 'bg-success text-success-foreground' 
                    : 'bg-primary text-primary-foreground'
                }`}>
                  {suggestion.is_applied ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : suggestion.suggestion_type === 'stacklet' ? (
                    <Target className="h-5 w-5" />
                  ) : (
                    <Zap className="h-5 w-5" />
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    {suggestion.emoji && <span>{suggestion.emoji}</span>}
                    {suggestion.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {suggestion.suggestion_type === 'stacklet' 
                      ? `Save toward your ${suggestion.title.toLowerCase()} goals`
                      : `Automatically save $${((suggestion.amount_cents || 0) / 100).toFixed(2)} ${suggestion.cadence}`
                    }
                  </p>
                  {suggestion.target_cents && (
                    <Badge variant="outline" className="mt-1">
                      Target: ${(suggestion.target_cents / 100).toFixed(2)}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div>
                {suggestion.is_applied ? (
                  <Badge variant="default" className="bg-success">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Applied
                  </Badge>
                ) : (
                  <Button 
                    onClick={() => applySuggestion(suggestion)}
                    disabled={isLoading}
                    size="sm"
                  >
                    <ArrowRight className="mr-1 h-3 w-3" />
                    Apply
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <Button variant="ghost" size="sm" onClick={dismissOnboarding}>
            Skip for now
          </Button>
          
          {progressPercentage === 100 && (
            <div className="flex items-center gap-2 text-success">
              <Gift className="h-4 w-4" />
              <span className="text-sm font-medium">Setup complete! 🎉</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserOnboarding;