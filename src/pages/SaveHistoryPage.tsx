import PageHeader from "@/components/ui/PageHeader";
import SaveHistory from "@/components/SaveHistory";
import UserLedger from "@/components/ledger/UserLedger";
import AchievementBanner from "@/components/wealth/AchievementBanner";
import CompactWealthSummary from "@/components/savehistory/CompactWealthSummary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SaveHistoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-success-light/5 to-primary/5">
      <PageHeader 
        title="My Saves" 
        subtitle="Track your progress and build wealth"
        backTo="/app"
      />

      <main className="p-4 max-w-6xl mx-auto space-y-6">
        {/* Achievement Banner */}
        <AchievementBanner />
        
        {/* Compact Wealth Summary */}
        <CompactWealthSummary />
        
        {/* Main Content Tabs */}
        <Tabs defaultValue="saves" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="saves" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground">
              Save History
            </TabsTrigger>
            <TabsTrigger value="ledger" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-success data-[state=active]:to-accent data-[state=active]:text-success-foreground">
              Transaction History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="saves" className="mt-6">
            <SaveHistory />
          </TabsContent>
          
          <TabsContent value="ledger" className="mt-6">
            <UserLedger />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}