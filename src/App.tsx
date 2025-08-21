import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useNativeFeatures } from "@/hooks/useNativeFeatures";
import Index from "./pages/Index";
import AuthPage from "./components/auth/AuthPage";
import SponsorAuth from "./pages/SponsorAuth";
import SponsorDashboard from "./pages/SponsorDashboard";
import SaveConfirm from "./pages/SaveConfirm";
import SaveChoose from "./pages/SaveChoose";
import SnoozeConfirm from "./pages/SnoozeConfirm";
import MatchAccept from "./pages/MatchAccept";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import SavePage from "./pages/SavePage";
import BudgetPage from "./pages/BudgetPage";
import ProfilePage from "./pages/ProfilePage";
import RewardsPage from "./pages/RewardsPage";
import SponsorDashboardApp from "./components/sponsor/SponsorDashboardApp";
import BottomNav from "./components/ui/BottomNav";
import OnboardingFlow from "./components/onboarding/OnboardingFlow";
import CommunityFeed from "./components/community/CommunityFeed";
import Leaderboard from "./components/leaderboard/Leaderboard";
import ReferralSystem from "./components/referrals/ReferralSystem";

const queryClient = new QueryClient();

const AppContent = () => {
  const { trackAnalyticsEvent } = useNativeFeatures();
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  // Track page views
  React.useEffect(() => {
    trackAnalyticsEvent('app_opened', {
      timestamp: Date.now(),
    });
  }, [trackAnalyticsEvent]);

  // Check if user needs onboarding
  React.useEffect(() => {
    if (user && !loading) {
      // Check if user has completed onboarding (has any saves)
      // For now, we'll skip automatic onboarding - user can access it manually
      setShowOnboarding(false);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <>
      <Toaster />
      <Sonner />
      <Routes>
        {/* Main app routes with bottom navigation */}
        <Route path="/app" element={<><Index /><BottomNav /></>} />
        <Route path="/" element={<><Landing /></>} />
        <Route path="/save" element={<><SavePage /><BottomNav /></>} />
        <Route path="/budget" element={<><BudgetPage /><BottomNav /></>} />
        <Route path="/community" element={<><CommunityFeed /><BottomNav /></>} />
        <Route path="/profile" element={<><ProfilePage /><BottomNav /></>} />
        
        {/* Secondary routes with bottom nav */}
        <Route path="/leaderboard" element={<><Leaderboard /><BottomNav /></>} />
        <Route path="/referrals" element={<><ReferralSystem /><BottomNav /></>} />
        <Route path="/rewards" element={<><RewardsPage /><BottomNav /></>} />
        <Route path="/sponsor-dashboard-app" element={<><SponsorDashboardApp /><BottomNav /></>} />
        
        {/* Utility routes (no bottom nav) */}
        <Route path="/save/confirm" element={<SaveConfirm />} />
        <Route path="/onboarding" element={<OnboardingFlow onComplete={() => {}} />} />
        
        {/* Auth and admin routes (no bottom nav) */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/sponsor-auth" element={<SponsorAuth />} />
        <Route path="/sponsor-dashboard" element={<SponsorDashboard />} />
        <Route path="/app/save/choose" element={<SaveChoose />} />
        <Route path="/app/notify/snooze" element={<SnoozeConfirm />} />
        <Route path="/app/match/accept" element={<MatchAccept />} />
        <Route path="/landing" element={<Landing />} />
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
