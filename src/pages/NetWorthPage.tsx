import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import NetWorthProjection from "@/components/NetWorthProjection";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function NetWorthPage() {
  const { user } = useAuth();
  const [currentSavings, setCurrentSavings] = useState(0);

  useEffect(() => {
    if (user) {
      loadCurrentSavings();
    }
  }, [user]);

  const loadCurrentSavings = async () => {
    try {
      const { data: totalSaveData } = await supabase
        .from('save_events')
        .select('amount_cents')
        .eq('user_id', user?.id);

      const totalSaved = totalSaveData?.reduce((sum, save) => sum + save.amount_cents, 0) || 0;
      setCurrentSavings(totalSaved / 100); // Convert from cents to dollars
    } catch (error) {
      console.error('Error loading current savings:', error);
    }
  };

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
            <h1 className="text-xl font-bold">Net Worth Projection</h1>
            <p className="text-sm text-muted-foreground">Plan your financial future</p>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        <NetWorthProjection currentSavings={currentSavings} />
      </main>
    </div>
  );
}