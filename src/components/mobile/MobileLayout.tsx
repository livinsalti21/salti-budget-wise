import React from 'react';
import { MobileSafeArea } from '@/components/ui/mobile-safe-area';
import BottomNav from '@/components/ui/BottomNav';
import { MobileKeyboardSpacer } from '@/components/ui/mobile-helpers';

interface MobileLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
}

export default function MobileLayout({ children, showBottomNav = true }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <MobileKeyboardSpacer />
      
      <MobileSafeArea top bottom={!showBottomNav} className="min-h-screen">
        <div className={`container mx-auto px-4 py-4 ${showBottomNav ? 'pb-20' : ''} max-w-md`}>
          {children}
        </div>
      </MobileSafeArea>
      
      {showBottomNav && <BottomNav />}
    </div>
  );
}