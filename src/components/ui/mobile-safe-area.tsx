import React from 'react';
import { cn } from '@/lib/utils';

interface MobileSafeAreaProps {
  children: React.ReactNode;
  className?: string;
  top?: boolean;
  bottom?: boolean;
}

export function MobileSafeArea({ 
  children, 
  className,
  top = true,
  bottom = true 
}: MobileSafeAreaProps) {
  return (
    <div 
      className={cn(
        "w-full",
        top && "pt-safe-top",
        bottom && "pb-safe-bottom",
        className
      )}
      style={{
        paddingTop: top ? 'env(safe-area-inset-top)' : undefined,
        paddingBottom: bottom ? 'env(safe-area-inset-bottom)' : undefined,
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {children}
    </div>
  );
}