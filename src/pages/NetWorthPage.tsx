import PageHeader from "@/components/ui/PageHeader";
import NetWorthProjection from "@/components/NetWorthProjection";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import NetWorthOnboarding from "@/components/networth/NetWorthOnboarding";

export default function NetWorthPage() {
  const { user } = useAuth();
  const [currentSavings, setCurrentSavings] = useState(0);
  const [showNetWorthOnboarding, setShowNetWorthOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      loadCurrentSavings();
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

  const loadCurrentSavings = async () => {
    try {
      const { data: totalSaveData } = await supabase
        .from('save_events')
        .select('amount_cents')
        .eq('user_id', user?.id);

      const totalSaved = totalSaveData?.reduce((sum, save) => sum + save.amount_cents, 0) || 0;
      setCurrentSavings(totalSaved / 100); // Convert from cents to dollars
    } catch (error) {
      console.error('Error loading current savings:', error);
    }
  };

  return (
    <div>
      <PageHeader 
        title="Net Worth Projection" 
        subtitle="Plan your financial future"
        backTo="/app"
      />

      <main className="p-4 max-w-4xl mx-auto">
        <NetWorthProjection currentSavings={currentSavings} />
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