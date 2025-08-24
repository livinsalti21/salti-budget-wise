import { ArrowLeft, ShoppingBag, Sparkles, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EnhancedBudgetInput from "@/components/EnhancedBudgetInput";
import BudgetViewer from "@/components/BudgetViewer";
import AiBudgetInput from "@/components/AiBudgetInput";
import WeeklyBudgetDashboard from "@/components/WeeklyBudgetDashboard";
import { useState } from "react";
import type { BudgetInput } from "@/lib/budgetUtils";

const templates = [
  {
    id: 1,
    name: "College Student",
    description: "Basic budget for dorm life",
    price: 4.99,
    categories: ["Tuition", "Food", "Books", "Entertainment", "Transportation"]
  },
  {
    id: 2,
    name: "Young Professional",
    description: "Entry-level salary budget",
    price: 7.99,
    categories: ["Rent", "Groceries", "Transportation", "Savings", "Entertainment", "Utilities"]
  },
  {
    id: 3,
    name: "Side Hustle",
    description: "Multiple income streams",
    price: 9.99,
    categories: ["Main Job", "Side Income", "Business Expenses", "Taxes", "Growth Fund"]
  }
];

export default function BudgetPage() {
  const [activeTab, setActiveTab] = useState<'ai-create' | 'create' | 'templates' | 'view' | 'dashboard'>('ai-create');
  const [aiBudgetData, setAiBudgetData] = useState<BudgetInput | null>(null);

  const handlePurchaseTemplate = (templateId: number) => {
    // TODO: Integrate with payment system
    console.log('Purchase template:', templateId);
  };

  const handleBudgetExtracted = (budgetData: BudgetInput) => {
    setAiBudgetData(budgetData);
    // Auto-switch to dashboard view when budget is created
    setActiveTab('dashboard');
  };

  return (
    <div className="pb-20 safe-area-top">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur p-4 border-b">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <Link to="/app">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-primary">
              {activeTab === 'ai-create' || activeTab === 'dashboard' ? 'AI Weekly Budget' : 'Weekly Budget'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {activeTab === 'ai-create' ? 'Describe your finances, get instant budget' : 
               activeTab === 'dashboard' ? 'Your personalized weekly budget plan' :
               'Plan your weekly finances'}
            </p>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b bg-background">
        <div className="max-w-md mx-auto px-4">
          <div className="flex gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('ai-create')}
              className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'ai-create' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                AI Budget
              </div>
            </button>
            {aiBudgetData && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'dashboard' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </div>
              </button>
            )}
            <button
              onClick={() => setActiveTab('view')}
              className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'view' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Legacy Budget
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'create' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Manual Create
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'templates' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Templates
            </button>
          </div>
        </div>
      </div>

      <main className="p-4 max-w-md mx-auto">
        {activeTab === 'ai-create' && (
          <AiBudgetInput onBudgetExtracted={handleBudgetExtracted} />
        )}
        
        {activeTab === 'dashboard' && aiBudgetData && (
          <WeeklyBudgetDashboard budgetData={aiBudgetData} />
        )}
        
        {activeTab === 'view' && <BudgetViewer />}
        {activeTab === 'create' && <EnhancedBudgetInput />}
        
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Weekly Budget Templates</h2>
              <p className="text-muted-foreground">Pre-built weekly budgets to get you started quickly</p>
            </div>

            <div className="space-y-4">
              {templates.map((template) => (
                <Card key={template.id} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                      <Badge variant="secondary" className="text-primary font-bold text-sm sm:text-base">
                        ${template.price.toFixed(2)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-2">Includes categories:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.categories.map((category) => (
                            <Badge key={category} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button 
                        onClick={() => handlePurchaseTemplate(template.id)}
                        className="w-full"
                      >
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Purchase Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Templates automatically set up categories and suggested amounts based on your weekly income
            </div>
          </div>
        )}
      </main>
    </div>
  );
}