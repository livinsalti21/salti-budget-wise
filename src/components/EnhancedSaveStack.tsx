import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { PiggyBank, TrendingUp, Zap, Share2, Target, Users, Award, Flame, Calendar } from 'lucide-react';
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

interface StreakData {
  current_length: number;
  longest_length: number;
  is_active: boolean;
}

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at?: string;
}

interface SaveData {
  id: string;
  amount_cents: number;
  reason: string;
  created_at: string;
}

const EnhancedSaveStack = () => {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userStreak, setUserStreak] = useState<StreakData | null>(null);
  const [userBadges, setUserBadges] = useState<BadgeData[]>([]);
  const [recentSaves, setRecentSaves] = useState<SaveData[]>([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const calculateImpactProjection = (amountCents: number): ImpactProjection => {
    const principal = amountCents / 100; // Convert to dollars
    const annualRate = 0.08; // 8% annual return (updated to mission spec)
    
    return {
      oneYear: principal * Math.pow(1 + annualRate, 1),
      fiveYears: principal * Math.pow(1 + annualRate, 5),
      tenYears: principal * Math.pow(1 + annualRate, 10),
      twentyYears: principal * Math.pow(1 + annualRate, 20),
      thirtyYears: principal * Math.pow(1 + annualRate, 30),
    };
  };

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load user saves
      const { data: saves } = await supabase
        .from('saves')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (saves) {
        setRecentSaves(saves);
        const total = saves.reduce((sum, save) => sum + save.amount_cents, 0);
        setTotalSaved(total);
      }

      // Mock badges and streaks for now until database is set up
      setUserBadges([
        { id: '1', name: 'First Save', description: 'Made your first save!', icon: '🎯' },
        { id: '2', name: 'Consistent Saver', description: 'Saved 5 times', icon: '🔥' }
      ]);
      
      setUserStreak({
        current_length: Math.floor(saves?.length || 0 / 2),
        longest_length: saves?.length || 0,
        is_active: true
      });

    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

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
        title: "Nice! You just stacked $" + amount + " today 🎉",
        description: `That's worth $${projection.twentyYears.toFixed(2)} in 20 years at 8% returns!`,
      });
      
      setAmount('');
      setReason('');
      
      // Reload user data to show updated stats
      loadUserData();
      
      // Show match dialog after successful save
      setShowMatchDialog(true);
    }
    
    setIsLoading(false);
  };

  const handleInviteToMatch = () => {
    // For now, just show a success message
    toast({
      title: "Invite sent! 📨",
      description: "Your friends will get a notification to match this save and grow together.",
    });
    setShowMatchDialog(false);
  };

  const getProjectionPreview = () => {
    if (!amount || isNaN(parseFloat(amount))) return null;
    
    const amountCents = Math.round(parseFloat(amount) * 100);
    return calculateImpactProjection(amountCents);
  };

  const projection = getProjectionPreview();

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Saved</p>
                <p className="text-xl font-bold text-primary">
                  ${(totalSaved / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-warning/10 to-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Save Streak</p>
                <p className="text-xl font-bold text-warning">
                  {userStreak?.current_length || 0} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-accent/10 to-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
                <p className="text-xl font-bold text-accent">
                  {userBadges.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save & Stack Form */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Save & Stack
          </CardTitle>
          <CardDescription>
            Save smarter, stack faster, live your way. Every save becomes future wealth and celebrates your progress.
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
              {isLoading ? 'Stacking...' : 'Stack This Save!'}
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
            
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowMatchDialog(true)}>
                <Users className="mr-2 h-4 w-4" />
                Invite to Match
              </Button>
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

      {/* Recent Saves */}
      {recentSaves.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Saves
            </CardTitle>
            <CardDescription>
              Your latest saves and their future impact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSaves.map((save) => {
                const saveProjection = calculateImpactProjection(save.amount_cents);
                return (
                  <div key={save.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                    <div>
                      <p className="font-medium">${(save.amount_cents / 100).toFixed(2)} - {save.reason}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(save.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">
                        ${saveProjection.twentyYears.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">in 20 years</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Match Save Dialog */}
      <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Friends to Match! 🤝</DialogTitle>
            <DialogDescription>
              Saving is better together. Invite friends or family to match this save and grow wealth side by side.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-primary/10 rounded-lg">
              <h4 className="font-medium">Your Save: ${amount}</h4>
              <p className="text-sm text-muted-foreground">Reason: {reason}</p>
              {projection && (
                <p className="text-sm font-medium text-primary mt-2">
                  Future value: ${projection.twentyYears.toFixed(2)} in 20 years
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleInviteToMatch} className="flex-1">
                <Users className="mr-2 h-4 w-4" />
                Send Invite
              </Button>
              <Button variant="outline" onClick={() => setShowMatchDialog(false)}>
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedSaveStack;