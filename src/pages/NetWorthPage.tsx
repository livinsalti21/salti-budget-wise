import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import NetWorthOnboarding from "@/components/networth/NetWorthOnboarding";
import { useLedger } from "@/hooks/useLedger";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SaveImpactDashboard from "@/components/networth/SaveImpactDashboard";
import WealthGrowthChart from "@/components/networth/WealthGrowthChart";
import NetWorthProjection from "@/components/NetWorthProjection";
import WealthJourneyHero from "@/components/wealth/WealthJourneyHero";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, TrendingUp, Coins } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NetWorthPage() {
  const { user } = useAuth();
  const { accountSummary, ledgerHistory } = useLedger();
  const [showNetWorthOnboarding, setShowNetWorthOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      checkNetWorthOnboardingNeeds();
    }
  }, [user]);

  const checkNetWorthOnboardingNeeds = () => {
    const completedNetWorthOnboarding = localStorage.getItem('networth_onboarding_completed');
    if (!completedNetWorthOnboarding) {
      setTimeout(() => setShowNetWorthOnboarding(true), 800);
    }
  };

  const handleNetWorthOnboardingComplete = () => {
    localStorage.setItem('networth_onboarding_completed', 'true');
    setShowNetWorthOnboarding(false);
  };


  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30"
    >
      {/* Enhanced Header */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b">
        <div className="flex items-center gap-3 max-w-6xl mx-auto p-4">
          <Link to="/app">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 h-8 w-8 hover:bg-accent/50 transition-all duration-300 hover:scale-110"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Watch Your Wealth Grow
            </h1>
            <p className="text-sm text-muted-foreground">Your journey to financial freedom</p>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-4">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <WealthJourneyHero />
        </motion.div>


        {/* Enhanced Tabs with Better Labels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs defaultValue="projection" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50 rounded-xl p-1">
              <TabsTrigger 
                value="projection" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300 hover:scale-105 rounded-lg"
              >
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Your Future Wealth</span>
                <span className="sm:hidden">Future</span>
              </TabsTrigger>
              <TabsTrigger 
                value="growth" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300 hover:scale-105 rounded-lg"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Growth Timeline</span>
                <span className="sm:hidden">Growth</span>
              </TabsTrigger>
              <TabsTrigger 
                value="saves" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300 hover:scale-105 rounded-lg"
              >
                <Coins className="h-4 w-4" />
                <span className="hidden sm:inline">Every Save Counts</span>
                <span className="sm:hidden">Saves</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="projection" className="space-y-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <NetWorthProjection 
                  currentSavings={(accountSummary?.current_balance_cents || 0) / 100} 
                  ledgerHistory={ledgerHistory}
                />
              </motion.div>
            </TabsContent>
            
            <TabsContent value="growth" className="space-y-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <WealthGrowthChart 
                  ledgerHistory={ledgerHistory}
                  accountSummary={accountSummary}
                />
              </motion.div>
            </TabsContent>
            
            <TabsContent value="saves" className="space-y-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SaveImpactDashboard 
                  ledgerHistory={ledgerHistory}
                  accountSummary={accountSummary}
                />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      {showNetWorthOnboarding && (
        <NetWorthOnboarding
          onComplete={handleNetWorthOnboardingComplete}
          onSkip={handleNetWorthOnboardingComplete}
        />
      )}
    </motion.div>
  );
}