import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/ui/PageHeader";
import { MatchExplainer } from '@/components/onboarding/MatchExplainer';
import MobileMatchSection from '@/components/mobile/MobileMatchSection';
import FriendMatchSection from '@/components/friends/FriendMatchSection';
import StreakMatchSection from '@/components/match/StreakMatchSection';
import { useIsMobile } from '@/hooks/use-mobile';
import { Users, Heart, Flame } from 'lucide-react';

export default function MatchPage() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("friends");

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
          <div className="mb-4">
            <MatchExplainer variant="compact" />
          </div>
          
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
        <div className="mb-6">
          <MatchExplainer variant="full" />
        </div>
        
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
    </div>
  );
}