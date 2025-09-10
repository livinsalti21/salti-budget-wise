import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppWrapper from "./components/mobile/AppWrapper";
import Index from "./pages/Index";
import InteractiveLanding from "./pages/InteractiveLanding";
import Landing from "./pages/Landing";
import MobileLanding from "./pages/MobileLanding";
import AuthPage from "./components/auth/AuthPage";
import Dashboard from "./pages/Dashboard";
import HomeHub from "./pages/HomeHub";
import BudgetPage from "./pages/BudgetPage";
import SavePage from "./pages/SavePage";
import SaveChoose from "./pages/SaveChoose";
import SaveConfirm from "./pages/SaveConfirm";
import GoalsPage from "./pages/GoalsPage";
import RewardsPage from "./pages/RewardsPage";
import PricingPage from "./pages/PricingPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import ProfilePage from "./pages/ProfilePage";
import SponsorAuth from "./pages/SponsorAuth";
import SponsorDashboard from "./pages/SponsorDashboard";
import NotFound from "./pages/NotFound";
import OnboardingFlow from "./components/onboarding/OnboardingFlow";
import { AccountLinking } from "./components/AccountLinking";
import MatchAccept from "./pages/MatchAccept";
import SnoozeConfirm from "./pages/SnoozeConfirm";
import { FeatureGate } from "./components/core/FeatureGate";

const NetWorthPage = lazy(() => import("./pages/NetWorthPage"));
const StreaksPage = lazy(() => import("./pages/StreaksPage"));
const SaveHistoryPage = lazy(() => import("./pages/SaveHistoryPage"));
const AccountDeletePage = lazy(() => import("./pages/AccountDeletePage"));

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading…</div>;
  return user ? children : <Navigate to="/auth" replace />;
}

const AppContent = () => {

  return (
    <>
      <Toaster />
      <Sonner />
      <Routes>
        {/* Public */}
        <Route path="/" element={<InteractiveLanding />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/index" element={<Index />} />
        <Route path="/m" element={<MobileLanding />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* Onboarding (after auth) */}
        <Route path="/onboarding" element={
          <RequireAuth>
            <OnboardingFlow onComplete={() => window.location.href = '/save/choose'} />
          </RequireAuth>
        } />
        <Route path="/link" element={
          <RequireAuth>
            <FeatureGate flag="ACCOUNT_LINKING" fallback={<OnboardingFlow onComplete={() => window.location.href = '/save/choose'} />}>
              <AccountLinking />
            </FeatureGate>
          </RequireAuth>
        } />

        {/* Auth-required hub */}
        <Route path="/dashboard" element={<RequireAuth><AppWrapper><Dashboard /></AppWrapper></RequireAuth>} />
        <Route path="/home" element={<RequireAuth><AppWrapper><HomeHub /></AppWrapper></RequireAuth>} />
        <Route path="/app" element={<RequireAuth><AppWrapper><Index /></AppWrapper></RequireAuth>} />

        {/* Money & goals */}
        <Route path="/budget" element={<RequireAuth><AppWrapper><BudgetPage /></AppWrapper></RequireAuth>} />
        <Route path="/save" element={<RequireAuth><AppWrapper><SavePage /></AppWrapper></RequireAuth>} />
        <Route path="/save/choose" element={<RequireAuth><AppWrapper showBottomNav={false}><SaveChoose /></AppWrapper></RequireAuth>} />
        <Route path="/save/confirm" element={<RequireAuth><AppWrapper showBottomNav={false}><SaveConfirm /></AppWrapper></RequireAuth>} />
        <Route path="/save-history" element={<RequireAuth><AppWrapper><Suspense fallback={<div>Loading...</div>}><SaveHistoryPage /></Suspense></AppWrapper></RequireAuth>} />
        <Route path="/goals" element={<RequireAuth><AppWrapper><Suspense fallback={<div>Loading...</div>}><GoalsPage /></Suspense></AppWrapper></RequireAuth>} />
        <Route path="/net-worth" element={<RequireAuth><AppWrapper><Suspense fallback={<div>Loading...</div>}><NetWorthPage /></Suspense></AppWrapper></RequireAuth>} />

        {/* Engagement */}
        <Route path="/streaks" element={<RequireAuth><AppWrapper><Suspense fallback={<div>Loading...</div>}><StreaksPage /></Suspense></AppWrapper></RequireAuth>} />
        <Route path="/rewards" element={
          <RequireAuth>
            <AppWrapper>
              <FeatureGate flag="REWARDS" fallback={<Suspense fallback={<div>Loading...</div>}><StreaksPage /></Suspense>}>
                <RewardsPage />
              </FeatureGate>
            </AppWrapper>
          </RequireAuth>
        } />

        {/* Account & sponsor */}
        <Route path="/profile" element={<RequireAuth><AppWrapper><ProfilePage /></AppWrapper></RequireAuth>} />
        <Route path="/account-delete" element={<RequireAuth><AppWrapper showBottomNav={false}><Suspense fallback={<div>Loading...</div>}><AccountDeletePage /></Suspense></AppWrapper></RequireAuth>} />
        <Route path="/sponsor/auth" element={<SponsorAuth />} />
        <Route path="/sponsor" element={<SponsorDashboard />} />

        {/* Utility routes */}
        <Route path="/app/save/choose" element={<RequireAuth><AppWrapper showBottomNav={false}><SaveChoose /></AppWrapper></RequireAuth>} />
        <Route path="/app/notify/snooze" element={<RequireAuth><AppWrapper showBottomNav={false}><SnoozeConfirm /></AppWrapper></RequireAuth>} />
        <Route path="/app/match/accept" element={<RequireAuth><AppWrapper showBottomNav={false}><MatchAccept /></AppWrapper></RequireAuth>} />

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
