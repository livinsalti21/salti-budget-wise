import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PiggyBank, Plus, Target, Calendar, TrendingUp, Archive, Edit3, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Stacklet {
  id: string;
  title: string;
  emoji: string;
  target_cents: number | null;
  deadline_date: string | null;
  asset_type: 'CASH' | 'BTC';
  progress_cents: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

const EMOJI_OPTIONS = ['🎯', '🌴', '🏠', '🚗', '✈️', '🎓', '💍', '🎮', '📱', '👔', '🏖️', '🎸'];

const StackletManager = () => {
  const [stacklets, setStacklets] = useState<Stacklet[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    emoji: '🎯',
    target_cents: '',
    deadline_date: '',
    asset_type: 'CASH' as 'CASH' | 'BTC'
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  const loadStacklets = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('stacklets')
      .select('*')
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
    }
  };

  useEffect(() => {
    loadStacklets();
  }, [user]);

  const handleCreateStacklet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);

    const { error } = await supabase
      .from('stacklets')
      .insert({
        user_id: user.id,
        title: formData.title,
        emoji: formData.emoji,
        target_cents: formData.target_cents ? parseInt(formData.target_cents) : null,
        deadline_date: formData.deadline_date || null,
        asset_type: formData.asset_type,
      });

    if (error) {
      toast({
        title: "Error creating stacklet",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Stacklet created! 🎉",
        description: `${formData.emoji} ${formData.title} is ready for stacking!`,
      });
      
      setFormData({
        title: '',
        emoji: '🎯',
        target_cents: '',
        deadline_date: '',
        asset_type: 'CASH'
      });
      setShowCreateDialog(false);
      loadStacklets();
    }
    
    setIsLoading(false);
  };

  const calculateProgress = (stacklet: Stacklet) => {
    if (!stacklet.target_cents) return 0;
    return Math.min((stacklet.progress_cents / stacklet.target_cents) * 100, 100);
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const getDaysUntilDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Stacklets</h2>
          <p className="text-muted-foreground">Goals that turn saves into future wealth</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Stacklet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Stacklet</DialogTitle>
              <DialogDescription>
                Set a goal and start stacking towards your dreams
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateStacklet} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    placeholder="Spring Break Trip"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emoji">Emoji</Label>
                  <Select value={formData.emoji} onValueChange={(value) => setFormData({ ...formData, emoji: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMOJI_OPTIONS.map((emoji) => (
                        <SelectItem key={emoji} value={emoji}>
                          {emoji}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target">Target Amount ($)</Label>
                  <Input
                    id="target"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="500.00"
                    value={formData.target_cents}
                    onChange={(e) => setFormData({ ...formData, target_cents: e.target.value ? (parseFloat(e.target.value) * 100).toString() : '' })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline (Optional)</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline_date}
                    onChange={(e) => setFormData({ ...formData, deadline_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset_type">Asset Type</Label>
                <Select value={formData.asset_type} onValueChange={(value: 'CASH' | 'BTC') => setFormData({ ...formData, asset_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">💵 Cash</SelectItem>
                    <SelectItem value="BTC">₿ Bitcoin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Stacklet'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stacklets Grid */}
      {stacklets.length === 0 ? (
        <Card className="p-8 text-center">
          <PiggyBank className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No stacklets yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first stacklet to start building toward your goals
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create First Stacklet
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stacklets.map((stacklet) => {
            const progress = calculateProgress(stacklet);
            const daysLeft = getDaysUntilDeadline(stacklet.deadline_date);
            
            return (
              <Card key={stacklet.id} className="relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <Badge variant={stacklet.asset_type === 'BTC' ? 'secondary' : 'outline'}>
                    {stacklet.asset_type === 'BTC' ? <Coins className="mr-1 h-3 w-3" /> : '💵'}
                    {stacklet.asset_type}
                  </Badge>
                </div>
                
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="text-2xl">{stacklet.emoji}</span>
                    {stacklet.title}
                  </CardTitle>
                  {stacklet.deadline_date && (
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {daysLeft !== null && daysLeft >= 0 ? `${daysLeft} days left` : 'Overdue'}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        ${formatCurrency(stacklet.progress_cents)}
                        {stacklet.target_cents && ` / $${formatCurrency(stacklet.target_cents)}`}
                      </span>
                    </div>
                    {stacklet.target_cents && (
                      <Progress value={progress} className="h-2" />
                    )}
                  </div>
                  
                  {stacklet.target_cents && progress >= 100 && (
                    <div className="text-center py-2">
                      <Badge variant="default" className="bg-success text-success-foreground">
                        🎉 Goal Achieved!
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      Add Save
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StackletManager;