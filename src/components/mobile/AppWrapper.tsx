import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileLayout from './MobileLayout';
import { ChatWidget } from '@/components/chat/ChatWidget';

interface AppWrapperProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
}

export default function AppWrapper({ children, showBottomNav = true }: AppWrapperProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileLayout showBottomNav={showBottomNav}>
        {children}
        <ChatWidget />
      </MobileLayout>
    );
  }

  // Desktop layout - keep existing behavior
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        {children}
      </div>
      <ChatWidget />
    </div>
  );
}
