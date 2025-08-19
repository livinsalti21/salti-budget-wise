import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SaveStack from "@/components/SaveStack";

export default function SavePage() {
  return (
    <div className="pb-20 safe-area-top">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur p-4 border-b">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-primary">Save n Stack</h1>
            <p className="text-sm text-muted-foreground">Build wealth through habits</p>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto">
        <SaveStack />
      </main>
    </div>
  );
}