import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureTooltipProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}

export function FeatureTooltip({ title, description, children, className }: FeatureTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn("h-6 w-6 p-0 text-muted-foreground hover:text-foreground", className)}
        aria-label={`Help: ${title}`}
      >
        <HelpCircle className="h-4 w-4" />
      </Button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Tooltip content */}
          <Card className="absolute top-8 left-0 z-50 w-72 shadow-lg border-border/50 animate-in fade-in-0 zoom-in-95 duration-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-sm">{title}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0 text-muted-foreground"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {description}
              </p>
              {children}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}