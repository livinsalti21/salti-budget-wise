import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PiggyBank } from 'lucide-react';

export default function AuthGateway({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const [onboardingStatus, setOnboardingStatus] = useState<'loading' | 'incomplete' | 'complete'>('loading');

  useEffect(() => {
    if (user && profile && onboardingStatus === 'loading') {
      // Use profile data directly from context instead of fetching again
      setOnboardingStatus(profile.completed_onboarding ? 'complete' : 'incomplete');
    } else if (!user) {
      setOnboardingStatus('loading'); // Reset when user logs out
    }
  }, [user, profile, onboardingStatus]);

  // Show loading screen while checking auth and onboarding
  if (loading || (user && onboardingStatus === 'loading')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <div className="text-center">
          <PiggyBank className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // User not authenticated - show landing page
  if (!user) {
    return <>{children}</>;
  }

  // User authenticated but onboarding incomplete - redirect to onboarding
  if (onboardingStatus === 'incomplete') {
    return <Navigate to="/onboarding" replace />;
  }

  // User authenticated and onboarding complete - redirect to app
  return <Navigate to="/app" replace />;
}