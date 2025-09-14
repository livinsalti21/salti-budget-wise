import PageHeader from "@/components/ui/PageHeader";
import EnhancedStreaksDashboard from "@/components/EnhancedStreaksDashboard";
import ProGate from "@/components/core/ProGate";
import { StreaksExplainer } from '@/components/onboarding/StreaksExplainer';

export default function StreaksPage() {
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
    </div>
  );
}