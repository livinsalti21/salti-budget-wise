import PageHeader from "@/components/ui/PageHeader";
import { MatchExplainer } from '@/components/onboarding/MatchExplainer';
import MobileMatchSection from '@/components/mobile/MobileMatchSection';
import { useIsMobile } from '@/hooks/use-mobile';

export default function MatchPage() {
  const isMobile = useIsMobile();

  return (
    <div>
      <PageHeader 
        title="Match-a-Save" 
        subtitle="Get your saves matched by sponsors"
        backTo="/app"
      />

      <main className="p-4 max-w-4xl mx-auto">
        {/* First-time explainer for new users */}
        <div className="mb-6">
          <MatchExplainer variant={isMobile ? "first-time" : "full"} />
        </div>
        
        {/* Main match functionality */}
        <MobileMatchSection />
      </main>
    </div>
  );
}