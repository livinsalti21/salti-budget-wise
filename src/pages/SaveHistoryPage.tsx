import PageHeader from "@/components/ui/PageHeader";
import SaveHistory from "@/components/SaveHistory";
import UserLedger from "@/components/ledger/UserLedger";
import WealthProjectionCard from "@/components/ledger/WealthProjectionCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SaveHistoryPage() {
  return (
    <div>
      <PageHeader 
        title="Wealth History" 
        subtitle="Your complete financial journey"
        backTo="/app"
      />

      <main className="p-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <WealthProjectionCard />
          </div>
        </div>
        
        <Tabs defaultValue="ledger" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ledger">Wealth Ledger</TabsTrigger>
            <TabsTrigger value="saves">Save Events</TabsTrigger>
          </TabsList>
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