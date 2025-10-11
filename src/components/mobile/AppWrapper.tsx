import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileLayout from './MobileLayout';
import DesktopSidebar from '@/components/navigation/DesktopSidebar';
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

  // Desktop layout with sidebar
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <DesktopSidebar />
      <div className="md:ml-64">
        <div className="container mx-auto px-6 py-6 max-w-5xl">
          {children}
        </div>
      </div>
      <ChatWidget />
    </div>
  );
}
