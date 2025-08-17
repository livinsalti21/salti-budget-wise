import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi, WifiOff } from 'lucide-react';

interface OfflineIndicatorProps {
  isOnline: boolean;
  className?: string;
}

export function OfflineIndicator({ isOnline, className }: OfflineIndicatorProps) {
  if (isOnline) return null;

  return (
    <Card className={cn("border-warning bg-warning-light", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-warning-foreground">
          <WifiOff className="h-4 w-4" />
          You're offline
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-warning-foreground">
          Some features may be limited. Your changes will sync when you're back online.
        </p>
      </CardContent>
    </Card>
  );
}

interface OfflineGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  isOnline: boolean;
}

export function OfflineGuard({ children, fallback, isOnline }: OfflineGuardProps) {
  if (!isOnline && fallback) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}