import PageHeader from "@/components/ui/PageHeader";
import WhatIfCalculator from "@/components/calculator/WhatIfCalculator";

export default function WhatIfPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <PageHeader 
        title="What If Calculator" 
        subtitle="Experiment with different saving scenarios"
        backTo="/app"
      />

      <main className="p-4 max-w-6xl mx-auto">
        <WhatIfCalculator />
      </main>
    </div>
  );
}
