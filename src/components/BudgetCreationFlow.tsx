import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Upload, 
  ShoppingBag, 
  Calculator, 
  ArrowRight,
  FileSpreadsheet,
  Crown,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BudgetInput } from '@/lib/budgetUtils';

interface BudgetCreationFlowProps {
  onMethodSelected: (method: 'ai' | 'upload' | 'template' | 'manual') => void;
  onBudgetCreated: (data: BudgetInput) => void;
}

const BudgetCreationFlow = ({ onMethodSelected, onBudgetCreated }: BudgetCreationFlowProps) => {
  const [currentStep, setCurrentStep] = useState<'select' | 'input'>('select');

  const methods = [
    {
      id: 'ai' as const,
      title: 'AI Budget Assistant',
      description: 'Describe your finances in plain English',
      details: 'Just tell us about your income, expenses, and goals - our AI will create your budget',
      icon: Sparkles,
      badge: 'Recommended',
      badgeVariant: 'default' as const,
      color: 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20',
      iconColor: 'text-primary',
      examples: [
        'I make $3000/month, rent is $900...',
        'Biweekly pay $1200, want to save for vacation...',
        'Multiple income streams, complex expenses...'
      ]
    },
    {
      id: 'upload' as const,
      title: 'Upload Spreadsheet',
      description: 'Import from Excel, CSV, or Google Sheets',
      details: 'Already have your budget in a spreadsheet? Upload it and we\'ll extract the data',
      icon: Upload,
      badge: 'Fast',
      badgeVariant: 'secondary' as const,
      color: 'bg-gradient-to-br from-success/10 to-success/5 border-success/20',
      iconColor: 'text-success',
      examples: [
        'Excel budget templates',
        'Bank export CSV files',
        'Google Sheets data'
      ]
    },
    {
      id: 'template' as const,
      title: 'Buy Template',
      description: 'Professional budget templates',
      details: 'Choose from expert-designed templates for different lifestyles and goals',
      icon: ShoppingBag,
      badge: 'Pro',
      badgeVariant: 'outline' as const,
      color: 'bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20',
      iconColor: 'text-warning',
      examples: [
        'Student budgets from $0',
        'Family templates from $19.99',
        'Professional budgets from $9.99'
      ]
    },
    {
      id: 'manual' as const,
      title: 'Manual Entry',
      description: 'Fill out a detailed budget form',
      details: 'Enter your income, expenses, and goals step by step with guided assistance',
      icon: Calculator,
      badge: 'Traditional',
      badgeVariant: 'outline' as const,
      color: 'bg-gradient-to-br from-muted/50 to-muted/20 border-muted',
      iconColor: 'text-muted-foreground',
      examples: [
        'Step-by-step income entry',
        'Categorized expense tracking',
        'Goal-setting with timelines'
      ]
    }
  ];

  const handleMethodSelect = (method: typeof methods[0]) => {
    onMethodSelected(method.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Create Your Weekly Budget
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Choose the method that works best for you. All methods create the same comprehensive budget.
        </p>
      </div>

      {/* Method Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((method) => {
          const Icon = method.icon;
          return (
            <Card 
              key={method.id} 
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1",
                method.color
              )}
              onClick={() => handleMethodSelect(method)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg bg-background/50",
                      `${method.iconColor}`
                    )}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{method.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {method.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={method.badgeVariant} className="text-xs">
                    {method.badge}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {method.details}
                </p>
                
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Examples:
                  </p>
                  <div className="space-y-1">
                    {method.examples.map((example, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-1 h-1 rounded-full bg-current" />
                        {example}
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full group"
                  variant={method.id === 'ai' ? 'default' : 'outline'}
                  onClick={() => handleMethodSelect(method)}
                >
                  Choose {method.title}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Feature Comparison */}
      <Card className="bg-gradient-to-r from-background to-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-primary" />
            All Methods Include
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>Weekly breakdown</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>Savings calculator</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>Goal tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>Smart recommendations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Category allocation</span>
              <Crown className="h-3 w-3 text-primary ml-1" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Custom percentages</span>
              <Crown className="h-3 w-3 text-primary ml-1" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Export options</span>
              <Crown className="h-3 w-3 text-primary ml-1" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>History tracking</span>
              <Crown className="h-3 w-3 text-primary ml-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetCreationFlow;