import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import EnhancedStreaksDashboard from "@/components/EnhancedStreaksDashboard";

export default function StreaksPage() {
  return (
    <div className="pb-20 safe-area-top">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur p-4 border-b">
        <div className="flex items-center gap-3">
          <Link to="/app">
            <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Streaks & Badges</h1>
            <p className="text-sm text-muted-foreground">Track your saving habits</p>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        <EnhancedStreaksDashboard />
      </main>
    </div>
  );
}