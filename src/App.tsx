import React, { lazy, Suspense, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
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
import PricingPage from "./pages/PricingPage";
import SponsorDashboardApp from "./components/sponsor/SponsorDashboardApp";
import BottomNav from "./components/ui/BottomNav";
import OnboardingFlow from "./components/onboarding/OnboardingFlow";
import MatchPage from "./components/community/MatchPage";
import Leaderboard from "./components/leaderboard/Leaderboard";
import ReferralSystem from "./components/referrals/ReferralSystem";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
const NetWorthPage = lazy(() => import("./pages/NetWorthPage"));
const StreaksPage = lazy(() => import("./pages/StreaksPage"));
const SaveHistoryPage = lazy(() => import("./pages/SaveHistoryPage"));
const GoalsPage = lazy(() => import("./pages/GoalsPage"));
const AccountDeletePage = lazy(() => import("./pages/AccountDeletePage"));

const queryClient = new QueryClient();

const AppContent = () => {
  const { trackAnalyticsEvent } = useNativeFeatures();
  const { user, loading } = useAuth();
  const [profileLoading, setProfileLoading] = React.useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState(false);
  const navigate = useNavigate();

  // Track page views
  React.useEffect(() => {
    trackAnalyticsEvent('app_opened', {
      timestamp: Date.now(),
    });
  }, [trackAnalyticsEvent]);

  // Check user profile and onboarding status
  React.useEffect(() => {
    async function checkUserProfile() {
      if (!user || loading) {
        setProfileLoading(false);
        return;
      }

      try {
        console.log('🔍 Checking profile for user:', user.id);
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('completed_onboarding')
          .eq('id', user.id)
          .maybeSingle(); // Use maybeSingle to handle missing profiles gracefully

        if (error) {
          console.error('❌ Error fetching profile:', error);
          
          // If profile doesn't exist, create it
          if (error.code === 'PGRST116' || !profile) {
            console.log('📝 Creating missing profile for user:', user.id);
            
            const { error: createError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                completed_onboarding: false,
              });
              
            if (createError) {
              console.error('❌ Error creating profile:', createError);
              return;
            }
            
            // Set to uncompleted since we just created it
            setHasCompletedOnboarding(false);
          }
        } else {
          const completed = profile?.completed_onboarding || false;
          console.log('✅ Profile check result:', { completed, profile });
          setHasCompletedOnboarding(completed);
        }

        // Simple routing logic - only redirect based on current path and database state
        const currentPath = window.location.pathname;
        console.log('🛣️ Current path:', currentPath, 'Completed:', hasCompletedOnboarding);
        
        // Only redirect if we're on landing and onboarding is complete
        if (hasCompletedOnboarding && currentPath === '/') {
          console.log('🔄 Redirecting to /app (onboarding complete)');
          navigate('/app');
        }
        // Only redirect to onboarding if we're on /app and onboarding is NOT complete
        else if (!hasCompletedOnboarding && currentPath === '/app') {
          console.log('🔄 Redirecting to /onboarding (onboarding incomplete)');
          navigate('/onboarding');
        }
      } catch (error) {
        console.error('❌ Error in profile check:', error);
      } finally {
        setProfileLoading(false);
      }
    }

    checkUserProfile();
  }, [user, loading, navigate]); // Removed hasCompletedOnboarding dependency to prevent loops

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
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
        <Route path="/community" element={<><MatchPage /><BottomNav /></>} />
        <Route path="/profile" element={<><ProfilePage /><BottomNav /></>} />
        <Route path="/pricing" element={<><PricingPage /><BottomNav /></>} />
        
        {/* Secondary routes with bottom nav */}
        <Route path="/leaderboard" element={<><Leaderboard /><BottomNav /></>} />
        <Route path="/referrals" element={<><ReferralSystem /><BottomNav /></>} />
        <Route path="/rewards" element={<><RewardsPage /><BottomNav /></>} />
        <Route path="/sponsor-dashboard-app" element={<><SponsorDashboardApp /><BottomNav /></>} />
        
        {/* Dashboard detail pages with bottom nav */}
        <Route path="/net-worth" element={<Suspense fallback={<div>Loading...</div>}><NetWorthPage /><BottomNav /></Suspense>} />
        <Route path="/streaks" element={<Suspense fallback={<div>Loading...</div>}><StreaksPage /><BottomNav /></Suspense>} />
        <Route path="/save-history" element={<Suspense fallback={<div>Loading...</div>}><SaveHistoryPage /><BottomNav /></Suspense>} />
        <Route path="/goals" element={<Suspense fallback={<div>Loading...</div>}><GoalsPage /><BottomNav /></Suspense>} />
        
        {/* Utility routes (no bottom nav) */}
        <Route path="/save/confirm" element={<SaveConfirm />} />
        <Route path="/onboarding" element={<OnboardingFlow onComplete={() => {
          setHasCompletedOnboarding(true);
          navigate('/app');
        }} />} />
        
        {/* Legal pages (no bottom nav) */}
        <Route path="/legal/privacy" element={<PrivacyPage />} />
        <Route path="/legal/terms" element={<TermsPage />} />
        <Route path="/account/delete" element={<Suspense fallback={<div>Loading...</div>}><AccountDeletePage /></Suspense>} />
        
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
