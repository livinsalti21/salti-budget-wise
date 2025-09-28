import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, HelpCircle } from 'lucide-react';

interface ContextualTooltipProps {
  id: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'click' | 'hover' | 'auto';
  autoShow?: boolean;
  children?: React.ReactNode;
}

export function ContextualTooltip({ 
  id, 
  title, 
  description, 
  position = 'bottom',
  trigger = 'click',
  autoShow = false,
  children 
}: ContextualTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);

  useEffect(() => {
    // Check if user has seen this tooltip before
    const seen = localStorage.getItem(`tooltip_seen_${id}`);
    setHasBeenSeen(!!seen);
    
    // Auto-show if configured and not seen before
    if (autoShow && !seen) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [id, autoShow]);

  const handleClose = () => {
    setIsVisible(false);
    setHasBeenSeen(true);
    localStorage.setItem(`tooltip_seen_${id}`, 'true');
  };

  const handleTrigger = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  if (hasBeenSeen && !isVisible) return null;

  return (
    <div className="relative inline-block">
      {trigger === 'click' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTrigger}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          aria-label={`Help: ${title}`}
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      )}
      
      {isVisible && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 z-40 md:hidden" 
            onClick={handleClose}
            aria-hidden="true"
          />
          
          {/* Tooltip content */}
          <Card className={`
            absolute z-50 w-72 shadow-lg border-border/50 animate-in fade-in-0 zoom-in-95 duration-200
            ${position === 'bottom' ? 'top-8 left-0' : ''}
            ${position === 'top' ? 'bottom-8 left-0' : ''}
            ${position === 'right' ? 'left-8 top-0' : ''}
            ${position === 'left' ? 'right-8 top-0' : ''}
          `}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-sm">{title}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-6 w-6 p-0 text-muted-foreground"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
              {children && (
                <div className="mt-3 pt-3 border-t border-border">
                  {children}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}