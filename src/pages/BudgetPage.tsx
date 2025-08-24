import { ArrowLeft, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { BudgetInput } from "@/lib/budgetUtils";

// New unified components
import BudgetCreationFlow from "@/components/BudgetCreationFlow";
import AiBudgetInput from "@/components/AiBudgetInput";
import CSVUploadProcessor from "@/components/CSVUploadProcessor";
import EnhancedTemplateStore from "@/components/EnhancedTemplateStore";
import EnhancedManualInput from "@/components/EnhancedManualInput";
import WeeklyBudgetDashboard from "@/components/WeeklyBudgetDashboard";

export default function BudgetPage() {
  const [currentView, setCurrentView] = useState<'method-select' | 'ai' | 'upload' | 'template' | 'manual' | 'dashboard'>('method-select');
  const [budgetData, setBudgetData] = useState<BudgetInput | null>(null);

  const handleMethodSelected = (method: 'ai' | 'upload' | 'template' | 'manual') => {
    setCurrentView(method);
  };

  const handleBudgetCreated = (data: BudgetInput) => {
    setBudgetData(data);
    setCurrentView('dashboard');
  };

  const handleBackToMethodSelect = () => {
    setCurrentView('method-select');
  };

  const getPageTitle = () => {
    switch (currentView) {
      case 'method-select': return 'Create Budget';
      case 'ai': return 'AI Budget Assistant';
      case 'upload': return 'Upload Spreadsheet';
      case 'template': return 'Budget Templates';
      case 'manual': return 'Manual Entry';
      case 'dashboard': return 'Weekly Budget';
      default: return 'Weekly Budget';
    }
  };

  const getPageDescription = () => {
    switch (currentView) {
      case 'method-select': return 'Choose how you want to create your budget';
      case 'ai': return 'Describe your finances in plain English';
      case 'upload': return 'Import from spreadsheet files';
      case 'template': return 'Professional budget templates';
      case 'manual': return 'Step-by-step budget creation';
      case 'dashboard': return 'Your personalized weekly budget plan';
      default: return 'Plan your weekly finances';
    }
  };

  return (
    <div className="pb-20 safe-area-top">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur p-4 border-b">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Link to="/app">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary">
              {getPageTitle()}
            </h1>
            <p className="text-sm text-muted-foreground">
              {getPageDescription()}
            </p>
          </div>
          {currentView === 'dashboard' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentView('method-select')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              New Budget
            </Button>
          )}
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        {currentView === 'method-select' && (
          <BudgetCreationFlow 
            onMethodSelected={handleMethodSelected}
            onBudgetCreated={handleBudgetCreated}
          />
        )}
        
        {currentView === 'ai' && (
          <AiBudgetInput onBudgetExtracted={handleBudgetCreated} />
        )}
        
        {currentView === 'upload' && (
          <CSVUploadProcessor 
            onBudgetExtracted={handleBudgetCreated}
            onBack={handleBackToMethodSelect}
          />
        )}
        
        {currentView === 'template' && (
          <EnhancedTemplateStore 
            onTemplateSelected={handleBudgetCreated}
            onBack={handleBackToMethodSelect}
          />
        )}
        
        {currentView === 'manual' && (
          <EnhancedManualInput 
            onBudgetCreated={handleBudgetCreated}
            onBack={handleBackToMethodSelect}
          />
        )}
        
        {currentView === 'dashboard' && budgetData && (
          <WeeklyBudgetDashboard budgetData={budgetData} />
        )}
      </main>
    </div>
  );
}