import PageHeader from "@/components/ui/PageHeader";
import EnhancedStreaksDashboard from "@/components/EnhancedStreaksDashboard";
import ProGate from "@/components/core/ProGate";

export default function StreaksPage() {
  return (
    <div className="pb-20 safe-area-top">
      <PageHeader 
        title="Streaks & Badges" 
        subtitle="Track your saving habits"
        backTo="/app"
      />

      <main className="p-4 max-w-4xl mx-auto">
        <ProGate feature="enhanced_streaks">
          <EnhancedStreaksDashboard />
        </ProGate>
      </main>
    </div>
  );
}