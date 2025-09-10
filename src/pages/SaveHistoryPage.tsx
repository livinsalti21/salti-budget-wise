import PageHeader from "@/components/ui/PageHeader";
import SaveHistory from "@/components/SaveHistory";

export default function SaveHistoryPage() {
  return (
    <div>
      <PageHeader 
        title="Save History" 
        subtitle="Your saving journey"
        backTo="/app"
      />

      <main className="p-4 max-w-4xl mx-auto">
        <SaveHistory />
      </main>
    </div>
  );
}