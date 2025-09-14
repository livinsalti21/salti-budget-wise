import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ShoppingCart, 
  Eye, 
  CheckCircle, 
  Users, 
  Home, 
  GraduationCap,
  Briefcase,
  Heart,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { featureEnabled } from '@/lib/flags';
import type { BudgetInput } from '@/lib/budgetUtils';

interface Template {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  template_data: BudgetInput;
  category: string;
  is_active: boolean;
}

interface EnhancedTemplateStoreProps {
  onTemplateSelected: (data: BudgetInput) => void;
  onBack: () => void;
}

const EnhancedTemplateStore = ({ onTemplateSelected, onBack }: EnhancedTemplateStoreProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    // Enhanced mock templates with actual BudgetInput data
    const allTemplates: Template[] = [
      {
        id: 'student-basic',
        name: 'College Student',
        description: 'Essential budget for college students with meal plans and textbook expenses',
        price_cents: 0,
        category: 'student',
        is_active: true,
        template_data: {
          incomes: [
            { amount: 800, cadence: 'monthly', source: 'Part-time Job' }
          ],
          fixed_expenses: [
            { name: 'Tuition Payment', amount: 400, cadence: 'monthly' },
            { name: 'Phone', amount: 50, cadence: 'monthly' },
            { name: 'Subscriptions', amount: 25, cadence: 'monthly' }
          ],
          variable_preferences: {
            save_rate: 0.15,
            splits: {
              food: 0.4,
              textbooks: 0.2,
              entertainment: 0.25,
              transportation: 0.1,
              misc: 0.05
            }
          },
          goals: [
            { name: 'Emergency Fund', target_amount: 1000, due_date: '2024-12-31' }
          ]
        }
      },
      {
        id: 'young-professional',
        name: 'Young Professional',
        description: 'Complete budget for early career professionals focusing on growth and savings',
        price_cents: 999,
        category: 'professional',
        is_active: true,
        template_data: {
          incomes: [
            { amount: 3500, cadence: 'monthly', source: 'Salary' }
          ],
          fixed_expenses: [
            { name: 'Rent', amount: 1200, cadence: 'monthly' },
            { name: 'Car Payment', amount: 350, cadence: 'monthly' },
            { name: 'Insurance', amount: 200, cadence: 'monthly' },
            { name: 'Phone', amount: 80, cadence: 'monthly' }
          ],
          variable_preferences: {
            save_rate: 0.25,
            splits: {
              groceries: 0.35,
              gas: 0.15,
              eating_out: 0.25,
              entertainment: 0.15,
              clothing: 0.1
            }
          },
          goals: [
            { name: 'Emergency Fund', target_amount: 10000, due_date: '2024-12-31' },
            { name: 'House Down Payment', target_amount: 25000, due_date: '2026-06-01' }
          ]
        }
      },
      {
        id: 'family-budget',
        name: 'Family Budget Pro',
        description: 'Comprehensive family budget with childcare, education, and family goals',
        price_cents: 1999,
        category: 'family',
        is_active: true,
        template_data: {
          incomes: [
            { amount: 4500, cadence: 'monthly', source: 'Primary Income' },
            { amount: 2800, cadence: 'monthly', source: 'Secondary Income' }
          ],
          fixed_expenses: [
            { name: 'Mortgage', amount: 1800, cadence: 'monthly' },
            { name: 'Childcare', amount: 800, cadence: 'monthly' },
            { name: 'Insurance', amount: 400, cadence: 'monthly' },
            { name: 'Utilities', amount: 200, cadence: 'monthly' }
          ],
          variable_preferences: {
            save_rate: 0.20,
            splits: {
              groceries: 0.4,
              gas: 0.15,
              kids_activities: 0.15,
              entertainment: 0.15,
              household: 0.15
            }
          },
          goals: [
            { name: 'Emergency Fund', target_amount: 15000, due_date: '2024-12-31' },
            { name: 'Kids College Fund', target_amount: 50000, due_date: '2030-08-01' },
            { name: 'Family Vacation', target_amount: 5000, due_date: '2024-07-01' }
          ]
        }
      },
      {
        id: 'side-hustle',
        name: 'Side Hustle Master',
        description: 'Perfect for entrepreneurs with multiple income streams and business expenses',
        price_cents: 1499,
        category: 'business',
        is_active: true,
        template_data: {
          incomes: [
            { amount: 3000, cadence: 'monthly', source: 'Main Job' },
            { amount: 1200, cadence: 'monthly', source: 'Side Business' },
            { amount: 400, cadence: 'monthly', source: 'Freelance Work' }
          ],
          fixed_expenses: [
            { name: 'Rent', amount: 1000, cadence: 'monthly' },
            { name: 'Business Tools', amount: 150, cadence: 'monthly' },
            { name: 'Insurance', amount: 180, cadence: 'monthly' },
            { name: 'Phone & Internet', amount: 120, cadence: 'monthly' }
          ],
          variable_preferences: {
            save_rate: 0.30,
            splits: {
              groceries: 0.3,
              gas: 0.15,
              business_expenses: 0.25,
              entertainment: 0.15,
              investment: 0.15
            }
          },
          goals: [
            { name: 'Business Emergency Fund', target_amount: 8000, due_date: '2024-09-01' },
            { name: 'Equipment Upgrade', target_amount: 3000, due_date: '2024-06-01' },
            { name: 'Investment Account', target_amount: 20000, due_date: '2025-12-31' }
          ]
        }
      }
    ];

    // Filter templates based on feature flag - only show free templates if purchasing is disabled
    const filteredTemplates = featureEnabled('TEMPLATE_PURCHASING') 
      ? allTemplates 
      : allTemplates.filter(template => template.price_cents === 0);

    setTemplates(filteredTemplates);
  };

  const getTemplateIcon = (category: string) => {
    switch (category) {
      case 'student': return GraduationCap;
      case 'professional': return Briefcase;
      case 'family': return Home;
      case 'business': return TrendingUp;
      default: return Users;
    }
  };

  const getTemplateColor = (category: string) => {
    switch (category) {
      case 'student': return 'from-blue-500/10 to-blue-500/5 border-blue-500/20';
      case 'professional': return 'from-green-500/10 to-green-500/5 border-green-500/20';
      case 'family': return 'from-pink-500/10 to-pink-500/5 border-pink-500/20';
      case 'business': return 'from-purple-500/10 to-purple-500/5 border-purple-500/20';
      default: return 'from-gray-500/10 to-gray-500/5 border-gray-500/20';
    }
  };

  const handlePurchase = async (template: Template) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase templates",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setSelectedTemplate(template);

    try {
      if (template.price_cents === 0) {
        // Free template - directly apply
        applyTemplate(template);
      } else {
        // Paid template - redirect to Stripe checkout
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: { 
            plan: 'template',
            interval: 'one-time',
            template_id: template.id,
            amount: template.price_cents
          }
        });

        if (error) throw error;

        if (data.url) {
          // Open Stripe checkout in new tab
          window.open(data.url, '_blank');
          
          toast({
            title: "Redirecting to Payment",
            description: "Complete your purchase to access this template"
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Purchase Failed",
        description: error.message || "Something went wrong with the purchase",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setSelectedTemplate(null);
    }
  };

  const applyTemplate = (template: Template) => {
    onTemplateSelected(template.template_data);
    
    toast({
      title: "Template Applied! 🎉",
      description: `${template.name} has been loaded as your budget template`
    });
  };

  const calculateWeeklyTotals = (data: BudgetInput) => {
    const weeklyIncome = data.incomes.reduce((sum, income) => {
      const weekly = income.cadence === 'monthly' ? income.amount / 4.345 : income.amount;
      return sum + weekly;
    }, 0);
    
    const weeklyFixed = data.fixed_expenses.reduce((sum, expense) => {
      const weekly = expense.cadence === 'monthly' ? expense.amount / 4.345 : expense.amount;
      return sum + weekly;
    }, 0);

    return { weeklyIncome, weeklyFixed, remaining: weeklyIncome - weeklyFixed };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold">Choose a Budget Template</h3>
        <p className="text-muted-foreground">
          Professional templates designed by financial experts
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => {
          const Icon = getTemplateIcon(template.category);
          const colorClass = getTemplateColor(template.category);
          const totals = calculateWeeklyTotals(template.template_data);

          return (
            <Card 
              key={template.id} 
              className={`bg-gradient-to-br ${colorClass} hover:shadow-lg transition-all duration-200`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background/50 rounded-lg">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    {template.price_cents === 0 ? (
                      <Badge variant="secondary" className="text-primary font-semibold">
                        Free
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="font-semibold">
                        ${(template.price_cents / 100).toFixed(2)}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-2 bg-background/30 rounded">
                    <div className="font-semibold text-success">
                      ${totals.weeklyIncome.toFixed(0)}
                    </div>
                    <div className="text-muted-foreground">Weekly Income</div>
                  </div>
                  <div className="text-center p-2 bg-background/30 rounded">
                    <div className="font-semibold text-destructive">
                      ${totals.weeklyFixed.toFixed(0)}
                    </div>
                    <div className="text-muted-foreground">Fixed Costs</div>
                  </div>
                  <div className="text-center p-2 bg-background/30 rounded">
                    <div className="font-semibold text-primary">
                      ${totals.remaining.toFixed(0)}
                    </div>
                    <div className="text-muted-foreground">Remaining</div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Includes:</div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      {template.template_data.incomes.length} Income{template.template_data.incomes.length > 1 ? 's' : ''}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {template.template_data.fixed_expenses.length} Fixed Expenses
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {template.template_data.goals.length} Goal{template.template_data.goals.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setPreviewTemplate(template)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handlePurchase(template)}
                    disabled={isProcessing && selectedTemplate?.id === template.id}
                  >
                    {isProcessing && selectedTemplate?.id === template.id ? (
                      'Processing...'
                    ) : (
                      <>
                        {template.price_cents === 0 ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Use Template
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Purchase
                          </>
                        )}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Template Preview Dialog */}
      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {React.createElement(getTemplateIcon(previewTemplate.category), { className: "h-5 w-5" })}
                {previewTemplate.name}
              </DialogTitle>
              <DialogDescription>{previewTemplate.description}</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Income Sources */}
              <div>
                <h4 className="font-semibold text-success mb-2">Income Sources</h4>
                <div className="space-y-2">
                  {previewTemplate.template_data.incomes.map((income, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-success/10 rounded">
                      <span>{income.source}</span>
                      <Badge variant="outline">${income.amount} {income.cadence}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fixed Expenses */}
              <div>
                <h4 className="font-semibold text-destructive mb-2">Fixed Expenses</h4>
                <div className="space-y-2">
                  {previewTemplate.template_data.fixed_expenses.map((expense, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-destructive/10 rounded">
                      <span>{expense.name}</span>
                      <Badge variant="outline">${expense.amount} {expense.cadence}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Goals */}
              <div>
                <h4 className="font-semibold text-primary mb-2">Savings Goals</h4>
                <div className="space-y-2">
                  {previewTemplate.template_data.goals.map((goal, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-primary/10 rounded">
                      <span>{goal.name}</span>
                      <Badge variant="outline">${goal.target_amount} by {goal.due_date}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                  Close Preview
                </Button>
                <Button 
                  onClick={() => {
                    setPreviewTemplate(null);
                    handlePurchase(previewTemplate);
                  }}
                  className="flex-1"
                >
                  {previewTemplate.price_cents === 0 ? 'Use This Template' : `Purchase for $${(previewTemplate.price_cents / 100).toFixed(2)}`}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Back Button */}
      <Button onClick={onBack} variant="outline" className="w-full">
        Back to Method Selection
      </Button>
    </div>
  );
};

export default EnhancedTemplateStore;