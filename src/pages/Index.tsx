import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import Dashboard from '@/components/Dashboard';
import AppWrapper from '@/components/mobile/AppWrapper';
import { FloatingSaveButton } from '@/components/ui/FloatingSaveButton';
import { ErrorAlertMonitor } from '@/components/monitoring/ErrorAlertMonitor';
import { isAdmin } from '@/lib/permissions/roleCheck';

const Index = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    if (user) isAdmin(user.id).then(setIsAdminUser);
  }, [user]);

  return (
    <AppWrapper>
      <Dashboard />
      {isMobile && <FloatingSaveButton />}
      {isAdminUser && <ErrorAlertMonitor />}
    </AppWrapper>
  );
};

export default Index;
