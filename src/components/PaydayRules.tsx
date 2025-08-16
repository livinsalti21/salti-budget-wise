import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Clock, Plus, Play, Pause, Calendar, DollarSign, Target, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PaydayRule {
  id: string;
  stacklet_id: string;
  trigger_cadence: 'weekly' | 'biweekly' | 'monthly';
  amount_cents: number;
  next_run_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Stacklet {
  id: string;
  title: string;
  emoji: string;
  asset_type: 'CASH' | 'BTC';
}

const PaydayRules = () => {
  const [rules, setRules] = useState<PaydayRule[]>([]);
  const [stacklets, setStacklets] = useState<Stacklet[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    stacklet_id: '',
    trigger_cadence: 'weekly' as 'weekly' | 'biweekly' | 'monthly',
    amount_dollars: '',
    start_date: ''
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  const loadData = async () => {
    if (!user) return;

    // Load stacklets
    const { data: stackletsData, error: stackletsError } = await supabase
      .from('stacklets')
      .select('id, title, emoji, asset_type')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (stackletsError) {
      toast({
        title: "Error loading stacklets",
        description: stackletsError.message,
        variant: "destructive",
      });
    } else {
      setStacklets((stackletsData || []) as Stacklet[]);
    }

    // Load payday rules
    const { data: rulesData, error: rulesError } = await supabase
      .from('payday_rules')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (rulesError) {
      toast({
        title: "Error loading payday rules",
        description: rulesError.message,
        variant: "destructive",
      });
    } else {
      setRules((rulesData || []) as PaydayRule[]);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const calculateNextRunDate = (cadence: string, startDate: string): Date => {
    const start = new Date(startDate);
    const now = new Date();
    
    // If start date is in the future, use it
    if (start > now) {
      return start;
    }
    
    // Otherwise, calculate next occurrence
    let nextRun = new Date(start);
    
    switch (cadence) {
      case 'weekly':
        while (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 7);
        }
        break;
      case 'biweekly':
        while (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 14);
        }
        break;
      case 'monthly':
        while (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        break;
    }
    
    return nextRun;
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);

    const nextRunAt = calculateNextRunDate(formData.trigger_cadence, formData.start_date);

    const { error } = await supabase
      .from('payday_rules')
      .insert({
        user_id: user.id,
        stacklet_id: formData.stacklet_id,
        trigger_cadence: formData.trigger_cadence,
        amount_cents: Math.round(parseFloat(formData.amount_dollars) * 100),
        next_run_at: nextRunAt.toISOString(),
        is_active: true,
      });

    if (error) {
      toast({
        title: "Error creating rule",
        description: error.message,
        variant: "destructive",
      });
    } else {
      const selectedStacklet = stacklets.find(s => s.id === formData.stacklet_id);
      toast({
        title: "Payday rule created! ⚡",
        description: `${selectedStacklet?.emoji} Auto-save $${formData.amount_dollars} ${formData.trigger_cadence}`,
      });
      
      setFormData({
        stacklet_id: '',
        trigger_cadence: 'weekly',
        amount_dollars: '',
        start_date: ''
      });
      setShowCreateDialog(false);
      loadData();
    }
    
    setIsLoading(false);
  };

  const toggleRuleActive = async (ruleId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('payday_rules')
      .update({ is_active: isActive })
      .eq('id', ruleId);

    if (error) {
      toast({
        title: "Error updating rule",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: isActive ? "Rule activated ▶️" : "Rule paused ⏸️",
        description: isActive ? "Auto-saves will continue" : "Auto-saves are paused",
      });
      loadData();
    }
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const formatNextRun = (nextRunAt: string) => {
    const nextRun = new Date(nextRunAt);
    const now = new Date();
    const diffMs = nextRun.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Overdue';
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else {
      return `${diffDays} days`;
    }
  };

  const getCadenceLabel = (cadence: string) => {
    switch (cadence) {
      case 'weekly': return 'Weekly';
      case 'biweekly': return 'Bi-weekly';
      case 'monthly': return 'Monthly';
      default: return cadence;
    }
  };

  // Set default start date to next Friday
  const getDefaultStartDate = () => {
    const now = new Date();
    const nextFriday = new Date();
    const daysUntilFriday = (5 + 7 - now.getDay()) % 7;
    nextFriday.setDate(now.getDate() + daysUntilFriday);
    return nextFriday.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payday Rules</h2>
          <p className="text-muted-foreground">Automate your saving habits — payday-proof your money</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button disabled={stacklets.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              New Rule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Payday Rule</DialogTitle>
              <DialogDescription>
                Set up automatic savings that run on your schedule
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRule} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stacklet">Target Stacklet</Label>
                <Select value={formData.stacklet_id} onValueChange={(value) => setFormData({ ...formData, stacklet_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose stacklet to save into" />
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cadence">How Often</Label>
                  <Select value={formData.trigger_cadence} onValueChange={(value: 'weekly' | 'biweekly' | 'monthly') => setFormData({ ...formData, trigger_cadence: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">📅 Weekly</SelectItem>
                      <SelectItem value="biweekly">📆 Bi-weekly</SelectItem>
                      <SelectItem value="monthly">🗓️ Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="25.00"
                    value={formData.amount_dollars}
                    onChange={(e) => setFormData({ ...formData, amount_dollars: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date || getDefaultStartDate()}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  First save will happen on this date, then repeat based on cadence
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Rule'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rules List */}
      {stacklets.length === 0 ? (
        <Card className="p-8 text-center">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Create stacklets first</h3>
          <p className="text-muted-foreground mb-4">
            You need stacklets before you can create payday rules
          </p>
          <Button variant="outline">Go to Stacklets</Button>
        </Card>
      ) : rules.length === 0 ? (
        <Card className="p-8 text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No payday rules yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first rule to automate your saving habits
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create First Rule
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => {
            const stacklet = stacklets.find(s => s.id === rule.stacklet_id);
            
            return (
              <Card key={rule.id} className={`transition-all ${rule.is_active ? 'border-primary/20' : 'border-muted'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">{stacklet?.emoji || '🎯'}</div>
                      
                      <div className="space-y-1">
                        <h3 className="font-semibold flex items-center gap-2">
                          {stacklet?.title || 'Unknown Stacklet'}
                          <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                            {rule.is_active ? (
                              <>
                                <Play className="mr-1 h-3 w-3" />
                                Active
                              </>
                            ) : (
                              <>
                                <Pause className="mr-1 h-3 w-3" />
                                Paused
                              </>
                            )}
                          </Badge>
                        </h3>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${formatCurrency(rule.amount_cents)} {getCadenceLabel(rule.trigger_cadence).toLowerCase()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Next: {formatNextRun(rule.next_run_at)}
                          </span>
                          {stacklet && (
                            <Badge variant="outline" className="text-xs">
                              {stacklet.asset_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={(checked) => toggleRuleActive(rule.id, checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-accent/10 to-primary/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium">How Payday Rules Work</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Rules automatically save money to your stacklets on your schedule. 
                This helps you build wealth before you even think about spending.
                Turn rules on/off anytime without losing your progress.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaydayRules;
