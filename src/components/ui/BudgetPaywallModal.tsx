import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BudgetPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  title?: string;
  description?: string;
}

const BudgetPaywallModal = ({ 
  isOpen, 
  onClose, 
  feature,
  title = "Unlock Pro",
  description = "Get unlimited budgeting power with Pro features"
}: BudgetPaywallModalProps) => {
  const { toast } = useToast();

  const handleUpgrade = async (plan: string, interval: string = 'month') => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan, interval }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast({
        title: "Error",
        description: "Failed to start upgrade process",
        variant: "destructive"
      });
    }
  };

  const getFeatureMessage = (feature: string) => {
    switch (feature) {
      case 'INCOME_LIMIT':
        return "Add unlimited income sources";
      case 'BILL_LIMIT':
        return "Track unlimited bills and expenses";
      case 'GOAL_LIMIT':
        return "Set unlimited savings goals";
      case 'SAVE_RATE':
        return "Customize your savings rate";
      case 'CATEGORY_SPLITS':
        return "Adjust spending category splits";
      case 'HISTORY':
        return "View your budget history and trends";
      case 'EXPORT':
        return "Export your budgets as CSV/PDF";
      case 'AUTOMATION':
        return "Automate your Save n Stack transfers";
      default:
        return "Access advanced budgeting features";
    }
  };

  const proFeatures = [
    "Unlimited income sources & bills",
    "Custom save rate (0-50%)",
    "Adjustable category splits",
    "Budget history & trends",
    "CSV/PDF exports",
    "AI coaching & suggestions",
    "Auto Save n Stack scheduling",
    "Match Save with friends"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-6 w-6 text-primary" />
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Feature Limitation */}
          <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-5 w-5 text-primary" />
              <span className="font-medium">Feature Locked</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {getFeatureMessage(feature)}
            </p>
          </div>

          {/* Pro Features List */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              Pro Features Include:
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {proFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-success flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border rounded-lg p-4 text-center">
              <div className="font-semibold">Monthly</div>
              <div className="text-2xl font-bold text-primary">$4.99</div>
              <div className="text-xs text-muted-foreground">per month</div>
            </div>
            <div className="border rounded-lg p-4 text-center relative">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-success text-success-foreground text-xs">
                Save 20%
              </Badge>
              <div className="font-semibold">Yearly</div>
              <div className="text-2xl font-bold text-primary">$49</div>
              <div className="text-xs text-muted-foreground">per year</div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Maybe Later
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              onClick={() => handleUpgrade('pro', 'month')}
              className="flex-1 sm:flex-none"
            >
              Go Pro Monthly
            </Button>
            <Button 
              onClick={() => handleUpgrade('pro', 'year')}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              Go Pro Yearly
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetPaywallModal;