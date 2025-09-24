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
import { useProfileSync } from '@/hooks/useProfileSync';

interface ImpactProjection {
  oneYear: number;
  fiveYears: number;
  tenYears: number;
  twentyYears: number;
  thirtyYears: number;
  fortyYears: number;
}

const SaveStack = () => {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { saveWithSync } = useProfileSync();

  const calculateImpactProjection = (amountCents: number): ImpactProjection => {
    const principal = amountCents / 100; // Convert to dollars
    const annualRate = 0.08; // 8% annual return
    
    return {
      oneYear: principal * Math.pow(1 + annualRate, 1),
      fiveYears: principal * Math.pow(1 + annualRate, 5),
      tenYears: principal * Math.pow(1 + annualRate, 10),
      twentyYears: principal * Math.pow(1 + annualRate, 20),
      thirtyYears: principal * Math.pow(1 + annualRate, 30),
      fortyYears: principal * Math.pow(1 + annualRate, 40),
    };
  };

  const calculate40YearProjection = (amountCents: number): number => {
    const principal = amountCents / 100;
    const annualRate = 0.08;
    return principal * Math.pow(1 + annualRate, 40);
  };

  const handleSaveStack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const amountCents = Math.round(parseFloat(amount) * 100);
      
      // Get user's first stacklet or create a default one
      let { data: stacklets } = await supabase
        .from('stacklets')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      let stackletId;
      if (!stacklets || stacklets.length === 0) {
        // Create a default stacklet
        const { data: newStacklet, error: stackletError } = await supabase
          .from('stacklets')
          .insert({
            user_id: user.id,
            title: 'General Savings',
            target_cents: 100000, // $1000 default
            emoji: '💰'
          })
          .select('id')
          .single();
        
        if (stackletError) throw stackletError;
        stackletId = newStacklet.id;
      } else {
        stackletId = stacklets[0].id;
      }

      // Use enhanced save with profile sync validation
      await saveWithSync({
        stacklet_id: stackletId,
        amount_cents: amountCents,
        reason: reason,
        source: 'manual'
      });

      const projection40Year = calculate40YearProjection(amountCents);
      
      toast({
        title: "💎 Wealth Builder Move!",
        description: `$${amount} invested in your future → $${projection40Year.toFixed(2)} compound wealth in 40 years! 🚀`,
        duration: 8000,
        className: "border-2 border-success bg-gradient-to-r from-success/20 to-primary/20 text-lg font-semibold shadow-2xl",
      });
      
      setAmount('');
      setReason('');
    } catch (error) {
      console.error('Save stack error:', error);
      toast({
        title: "Error saving",
        description: error instanceof Error ? error.message : 'Failed to save',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
            Wealth Accelerator
          </CardTitle>
          <CardDescription>
            Transform smart spending decisions into serious wealth accumulation. Every investment compounds your financial future.
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
              {isLoading ? 'Building Wealth...' : 'Accelerate My Wealth'}
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
              Your Wealth Trajectory
            </CardTitle>
            <CardDescription>
              See how your ${amount} investment compounds into serious wealth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
              <div className="text-center relative">
                <p className="text-sm text-muted-foreground font-medium">🎯 40-Year Wealth</p>
                <p className="text-3xl font-black bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                  ${projection.fortyYears.toFixed(2)}
                </p>
                <div className="absolute -top-1 -right-1">
                  <span className="text-xs bg-gradient-to-r from-accent to-primary text-white px-2 py-1 rounded-full font-bold">
                    HERO
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share Impact
              </Button>
              <Badge variant="secondary" className="ml-auto">
                <Target className="mr-1 h-3 w-3" />
                8% Annual Return
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SaveStack;