import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, X, Clock } from 'lucide-react';

interface InsightCardProps {
  title: string;
  description: string;
  impact?: string;
  actionLabel?: string;
  onAccept?: () => void;
  onSnooze?: () => void;
  onDismiss?: () => void;
  variant?: 'default' | 'success' | 'warning' | 'info';
}

export default function InsightCard({
  title,
  description,
  impact,
  actionLabel = 'Accept',
  onAccept,
  onSnooze,
  onDismiss,
  variant = 'default'
}: InsightCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-success/20 bg-success/5';
      case 'warning':
        return 'border-warning/20 bg-warning/5';
      case 'info':
        return 'border-primary/20 bg-primary/5';
      default:
        return 'border-border bg-muted/10';
    }
  };

  return (
    <Card className={`${getVariantStyles()} relative overflow-hidden`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Insight
          </CardTitle>
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0 hover:bg-destructive/10"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          {impact && (
            <Badge variant="secondary" className="mt-2 text-xs">
              Impact: {impact}
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2 pt-2">
          {onAccept && (
            <Button onClick={onAccept} size="sm" className="text-xs">
              {actionLabel}
            </Button>
          )}
          {onSnooze && (
            <Button onClick={onSnooze} variant="outline" size="sm" className="text-xs">
              <Clock className="mr-1 h-3 w-3" />
              Later
            </Button>
          )}
          {onDismiss && (
            <Button onClick={onDismiss} variant="ghost" size="sm" className="text-xs">
              Never
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}