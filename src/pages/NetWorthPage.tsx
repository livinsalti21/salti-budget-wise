import PageHeader from "@/components/ui/PageHeader";
import NetWorthProjection from "@/components/NetWorthProjection";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import NetWorthOnboarding from "@/components/networth/NetWorthOnboarding";
import { useLedger } from "@/hooks/useLedger";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SaveImpactDashboard from "@/components/networth/SaveImpactDashboard";
import WealthGrowthChart from "@/components/networth/WealthGrowthChart";

export default function NetWorthPage() {
  const { user } = useAuth();
  const { accountSummary, ledgerHistory } = useLedger();
  const [showNetWorthOnboarding, setShowNetWorthOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      checkNetWorthOnboardingNeeds();
    }
  }, [user]);

  const checkNetWorthOnboardingNeeds = () => {
    const completedNetWorthOnboarding = localStorage.getItem('networth_onboarding_completed');
    if (!completedNetWorthOnboarding) {
      setTimeout(() => setShowNetWorthOnboarding(true), 800);
    }
  };

  const handleNetWorthOnboardingComplete = () => {
    localStorage.setItem('networth_onboarding_completed', 'true');
    setShowNetWorthOnboarding(false);
  };


  return (
    <div>
      <PageHeader 
        title="Net Worth Projection" 
        subtitle="Plan your financial future"
        backTo="/app"
      />

      <main className="p-4 max-w-6xl mx-auto">
        <Tabs defaultValue="projection" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="projection">Net Worth Projection</TabsTrigger>
            <TabsTrigger value="growth">Wealth Growth</TabsTrigger>
            <TabsTrigger value="saves">Save Impact</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projection">
            <NetWorthProjection 
              currentSavings={(accountSummary?.current_balance_cents || 0) / 100} 
              accountSummary={accountSummary}
            />
          </TabsContent>
          
          <TabsContent value="growth">
            <WealthGrowthChart 
              ledgerHistory={ledgerHistory}
              accountSummary={accountSummary}
            />
          </TabsContent>
          
          <TabsContent value="saves">
            <SaveImpactDashboard 
              ledgerHistory={ledgerHistory}
              accountSummary={accountSummary}
            />
          </TabsContent>
        </Tabs>
      </main>

      {showNetWorthOnboarding && (
        <NetWorthOnboarding
          onComplete={handleNetWorthOnboardingComplete}
          onSkip={handleNetWorthOnboardingComplete}
        />
      )}
    </div>
  );
}