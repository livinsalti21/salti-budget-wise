import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PiggyBank, Zap, TrendingUp, Target, Plus, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ShareCard from '@/components/ShareCard';

interface Stacklet {
  id: string;
  title: string;
  emoji: string;
  target_cents: number | null;
  progress_cents: number;
  asset_type: 'CASH' | 'BTC';
}

interface ImpactProjection {
  oneYear: number;
  fiveYears: number;
  tenYears: number;
  twentyYears: number;
  thirtyYears: number;
}

const SaveToStacklet = () => {
  const [stacklets, setStacklets] = useState<Stacklet[]>([]);
  const [selectedStackletId, setSelectedStackletId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [shareData, setShareData] = useState<any>(null);
  const [userStats, setUserStats] = useState({ totalSaved: 0, streakDays: 0 });
  const { user } = useAuth();
  const { toast } = useToast();

  const loadStacklets = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('stacklets')
      .select('id, title, emoji, target_cents, progress_cents, asset_type')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error loading stacklets",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setStacklets((data || []) as Stacklet[]);
      if (data && data.length > 0 && !selectedStackletId) {
        setSelectedStackletId(data[0].id);
      }
    }

    // Load user stats for share card
    const { data: saveEvents } = await supabase
      .from('save_events')
      .select('amount_cents')
      .eq('user_id', user.id);

    const { data: streakData } = await supabase
      .from('user_streaks')
      .select('consecutive_days')
      .eq('user_id', user.id)
      .single();

    setUserStats({
      totalSaved: (saveEvents || []).reduce((sum, save) => sum + save.amount_cents, 0),
      streakDays: streakData?.consecutive_days || 0
    });
  };

  useEffect(() => {
    loadStacklets();
  }, [user]);

  const calculateImpactProjection = (amountCents: number): ImpactProjection => {
    const principal = amountCents / 100; // Convert to dollars
    const annualRate = 0.08; // 8% annual return as per spec
    
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
    if (!user || !selectedStackletId) return;
    
    setIsLoading(true);
    
    const amountCents = Math.round(parseFloat(amount) * 100);
    
    const { error } = await supabase
      .from('save_events')
      .insert({
        user_id: user.id,
        stacklet_id: selectedStackletId,
        amount_cents: amountCents,
        source: 'manual',
        note: note || null,
      });

    if (error) {
      toast({
        title: "Error saving",
        description: error.message,
        variant: "destructive",
      });
    } else {
      const selectedStacklet = stacklets.find(s => s.id === selectedStackletId);
      const projection = calculateImpactProjection(amountCents);
      
      toast({
        title: `${selectedStacklet?.emoji} Stacked $${amount}! 🎉`,
        description: `Worth $${projection.twentyYears.toFixed(2)} in 20 years at 8% returns!`,
      });

      // Prepare share card data
      setShareData({
        amount: amount,
        goalEmoji: selectedStacklet?.emoji || '🎯',
        goalTitle: selectedStacklet?.title || 'Goal',
        streakDays: userStats.streakDays,
        futureValue: projection.twentyYears.toFixed(2),
        totalSaved: ((userStats.totalSaved + amountCents) / 100).toFixed(2)
      });
      
      setAmount('');
      setNote('');
      
      // Show share card
      setShowShareCard(true);
      
      // Reload stacklets to show updated progress
      loadStacklets();
    }
    
    setIsLoading(false);
  };

  const getQuickAmounts = () => [5, 10, 25, 50];

  const setQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const getProjectionPreview = () => {
    if (!amount || isNaN(parseFloat(amount))) return null;
    
    const amountCents = Math.round(parseFloat(amount) * 100);
    return calculateImpactProjection(amountCents);
  };

  const selectedStacklet = stacklets.find(s => s.id === selectedStackletId);
  const projection = getProjectionPreview();

  if (stacklets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Save & Stack
          </CardTitle>
          <CardDescription>
            Create a stacklet first to start saving toward your goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Plus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No stacklets found</p>
            <Button variant="outline">Create Your First Stacklet</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Save Form */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Save & Stack
          </CardTitle>
          <CardDescription>
            Add money to your stacklets and watch your future wealth grow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveStack} className="space-y-4">
            {/* Stacklet Selection */}
            <div className="space-y-2">
              <Label htmlFor="stacklet">Choose Stacklet</Label>
              <Select value={selectedStackletId} onValueChange={setSelectedStackletId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a stacklet" />
                </SelectTrigger>
                <SelectContent>
                  {stacklets.map((stacklet) => (
                    <SelectItem key={stacklet.id} value={stacklet.id}>
                      <div className="flex items-center gap-2">
                        <span>{stacklet.emoji}</span>
                        <span>{stacklet.title}</span>
                        <Badge variant="outline" className="ml-auto">
                          {stacklet.asset_type}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Stacklet Progress */}
            {selectedStacklet && selectedStacklet.target_cents && (
              <div className="p-3 bg-secondary/20 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Current Progress</span>
                  <span className="font-medium">
                    ${(selectedStacklet.progress_cents / 100).toFixed(2)} / ${(selectedStacklet.target_cents / 100).toFixed(2)}
                  </span>
                </div>
                <Progress 
                  value={Math.min((selectedStacklet.progress_cents / selectedStacklet.target_cents) * 100, 100)} 
                  className="h-2" 
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Save</Label>
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
                {/* Quick Amount Buttons */}
                <div className="flex gap-2">
                  {getQuickAmounts().map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickAmount(quickAmount)}
                    >
                      ${quickAmount}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">What did you skip? (Optional)</Label>
                <Input
                  id="note"
                  placeholder="Coffee, lunch out, impulse buy..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading || !amount || !selectedStackletId}>
              <Zap className="mr-2 h-4 w-4" />
              {isLoading ? 'Stacking...' : 'Stack This Save!'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Impact Projection */}
      {projection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Future Value Impact
            </CardTitle>
            <CardDescription>
              See how your ${amount} save could grow over time with 8% annual returns
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
            
              <div className="mt-4 flex justify-center">
                <Badge variant="secondary">
                  <Target className="mr-1 h-3 w-3" />
                  8% Annual Return Assumption
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Share Card Modal */}
        {showShareCard && shareData && (
          <ShareCard 
            data={shareData} 
            onClose={() => setShowShareCard(false)} 
          />
        )}
      </div>
    );
};

export default SaveToStacklet;