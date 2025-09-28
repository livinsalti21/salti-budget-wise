import { BarChart3, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/PageHeader";
import { useState, useEffect } from "react";
import type { BudgetInput } from "@/lib/budgetUtils";
import { useAuth } from "@/contexts/AuthContext";
import { loadCurrentWeekBudget } from "@/lib/budgetStorage";

// New unified components
import BudgetCreationFlow from "@/components/BudgetCreationFlow";
import AiBudgetInput from "@/components/AiBudgetInput";
import CSVUploadProcessor from "@/components/CSVUploadProcessor";
import EnhancedTemplateStore from "@/components/EnhancedTemplateStore";
import EnhancedManualInput from "@/components/EnhancedManualInput";
import SaveNStackBudget from "@/components/SaveNStackBudget";
import WeeklyBudgetDashboard from "@/components/WeeklyBudgetDashboard";
import ProGate from "@/components/core/ProGate";
import { FeatureGate } from "@/components/core/FeatureGate";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { MessageCircle } from "lucide-react";

export default function BudgetPage() {
  const [currentView, setCurrentView] = useState<'method-select' | 'ai' | 'upload' | 'template' | 'manual' | 'fallback' | 'dashboard'>('method-select');
  const [budgetData, setBudgetData] = useState<BudgetInput | null>(null);
  const [budgetId, setBudgetId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [showCoach, setShowCoach] = useState(false);
  const { user } = useAuth();

  // Load existing budget on component mount
  useEffect(() => {
    if (user) {
      loadExistingBudget();
    }
  }, [user]);

  const loadExistingBudget = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { budgetData: existingBudget, budgetId: existingBudgetId } = await loadCurrentWeekBudget(user.id);
      
      if (existingBudget) {
        setBudgetData(existingBudget);
        setBudgetId(existingBudgetId);
        setCurrentView('dashboard');
      } else {
        setCurrentView('method-select');
      }
    } catch (error) {
      console.error('Error loading existing budget:', error);
      setCurrentView('method-select');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMethodSelected = (method: 'ai' | 'upload' | 'template' | 'manual' | 'fallback') => {
    setCurrentView(method);
  };

  const handleBudgetCreated = (data: BudgetInput) => {
    setBudgetData(data);
    setBudgetId(undefined); // New budget, no ID yet
    setCurrentView('dashboard');
  };

  const handleBackToMethodSelect = () => {
    setCurrentView('method-select');
  };

  const getPageTitle = () => {
    switch (currentView) {
      case 'method-select': return budgetData ? 'Budget Options' : 'Create Budget';
      case 'ai': return 'AI Budget Assistant';
      case 'upload': return 'Upload Spreadsheet';
      case 'template': return 'Budget Templates';
      case 'manual': return 'Manual Entry';
      case 'fallback': return 'Save-n-Stack Budget';
      case 'dashboard': return 'Weekly Budget';
      default: return 'Weekly Budget';
    }
  };

  const getPageDescription = () => {
    switch (currentView) {
      case 'method-select': return budgetData ? 'Create a new budget or modify existing' : 'Choose how you want to create your budget';
      case 'ai': return 'Describe your finances in plain English';
      case 'upload': return 'Import from spreadsheet files';
      case 'template': return 'Professional budget templates';
      case 'manual': return 'Step-by-step budget creation';
      case 'fallback': return 'Quick budget with smart defaults';
      case 'dashboard': return 'Your personalized weekly budget plan';
      default: return 'Plan your weekly finances';
    }
  };

  return (
    <div>
      <PageHeader 
        title={getPageTitle()}
        subtitle={getPageDescription()}
        backTo="/app"
        actions={currentView === 'dashboard' ? (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowCoach(true)}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Ask Coach
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentView('method-select')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              New Budget
            </Button>
          </div>
        ) : undefined}
      />

      <main className="p-4 max-w-2xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your budget...</p>
            </div>
          </div>
        ) : currentView === 'method-select' && (
          <BudgetCreationFlow 
            onMethodSelected={handleMethodSelected}
            onBudgetCreated={handleBudgetCreated}
          />
        )}
        
        {currentView === 'ai' && (
          <FeatureGate flag="AI_INSIGHTS" fallback={
            <ProGate feature="ai_budget_input">
              <AiBudgetInput onBudgetExtracted={handleBudgetCreated} />
            </ProGate>
          }>
            <AiBudgetInput onBudgetExtracted={handleBudgetCreated} />
          </FeatureGate>
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
        
        {currentView === 'fallback' && (
          <SaveNStackBudget
            onBudgetCreated={handleBudgetCreated}
            onBack={handleBackToMethodSelect}
          />
        )}
        
        {currentView === 'dashboard' && budgetData && (
          <WeeklyBudgetDashboard 
            budgetData={budgetData} 
            budgetId={budgetId}
            onBudgetSaved={(savedBudgetId) => setBudgetId(savedBudgetId)}
          />
        )}
      </main>

      {/* Budget Coach Modal */}
      {showCoach && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg w-full max-w-2xl h-[600px] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Budget Coach</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCoach(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 relative">
              <ChatWidget triggerFirstUse="first_budget" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}