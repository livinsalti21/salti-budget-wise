import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PiggyBank, TrendingUp, Zap, Share2, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ImpactProjection {
  oneYear: number;
  fiveYears: number;
  tenYears: number;
  twentyYears: number;
  thirtyYears: number;
}

const SaveStack = () => {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const calculateImpactProjection = (amountCents: number): ImpactProjection => {
    const principal = amountCents / 100; // Convert to dollars
    const annualRate = 0.07; // 7% annual return
    
    return {
      oneYear: principal * Math.pow(1 + annualRate, 1),
      fiveYears: principal * Math.pow(1 + annualRate, 5),
      tenYears: principal * Math.pow(1 + annualRate, 10),
      twentyYears: principal * Math.pow(1 + annualRate, 20),
      thirtyYears: principal * Math.pow(1 + annualRate, 30),
    };
  };

  const handleSaveStack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    
    const amountCents = Math.round(parseFloat(amount) * 100);
    
    const { error } = await supabase
      .from('saves')
      .insert({
        user_id: user.id,
        amount_cents: amountCents,
        reason: reason,
      });

    if (error) {
      toast({
        title: "Error saving",
        description: error.message,
        variant: "destructive",
      });
    } else {
      const projection = calculateImpactProjection(amountCents);
      
      toast({
        title: "Save Stacked! 🎉",
        description: `$${amount} saved! In 10 years, this could be worth $${projection.tenYears.toFixed(2)}`,
      });
      
      setAmount('');
      setReason('');
    }
    
    setIsLoading(false);
  };

  const getProjectionPreview = () => {
    if (!amount || isNaN(parseFloat(amount))) return null;
    
    const amountCents = Math.round(parseFloat(amount) * 100);
    return calculateImpactProjection(amountCents);
  };

  const projection = getProjectionPreview();

  return (
    <div className="space-y-6">
      {/* Save & Stack Form */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Save & Stack
          </CardTitle>
          <CardDescription>
            Skip a purchase and stack your savings for the future
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveStack} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount Saved</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="5.50"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">What did you skip?</Label>
                <Input
                  id="reason"
                  placeholder="Coffee, lunch out, impulse buy..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading || !amount || !reason}>
              <Zap className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : 'Stack This Save!'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Impact Projection Preview */}
      {projection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Impact Projection
            </CardTitle>
            <CardDescription>
              See how your ${amount} save could grow over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">1 Year</p>
                <p className="text-lg font-semibold text-accent">${projection.oneYear.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">5 Years</p>
                <p className="text-lg font-semibold text-primary">${projection.fiveYears.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">10 Years</p>
                <p className="text-xl font-bold text-warning">${projection.tenYears.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">20 Years</p>
                <p className="text-xl font-bold text-success">${projection.twentyYears.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">30 Years</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  ${projection.thirtyYears.toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share Impact
              </Button>
              <Badge variant="secondary" className="ml-auto">
                <Target className="mr-1 h-3 w-3" />
                7% Annual Return
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SaveStack;