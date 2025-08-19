import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useNativeFeatures } from "@/hooks/useNativeFeatures";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SponsorAuth from "./pages/SponsorAuth";
import SponsorDashboard from "./pages/SponsorDashboard";
import SaveConfirm from "./pages/SaveConfirm";
import SaveChoose from "./pages/SaveChoose";
import SnoozeConfirm from "./pages/SnoozeConfirm";
import MatchAccept from "./pages/MatchAccept";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import HomeHub from "./pages/HomeHub";
import SavePage from "./pages/SavePage";
import BudgetPage from "./pages/BudgetPage";
import ProfilePage from "./pages/ProfilePage";
import BottomNav from "./components/ui/BottomNav";

const queryClient = new QueryClient();

const AppContent = () => {
  const { trackAnalyticsEvent } = useNativeFeatures();

  // Track page views
  React.useEffect(() => {
    trackAnalyticsEvent('app_opened', {
      timestamp: Date.now(),
    });
  }, [trackAnalyticsEvent]);

  return (
    <>
      <Toaster />
      <Sonner />
      <Routes>
        {/* Main app routes with bottom navigation */}
        <Route path="/app" element={<><Index /><BottomNav /></>} />
        <Route path="/" element={<><HomeHub /><BottomNav /></>} />
        <Route path="/save" element={<><SavePage /><BottomNav /></>} />
        <Route path="/budget" element={<><BudgetPage /><BottomNav /></>} />
        <Route path="/profile" element={<><ProfilePage /><BottomNav /></>} />
        
        {/* Auth and utility routes (no bottom nav) */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/sponsor-auth" element={<SponsorAuth />} />
        <Route path="/sponsor-dashboard" element={<SponsorDashboard />} />
        <Route path="/app/save/confirm" element={<SaveConfirm />} />
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
