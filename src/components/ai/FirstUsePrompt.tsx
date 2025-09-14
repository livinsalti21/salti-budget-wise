import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FirstUsePromptProps {
  trigger: 'csv_upload' | 'first_budget' | 'first_save' | 'streak_milestone';
  onDismiss: () => void;
  onOpenChat: () => void;
}

const promptContent = {
  csv_upload: {
    title: "🎯 Want me to analyze this data?",
    description: "I can help create your first budget in 60 seconds using your spending patterns!",
    cta: "Ask AI Coach"
  },
  first_budget: {
    title: "💡 Optimize your budget?", 
    description: "I found 3 ways to save $127/month. Want to see them?",
    cta: "Show me how"
  },
  first_save: {
    title: "🚀 Great first save!",
    description: "What if you saved this amount daily for 10 years? The answer might surprise you!",
    cta: "Run projection"
  },
  streak_milestone: {
    title: "🔥 Streak milestone reached!",
    description: "You're building amazing habits! Let me show you the compound impact.",
    cta: "See my impact"
  }
};

export function FirstUsePrompt({ trigger, onDismiss, onOpenChat }: FirstUsePromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const content = promptContent[trigger];

  useEffect(() => {
    // Animate in after a short delay
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    onOpenChat();
    onDismiss();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 200);
  };

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 max-w-sm transition-all duration-300",
      isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
    )}>
      <Card className="border-primary/20 shadow-xl bg-gradient-to-br from-background to-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <span className="font-semibold text-sm">Salti Coach</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 hover:bg-muted/50"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm mb-1">{content.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {content.description}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleAccept}
                size="sm"
                className="flex-1 h-8 text-xs font-medium"
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                {content.cta}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-8 text-xs"
              >
                Later
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}