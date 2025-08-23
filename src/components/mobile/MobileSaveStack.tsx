import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PiggyBank, Zap, TrendingUp, Target, Coffee, ShoppingBag, Car, Utensils } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TouchTarget } from '@/components/ui/mobile-helpers';

interface ImpactProjection {
  oneYear: number;
  fiveYears: number;
  tenYears: number;
  twentyYears: number;
  thirtyYears: number;
  fortyYears: number;
}

const quickAmounts = [
  { amount: '1.00', icon: Coffee, label: 'Coffee' },
  { amount: '5.00', icon: Utensils, label: 'Lunch' },
  { amount: '10.00', icon: ShoppingBag, label: 'Shopping' },
  { amount: '25.00', icon: Car, label: 'Gas/Uber' },
];

const quickReasons = [
  'Skipped coffee',
  'Cooked at home',
  'Walked instead of Uber',
  'Found a deal',
  'Avoided impulse buy',
  'Used what I had',
];

export default function MobileSaveStack() {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showProjection, setShowProjection] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const calculateImpactProjection = (amountCents: number): ImpactProjection => {
    const principal = amountCents / 100;
    const annualRate = 0.08;
    
    return {
      oneYear: principal * Math.pow(1 + annualRate, 1),
      fiveYears: principal * Math.pow(1 + annualRate, 5),
      tenYears: principal * Math.pow(1 + annualRate, 10),
      twentyYears: principal * Math.pow(1 + annualRate, 20),
      thirtyYears: principal * Math.pow(1 + annualRate, 30),
      fortyYears: principal * Math.pow(1 + annualRate, 40),
    };
  };

  const handleQuickAmount = (quickAmount: string, quickReason: string) => {
    setAmount(quickAmount);
    setReason(quickReason);
    setShowProjection(true);
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
        description: `$${amount} saved! In 10 years: $${projection.tenYears.toFixed(2)}`,
        duration: 5000,
      });
      
      setAmount('');
      setReason('');
      setShowProjection(false);
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
    <div className="space-y-4">
      {/* Quick Action Buttons */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <PiggyBank className="h-5 w-5" />
            Quick Save
          </CardTitle>
          <CardDescription className="text-sm">
            Tap a button to instantly log your smart choice
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {quickAmounts.map((quick, index) => {
              const Icon = quick.icon;
              return (
                <TouchTarget key={index} asChild>
                  <Button
                    variant="outline"
                    className="h-16 flex-col gap-1 bg-background/50 hover:bg-primary/10 border-primary/20"
                    onClick={() => handleQuickAmount(quick.amount, `Skipped ${quick.label.toLowerCase()}`)}
                  >
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-semibold">${quick.amount}</span>
                    <span className="text-xs text-muted-foreground">{quick.label}</span>
                  </Button>
                </TouchTarget>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Custom Amount Form */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Custom Save</CardTitle>
          <CardDescription className="text-sm">
            Enter any amount and reason
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveStack} className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">Amount Saved</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="5.50"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setShowProjection(!!e.target.value);
                    }}
                    className="pl-8 h-12 text-lg"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="text-sm font-medium">What did you skip?</Label>
                <Input
                  id="reason"
                  placeholder="Coffee, lunch out, impulse buy..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="h-12"
                  required
                />
                
                {/* Quick reason suggestions */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {quickReasons.map((quickReason, index) => (
                    <TouchTarget key={index} asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs bg-muted/50 hover:bg-primary/10"
                        onClick={() => setReason(quickReason)}
                      >
                        {quickReason}
                      </Button>
                    </TouchTarget>
                  ))}
                </div>
              </div>
            </div>
            
            <TouchTarget asChild>
              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90" 
                disabled={isLoading || !amount || !reason}
              >
                <Zap className="mr-2 h-5 w-5" />
                {isLoading ? 'Saving...' : 'Stack This Save!'}
              </Button>
            </TouchTarget>
          </form>
        </CardContent>
      </Card>

      {/* Impact Projection - Mobile Optimized */}
      {projection && showProjection && (
        <Card className="bg-gradient-to-br from-warning/10 to-success/10 border-warning/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-warning" />
              Your ${amount} Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <p className="text-xs text-muted-foreground font-medium">1 Year</p>
                <p className="text-sm font-semibold text-accent">${projection.oneYear.toFixed(2)}</p>
              </div>
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <p className="text-xs text-muted-foreground font-medium">10 Years</p>
                <p className="text-lg font-bold text-warning">${projection.tenYears.toFixed(2)}</p>
              </div>
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <p className="text-xs text-muted-foreground font-medium">20 Years</p>
                <p className="text-lg font-bold text-success">${projection.twentyYears.toFixed(2)}</p>
              </div>
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <p className="text-xs text-muted-foreground font-medium">30 Years</p>
                <p className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  ${projection.thirtyYears.toFixed(2)}
                </p>
              </div>
            </div>
            
            <Badge variant="secondary" className="w-full justify-center py-2">
              <Target className="mr-1 h-3 w-3" />
              Based on 8% annual return
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
}