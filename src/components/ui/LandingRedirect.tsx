import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PiggyBank } from 'lucide-react';

/**
 * Smart landing redirect component that handles authenticated users
 * by checking their onboarding status and redirecting appropriately
 */
export default function LandingRedirect({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [onboardingStatus, setOnboardingStatus] = React.useState<'loading' | 'incomplete' | 'complete'>('loading');

  useEffect(() => {
    if (user && onboardingStatus === 'loading') {
      checkOnboardingStatus();
    }
  }, [user, onboardingStatus]);

  const checkOnboardingStatus = async () => {
    if (!user) return;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('completed_onboarding')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking onboarding status:', error);
        setOnboardingStatus('incomplete'); // Default to incomplete on error
        return;
      }

      setOnboardingStatus(profile?.completed_onboarding ? 'complete' : 'incomplete');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setOnboardingStatus('incomplete');
    }
  };

  // Show loading while checking auth and onboarding status
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

  // Redirect authenticated users based on onboarding status
  if (user) {
    if (onboardingStatus === 'incomplete') {
      return <Navigate to="/onboarding" replace />;
    } else {
      return <Navigate to="/app" replace />;
    }
  }

  // Show landing page for unauthenticated users
  return <>{children}</>;
}