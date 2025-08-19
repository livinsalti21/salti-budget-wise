import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EnhancedBudgetInput from "@/components/EnhancedBudgetInput";
import { useState } from "react";

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
  const [activeTab, setActiveTab] = useState<'create' | 'templates'>('create');

  const handlePurchaseTemplate = (templateId: number) => {
    // TODO: Integrate with payment system
    console.log('Purchase template:', templateId);
  };

  return (
    <div className="pb-20 safe-area-top">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur p-4 border-b">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-primary">Budget</h1>
            <p className="text-sm text-muted-foreground">Plan your finances</p>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b bg-background">
        <div className="max-w-md mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('create')}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'create' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Create Budget
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'templates' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Templates Store
            </button>
          </div>
        </div>
      </div>

      <main className="p-4 max-w-md mx-auto">
        {activeTab === 'create' && <EnhancedBudgetInput />}
        
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Budget Templates</h2>
              <p className="text-muted-foreground">Pre-built budgets to get you started quickly</p>
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
                      <Badge variant="secondary" className="text-primary font-bold">
                        ${template.price}
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
              Templates automatically set up categories and suggested amounts based on your income
            </div>
          </div>
        )}
      </main>
    </div>
  );
}