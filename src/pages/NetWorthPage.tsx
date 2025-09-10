import PageHeader from "@/components/ui/PageHeader";
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
      <PageHeader 
        title="Net Worth Projection" 
        subtitle="Plan your financial future"
        backTo="/app"
      />

      <main className="p-4 max-w-4xl mx-auto">
        <NetWorthProjection currentSavings={currentSavings} />
      </main>
    </div>
  );
}