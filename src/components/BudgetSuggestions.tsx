import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertTriangle, Target, Lightbulb } from 'lucide-react';

const BudgetSuggestions = () => {
  const suggestions = [
    {
      id: 1,
      type: 'optimization',
      title: 'Reduce Food & Dining by $120/month',
      description: 'You\'re spending 81% of your food budget. Try meal prepping 3 days/week.',
      impact: '+$1,440 annually',
      priority: 'high',
      icon: <Target className="h-4 w-4" />
    },
    {
      id: 2,
      type: 'opportunity',
      title: 'Switch to a rewards credit card',
      description: 'Based on your spending patterns, you could earn $240/year in cashback.',
      impact: '+$240 annually',
      priority: 'medium',
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      id: 3,
      type: 'warning',
      title: 'Transportation costs trending up',
      description: 'Your Uber spending increased 35% this month. Consider transit alternatives.',
      impact: 'Save $85/month',
      priority: 'high',
      icon: <AlertTriangle className="h-4 w-4" />
    },
    {
      id: 4,
      type: 'insight',
      title: 'Create an emergency fund',
      description: 'You\'re saving well! Consider setting aside $200/month for emergencies.',
      impact: '$2,400 safety net',
      priority: 'medium',
      icon: <Lightbulb className="h-4 w-4" />
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      default: return 'secondary';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'optimization': return 'from-accent/10 to-accent/5';
      case 'opportunity': return 'from-success/10 to-success/5';
      case 'warning': return 'from-warning/10 to-warning/5';
      case 'insight': return 'from-primary/10 to-primary/5';
      default: return 'from-muted/10 to-muted/5';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Powered Budget Insights
          </CardTitle>
          <CardDescription>
            Personalized recommendations based on your spending patterns and financial goals
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className={`absolute inset-0 bg-gradient-to-br ${getTypeColor(suggestion.type)}`} />
            <CardHeader className="relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {suggestion.icon}
                  <Badge variant={getPriorityColor(suggestion.priority) as any}>
                    {suggestion.priority} priority
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-lg">{suggestion.title}</CardTitle>
              <CardDescription className="text-base">
                {suggestion.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Potential Impact:</span>
                <span className="text-sm font-bold text-success">{suggestion.impact}</span>
              </div>
              <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                Apply Suggestion
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Brain className="h-4 w-4" />
              <span className="text-sm">AI learning from your habits...</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              These suggestions improve as you use the app. The AI adapts to your lifestyle and financial goals.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetSuggestions;