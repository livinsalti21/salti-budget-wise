import PageHeader from "@/components/ui/PageHeader";
import SaveHistory from "@/components/SaveHistory";
import UserLedger from "@/components/ledger/UserLedger";
import WealthProjectionCard from "@/components/ledger/WealthProjectionCard";
import WealthJourneyHero from "@/components/wealth/WealthJourneyHero";
import AchievementBanner from "@/components/wealth/AchievementBanner";
import WealthScoreCard from "@/components/wealth/WealthScoreCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SaveHistoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-success-light/5 to-primary/5">
      <PageHeader 
        title="Wealth Journey" 
        subtitle="Your path to financial freedom"
        backTo="/app"
      />

      <main className="p-4 max-w-7xl mx-auto space-y-6">
        {/* Achievement Banner */}
        <AchievementBanner />
        
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <WealthJourneyHero />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <WealthScoreCard />
            <WealthProjectionCard />
          </div>
        </div>
        
        {/* Main Content Tabs */}
        <Tabs defaultValue="journey" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="journey" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground">
              Wealth Journey
            </TabsTrigger>
            <TabsTrigger value="ledger" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-success data-[state=active]:to-accent data-[state=active]:text-success-foreground">
              Ledger History
            </TabsTrigger>
            <TabsTrigger value="saves" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-success data-[state=active]:text-accent-foreground">
              Save Events
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="journey" className="mt-6">
            <SaveHistory />
          </TabsContent>
          
          <TabsContent value="ledger" className="mt-6">
            <UserLedger />
          </TabsContent>
          
          <TabsContent value="saves" className="mt-6">
            <SaveHistory />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}