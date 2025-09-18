import React, { useState } from 'react';
import { PiggyBank, Plus, X, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface ImpactProjection {
  oneYear: number;
  fiveYears: number;
  tenYears: number;
  thirtyYears: number;
}

export function SaveStackWidget() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Don't show widget if user is not authenticated
  if (!user) return null;

  const quickAmounts = [
    { value: '5', label: '$5', emoji: '☕' },
    { value: '10', label: '$10', emoji: '🍕' },
    { value: '25', label: '$25', emoji: '🎬' },
  ];

  const calculateImpactProjection = (amountCents: number): ImpactProjection => {
    const annualRate = 0.08; // 8% annual return
    const amount = amountCents / 100;
    
    return {
      oneYear: amount * Math.pow(1 + annualRate, 1),
      fiveYears: amount * Math.pow(1 + annualRate, 5),
      tenYears: amount * Math.pow(1 + annualRate, 10),
      thirtyYears: amount * Math.pow(1 + annualRate, 30)
    };
  };

  const handleQuickSave = async (quickAmount: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const amountCents = Math.round(parseFloat(quickAmount) * 100);
      const projection = calculateImpactProjection(amountCents);
      
      // Insert into saves table
      const { error } = await supabase
        .from('saves')
        .insert({
          user_id: user.id,
          amount_cents: amountCents,
          reason: `Quick save from widget`
        });

      if (error) throw error;

      toast({
        title: "💰 Save Stacked!",
        description: `$${quickAmount} saved! This could be worth $${projection.thirtyYears.toFixed(2)} in 30 years!`,
      });

      setIsOpen(false);
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "Error",
        description: "Failed to save. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSave = async () => {
    if (!user || !amount || parseFloat(amount) <= 0) return;
    
    setIsLoading(true);
    try {
      const amountCents = Math.round(parseFloat(amount) * 100);
      const projection = calculateImpactProjection(amountCents);
      
      // Insert into saves table
      const { error } = await supabase
        .from('saves')
        .insert({
          user_id: user.id,
          amount_cents: amountCents,
          reason: `Custom save from widget`
        });

      if (error) throw error;

      toast({
        title: "🚀 Save Stacked!",
        description: `$${amount} saved! This could be worth $${projection.thirtyYears.toFixed(2)} in 30 years!`,
      });

      setAmount('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "Error",
        description: "Failed to save. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getProjectionPreview = (): ImpactProjection | null => {
    const amountValue = parseFloat(amount);
    if (!amountValue || amountValue <= 0) return null;
    
    return calculateImpactProjection(Math.round(amountValue * 100));
  };

  const projection = getProjectionPreview();

  if (!isOpen) {
    return (
      <div className="fixed bottom-20 right-4 z-40">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 border-0 transition-all duration-300 hover:scale-105 active:scale-95 group"
        >
          <div className="flex flex-col items-center group-hover:scale-110 transition-transform duration-200">
            <Plus className="h-5 w-5 text-primary-foreground drop-shadow-sm" />
            <PiggyBank className="h-3 w-3 text-primary-foreground/90 -mt-1" />
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 w-80 max-h-96">
      <Card className="shadow-xl border-border/50">
        <CardHeader className="flex-row items-center justify-between space-y-0 p-4 bg-gradient-to-r from-primary/10 to-accent/5">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm">Save & Stack</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-4 space-y-4">
          {/* Quick Save Buttons */}
          <div>
            <div className="text-sm font-medium mb-2">Quick Save</div>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((quick) => (
                <Button
                  key={quick.value}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSave(quick.value)}
                  disabled={isLoading}
                  className="h-auto py-2 px-2 flex flex-col gap-1"
                >
                  <span className="text-base">{quick.emoji}</span>
                  <span className="text-xs">{quick.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <div className="text-sm font-medium mb-2">Custom Amount</div>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                placeholder="5.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleCustomSave}
                size="sm"
                disabled={isLoading || !amount || parseFloat(amount) <= 0}
                className="px-3"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Projection Preview */}
          {projection && (
            <div className="p-3 bg-gradient-to-r from-success/10 to-accent/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm font-medium">Future Value</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-bold text-primary">${projection.fiveYears.toFixed(0)}</div>
                  <div className="text-muted-foreground">5 years</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-success">${projection.thirtyYears.toFixed(0)}</div>
                  <div className="text-muted-foreground">30 years</div>
                </div>
              </div>
              <div className="text-xs text-center text-muted-foreground mt-2">
                @ 8% annual return
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}