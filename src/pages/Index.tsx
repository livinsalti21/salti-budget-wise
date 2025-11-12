import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import Dashboard from '@/components/Dashboard';
import MobileLayout from '@/components/mobile/MobileLayout';
import AppWrapper from '@/components/mobile/AppWrapper';
import { FloatingSaveButton } from '@/components/ui/FloatingSaveButton';
import { WelcomeTooltip } from '@/components/onboarding/WelcomeTooltip';
import { ErrorAlertMonitor } from '@/components/monitoring/ErrorAlertMonitor';
import { isAdmin } from '@/lib/permissions/roleCheck';

const Index = () => {
  const { signOut, user } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    if (user) {
      isAdmin(user.id).then(setIsAdminUser);
    }
  }, [user]);

  return (
    <AppWrapper>
      <Dashboard />
      {location.pathname === '/app' && isMobile && <FloatingSaveButton />}
      <WelcomeTooltip />
      {isAdminUser && <ErrorAlertMonitor />}
    </AppWrapper>
  );
};

export default Index;