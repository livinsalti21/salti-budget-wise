import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import PageHeader from "@/components/ui/PageHeader";
import EnhancedStreaksDashboard from "@/components/EnhancedStreaksDashboard";
import ProGate from "@/components/core/ProGate";
import { StreaksExplainer } from '@/components/onboarding/StreaksExplainer';
import StreaksOnboarding from '@/components/streaks/StreaksOnboarding';

export default function StreaksPage() {
  const { user } = useAuth();
  const [showStreaksOnboarding, setShowStreaksOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      checkStreaksOnboardingNeeds();
    }
  }, [user]);

  const checkStreaksOnboardingNeeds = async () => {
    const completedStreaksOnboarding = localStorage.getItem('streaks_onboarding_completed');
    
    if (!completedStreaksOnboarding) {
      // Check if user has any streaks or saves
      try {
        const { data: streakData } = await supabase
          .from('user_streaks')
          .select('consecutive_days')
          .eq('user_id', user?.id)
          .single();

        // Show onboarding if user has no significant streak history
        if (!streakData || streakData.consecutive_days < 3) {
          setShowStreaksOnboarding(true);
        }
      } catch (error) {
        // If no streak data exists, definitely show onboarding
        setShowStreaksOnboarding(true);
      }
    }
  };

  const handleStreaksOnboardingComplete = () => {
    localStorage.setItem('streaks_onboarding_completed', 'true');
    setShowStreaksOnboarding(false);
  };

  return (
    <div>
      <PageHeader 
        title="Streaks & Badges" 
        subtitle="Track your saving habits"
        backTo="/app"
      />

      <main className="p-4 max-w-4xl mx-auto">
        {/* Compact explainer for quick reference */}
        <div className="mb-4">
          <StreaksExplainer variant="compact" />
        </div>
        
        <ProGate feature="enhanced_streaks">
          <EnhancedStreaksDashboard />
        </ProGate>
      </main>

      {showStreaksOnboarding && (
        <StreaksOnboarding
          onComplete={handleStreaksOnboardingComplete}
          onSkip={handleStreaksOnboardingComplete}
        />
      )}
    </div>
  );
}