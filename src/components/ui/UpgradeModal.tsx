import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { analytics } from '@/analytics/analytics';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
  title?: string;
  description?: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  feature = "premium features",
  title = "Link your accounts & automate saving",
  description = "Upgrade to Pro to unlock automation and advanced features."
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const handleUpgrade = async (plan: string, interval: string = 'month') => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to upgrade your plan.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      analytics.track('upgrade_modal_clicked', { feature, plan, interval });
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan, interval }
      });

      if (error) throw error;

      // Open in new tab
      window.open(data.url, '_blank');
      onClose();
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: "Unable to start checkout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const proFeatures = [
    "Bank & card linking",
    "Auto Save n Stack",
    "AI Expense Coach",
    "Match Save with friends/family",
    "Live net worth tracking",
    "Advanced streaks & badges"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-xl">{title}</DialogTitle>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Pro Feature
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-base">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-3">
            {proFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">$4.99/month</div>
            <div className="text-sm text-muted-foreground">
              or $49/year (save 17%)
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2">
          <Button 
            onClick={() => handleUpgrade('pro', 'month')}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Loading...' : 'Go Pro – Monthly ($4.99)'}
          </Button>
          <Button 
            onClick={() => handleUpgrade('pro', 'year')}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Loading...' : 'Go Pro – Yearly ($49)'}
          </Button>
          <Button 
            onClick={onClose}
            variant="ghost"
            className="w-full"
          >
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;