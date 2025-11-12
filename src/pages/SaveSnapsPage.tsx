import PageHeader from "@/components/ui/PageHeader";
import SaveSnapTimeline from "@/components/saveSnap/SaveSnapTimeline";

export default function SaveSnapsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <PageHeader 
        title="Save Snaps" 
        subtitle="Your visual wealth journey"
        backTo="/app"
      />

      <main className="p-4 max-w-6xl mx-auto">
        <SaveSnapTimeline />
      </main>
    </div>
  );
}
