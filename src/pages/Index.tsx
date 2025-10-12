import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import Dashboard from '@/components/Dashboard';
import MobileLayout from '@/components/mobile/MobileLayout';
import AppWrapper from '@/components/mobile/AppWrapper';
import { FloatingSaveButton } from '@/components/ui/FloatingSaveButton';
import { WelcomeTooltip } from '@/components/onboarding/WelcomeTooltip';

const Index = () => {
  const { signOut } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();

  return (
    <AppWrapper>
      <Dashboard />
      {location.pathname === '/app' && isMobile && <FloatingSaveButton />}
      <WelcomeTooltip />
    </AppWrapper>
  );
};

export default Index;