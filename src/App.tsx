import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppWrapper from "./components/mobile/AppWrapper";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import MobileLanding from "./pages/MobileLanding";
import AuthPage from "./components/auth/AuthPage";
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
import LandingRedirect from "./components/ui/LandingRedirect";
import CompleteOnboarding from "./components/onboarding/CompleteOnboarding";
import { AccountLinking } from "./components/AccountLinking";
import MatchAccept from "./pages/MatchAccept";
import SnoozeConfirm from "./pages/SnoozeConfirm";
import { FeatureGate } from "./components/core/FeatureGate";
import { SaveStackWidget } from "./components/ui/SaveStackWidget";

const NetWorthPage = lazy(() => import("./pages/NetWorthPage"));
const MatchPage = lazy(() => import("./pages/MatchPage"));
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
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route path="/landing" element={<LandingRedirect><Landing /></LandingRedirect>} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        
        {/* Legacy redirects */}
        <Route path="/m" element={<Navigate to="/landing" replace />} />
        <Route path="/interactive" element={<Navigate to="/landing" replace />} />

        {/* Onboarding (after auth) */}
        <Route path="/onboarding" element={
          <RequireAuth>
            <CompleteOnboarding />
          </RequireAuth>
        } />
        <Route path="/link" element={
          <RequireAuth>
            <FeatureGate flag="ACCOUNT_LINKING" fallback={<CompleteOnboarding />}>
              <AccountLinking />
            </FeatureGate>
          </RequireAuth>
        } />

        {/* Auth-required hub */}
        <Route path="/app" element={<RequireAuth><AppWrapper><Index /></AppWrapper></RequireAuth>} />

        {/* Money & goals */}
        <Route path="/budget" element={<RequireAuth><AppWrapper><BudgetPage /></AppWrapper></RequireAuth>} />
        <Route path="/save" element={<RequireAuth><AppWrapper><SavePage /></AppWrapper></RequireAuth>} />
        <Route path="/save-history" element={<RequireAuth><AppWrapper><Suspense fallback={<div>Loading...</div>}><SaveHistoryPage /></Suspense></AppWrapper></RequireAuth>} />
        <Route path="/goals" element={<RequireAuth><AppWrapper><Suspense fallback={<div>Loading...</div>}><GoalsPage /></Suspense></AppWrapper></RequireAuth>} />
        <Route path="/net-worth" element={<RequireAuth><AppWrapper><Suspense fallback={<div>Loading...</div>}><NetWorthPage /></Suspense></AppWrapper></RequireAuth>} />
        
        {/* Legacy redirects */}
        <Route path="/save/choose" element={<Navigate to="/app/save/choose" replace />} />
        <Route path="/save/confirm" element={<Navigate to="/app/save/confirm" replace />} />

        {/* Engagement */}
        <Route path="/match" element={<RequireAuth><AppWrapper><Suspense fallback={<div>Loading...</div>}><MatchPage /></Suspense></AppWrapper></RequireAuth>} />
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
        <Route path="/sponsor-dashboard" element={<SponsorDashboard />} />

        {/* Utility routes */}
        <Route path="/app/save/choose" element={<RequireAuth><AppWrapper showBottomNav={false}><SaveChoose /></AppWrapper></RequireAuth>} />
        <Route path="/app/save/confirm" element={<RequireAuth><AppWrapper showBottomNav={false}><SaveConfirm /></AppWrapper></RequireAuth>} />
        <Route path="/app/notify/snooze" element={<RequireAuth><AppWrapper showBottomNav={false}><SnoozeConfirm /></AppWrapper></RequireAuth>} />
        <Route path="/app/match/accept" element={<RequireAuth><AppWrapper showBottomNav={false}><MatchAccept /></AppWrapper></RequireAuth>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Global Save & Stack Widget */}
      <SaveStackWidget />
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
