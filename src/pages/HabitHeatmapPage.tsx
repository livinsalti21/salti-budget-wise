import PageHeader from "@/components/ui/PageHeader";
import HabitHeatmap from "@/components/heatmap/HabitHeatmap";
import FriendsHeatmapComparison from "@/components/heatmap/FriendsHeatmapComparison";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HabitHeatmapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-success/5 to-primary/5">
      <PageHeader 
        title="Habit Heatmap" 
        subtitle="Visualize your saving consistency"
        backTo="/app"
      />

      <main className="p-4 max-w-6xl mx-auto">
        <Tabs defaultValue="my-activity" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-sm">
            <TabsTrigger 
              value="my-activity"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground"
            >
              My Activity
            </TabsTrigger>
            <TabsTrigger 
              value="leaderboard"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-success data-[state=active]:to-accent data-[state=active]:text-success-foreground"
            >
              Friends Leaderboard
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-activity" className="mt-6">
            <HabitHeatmap />
          </TabsContent>
          
          <TabsContent value="leaderboard" className="mt-6">
            <FriendsHeatmapComparison />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
