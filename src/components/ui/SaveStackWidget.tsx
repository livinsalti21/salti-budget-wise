import React, { useState, useEffect } from 'react';
import { PiggyBank, Plus, TrendingUp, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SaveData {
  id: string;
  amount_cents: number;
  reason: string;
  created_at: string;
}

export function SaveStackWidget() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recentSaves, setRecentSaves] = useState<SaveData[]>([]);
  const [totalSaved, setTotalSaved] = useState(0);

  const loadRecentSaves = async () => {
    if (!user) return;

    try {
      const { data: saves } = await supabase
        .from('saves')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (saves) {
        setRecentSaves(saves);
        const total = saves.reduce((sum, save) => sum + save.amount_cents, 0);
        setTotalSaved(total);
      }
    } catch (error) {
      console.error('Error loading recent saves:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadRecentSaves();
    }
  }, [user]);

  // Don't show widget if user is not authenticated
  if (!user) return null;

  const calculateFutureValue = (amountCents: number, years: number = 10): number => {
    const principal = amountCents / 100;
    const annualRate = 0.08; // 8% annual return
    return principal * Math.pow(1 + annualRate, years);
  };

  const handleQuickSave = async (quickAmount: number) => {
    if (!user) return;
    
    setIsLoading(true);
    
    const amountCents = quickAmount * 100;
    
    const { error } = await supabase
      .from('saves')
      .insert({
        user_id: user.id,
        amount_cents: amountCents,
        reason: 'Quick save',
      });

    if (error) {
      toast({
        title: "Error saving",
        description: error.message,
        variant: "destructive",
      });
    } else {
      const futureValue = calculateFutureValue(amountCents);
      
      toast({
        title: `Nice! You saved $${quickAmount} 🎉`,
        description: `Worth $${futureValue.toFixed(2)} in 10 years!`,
      });
      
      loadRecentSaves();
    }
    
    setIsLoading(false);
  };

  const handleCustomSave = async () => {
    if (!user || !amount || !reason) return;
    
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
      const futureValue = calculateFutureValue(amountCents);
      
      toast({
        title: `Great save! $${amount} stacked 🚀`,
        description: `Future value: $${futureValue.toFixed(2)} in 10 years!`,
      });
      
      setAmount('');
      setReason('');
      loadRecentSaves();
    }
    
    setIsLoading(false);
  };

  // Collapsed state - floating button
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
    <div className="fixed bottom-20 right-4 z-40 w-80">
      <Card className="shadow-xl border-border/50 bg-background/95 backdrop-blur">
        <CardHeader className="flex-row items-center justify-between space-y-0 p-4 bg-gradient-to-r from-primary/10 to-accent/5">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold text-sm">Save & Stack</h3>
              <p className="text-xs text-muted-foreground">
                Total: ${(totalSaved / 100).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 space-y-4">
          {/* Quick Save Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 25, 50].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => handleQuickSave(amount)}
                disabled={isLoading}
                className="text-xs"
              >
                ${amount}
              </Button>
            ))}
          </div>

          {/* Custom Save Form */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-6 h-8 text-sm"
                />
              </div>
              <Input
                placeholder="What did you skip?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="flex-1 h-8 text-sm"
              />
            </div>
            
            <Button 
              onClick={handleCustomSave}
              disabled={isLoading || !amount || !reason}
              size="sm"
              className="w-full h-8 text-xs"
            >
              Stack Save
            </Button>
          </div>

          {/* Impact Preview */}
          {amount && !isNaN(parseFloat(amount)) && (
            <div className="flex items-center justify-between p-2 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span className="text-xs text-muted-foreground">10yr value:</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                ${calculateFutureValue(parseFloat(amount) * 100).toFixed(2)}
              </Badge>
            </div>
          )}

          {/* Recent Saves (Expanded) */}
          {isExpanded && recentSaves.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">Recent Saves</h4>
              {recentSaves.map((save) => (
                <div key={save.id} className="flex items-center justify-between text-xs p-2 bg-secondary/20 rounded">
                  <div>
                    <span className="font-medium">${(save.amount_cents / 100).toFixed(2)}</span>
                    <span className="text-muted-foreground ml-1">• {save.reason}</span>
                  </div>
                  <span className="text-primary font-medium">
                    ${calculateFutureValue(save.amount_cents).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}