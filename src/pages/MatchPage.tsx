import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/ui/PageHeader";
import { MatchExplainer } from '@/components/onboarding/MatchExplainer';
import { MatchPageOnboarding } from '@/components/match/MatchPageOnboarding';
import MobileMatchSection from '@/components/mobile/MobileMatchSection';
import FriendMatchSection from '@/components/friends/FriendMatchSection';
import StreakMatchSection from '@/components/match/StreakMatchSection';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Users, Heart, Flame } from 'lucide-react';

export default function MatchPage() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("friends");
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkFirstTimeVisit();
  }, [user]);

  const checkFirstTimeVisit = async () => {
    if (!user) return;

    // Check if user has seen match page onboarding
    const hasSeenOnboarding = localStorage.getItem(`match-onboarding-${user.id}`);
    
    // Also check if user has any friend connections or match rules
    const { data: friendConnections } = await supabase
      .from('friend_connections')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    const { data: matchRules } = await supabase
      .from('match_rules')
      .select('id')
      .eq('recipient_user_id', user.id)
      .limit(1);

    // Show onboarding if they haven't seen it and have no connections
    if (!hasSeenOnboarding && !friendConnections?.length && !matchRules?.length) {
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    if (user) {
      localStorage.setItem(`match-onboarding-${user.id}`, 'true');
    }
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    if (user) {
      localStorage.setItem(`match-onboarding-${user.id}`, 'true');
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
        <PageHeader 
          title="Match-a-Save" 
          subtitle="Save together, grow together"
          backTo="/app"
        />

        <div className="p-4 space-y-4">
          {/* Quick Explainer */}
          {!showOnboarding && (
            <div className="mb-4">
              <MatchExplainer variant="compact" />
            </div>
          )}
          
          {/* Mobile Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="friends" className="text-xs">
                <Users className="h-4 w-4 mr-1" />
                Friends
              </TabsTrigger>
              <TabsTrigger value="sponsors" className="text-xs">
                <Heart className="h-4 w-4 mr-1" />
                Sponsors
              </TabsTrigger>
              <TabsTrigger value="streaks" className="text-xs">
                <Flame className="h-4 w-4 mr-1" />
                Streaks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="space-y-4 mt-0">
              <FriendMatchSection />
            </TabsContent>

            <TabsContent value="sponsors" className="space-y-4 mt-0">
              <MobileMatchSection />
            </TabsContent>

            <TabsContent value="streaks" className="space-y-4 mt-0">
              <StreakMatchSection />
            </TabsContent>
          </Tabs>
        </div>

        {/* Match Page Onboarding Modal */}
        {showOnboarding && (
          <MatchPageOnboarding 
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingSkip}
          />
        )}
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      <PageHeader 
        title="Match-a-Save" 
        subtitle="Save together, grow together"
        backTo="/app"
      />

      <main className="p-6 max-w-6xl mx-auto">
        {!showOnboarding && (
          <div className="mb-6">
            <MatchExplainer variant="full" />
          </div>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="friends">
              <Users className="h-4 w-4 mr-2" />
              Friends
            </TabsTrigger>
            <TabsTrigger value="sponsors">
              <Heart className="h-4 w-4 mr-2" />
              Sponsors
            </TabsTrigger>
            <TabsTrigger value="streaks">
              <Flame className="h-4 w-4 mr-2" />
              Streaks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends">
            <FriendMatchSection />
          </TabsContent>

          <TabsContent value="sponsors">
            <MobileMatchSection />
          </TabsContent>

          <TabsContent value="streaks">
            <StreakMatchSection />
          </TabsContent>
        </Tabs>
      </main>

      {/* Match Page Onboarding Modal */}
      {showOnboarding && (
        <MatchPageOnboarding 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
    </div>
  );
}