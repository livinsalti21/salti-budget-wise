import React from 'react';
import { cn } from '@/lib/utils';

interface TouchTargetProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  asChild?: boolean;
}

export function TouchTarget({ 
  children, 
  className, 
  asChild = false,
  ...props 
}: TouchTargetProps) {
  if (asChild) {
    return React.cloneElement(
      React.Children.only(children) as React.ReactElement,
      {
        className: cn('min-h-touch min-w-touch touch-manipulation', className),
        ...props
      }
    );
  }

  return (
    <div 
      className={cn('min-h-touch min-w-touch touch-manipulation', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function MobileKeyboardSpacer() {
  React.useEffect(() => {
    const handleViewportChange = () => {
      // Handle keyboard appearing/disappearing
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    window.addEventListener('resize', handleViewportChange);
    handleViewportChange();

    return () => window.removeEventListener('resize', handleViewportChange);
  }, []);

  return null;
}