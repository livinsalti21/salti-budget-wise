import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const EMOJI_OPTIONS = ['🎯', '🌴', '🏠', '🚗', '✈️', '🎓', '💍', '🎮', '📱', '👔', '🏖️', '🎸', '💰', '🛡️', '🎊'];

const QUICK_AMOUNTS = [
  { label: '$100', value: 100 },
  { label: '$500', value: 500 },
  { label: '$1,000', value: 1000 },
  { label: '$5,000', value: 5000 },
];

const QUICK_DEADLINES = [
  { label: '1 Month', months: 1 },
  { label: '3 Months', months: 3 },
  { label: '6 Months', months: 6 },
  { label: '1 Year', months: 12 },
];

interface GoalCreateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function GoalCreateForm({ open, onOpenChange, onSuccess }: GoalCreateFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    emoji: '🎯',
    target_cents: '',
    deadline_date: '',
    asset_type: 'CASH' as 'CASH' | 'BTC'
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const setQuickAmount = (amount: number) => {
    setFormData({ ...formData, target_cents: (amount * 100).toString() });
  };

  const setQuickDeadline = (months: number) => {
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + months);
    setFormData({ ...formData, deadline_date: deadline.toISOString().split('T')[0] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        title: "Error creating goal",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Goal created! 🎉",
        description: `${formData.emoji} ${formData.title} is ready to track!`,
      });
      
      setFormData({
        title: '',
        emoji: '🎯',
        target_cents: '',
        deadline_date: '',
        asset_type: 'CASH'
      });
      onOpenChange(false);
      onSuccess();
    }
    
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
          <DialogDescription>
            Set a savings goal and track your progress
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Name</Label>
            <Input
              id="title"
              placeholder="e.g., Vacation Fund, Emergency Savings"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emoji">Icon</Label>
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
            <div className="space-y-2">
              <Label htmlFor="asset_type">Type</Label>
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
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="target">Target Amount ($)</Label>
            <div className="flex gap-2 mb-2">
              {QUICK_AMOUNTS.map((amount) => (
                <Button
                  key={amount.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setQuickAmount(amount.value)}
                >
                  {amount.label}
                </Button>
              ))}
            </div>
            <Input
              id="target"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter amount..."
              value={formData.target_cents ? (parseInt(formData.target_cents) / 100).toString() : ''}
              onChange={(e) => setFormData({ ...formData, target_cents: e.target.value ? (parseFloat(e.target.value) * 100).toString() : '' })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline (Optional)</Label>
            <div className="flex gap-2 mb-2">
              {QUICK_DEADLINES.map((deadline) => (
                <Button
                  key={deadline.months}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setQuickDeadline(deadline.months)}
                >
                  {deadline.label}
                </Button>
              ))}
            </div>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline_date}
              onChange={(e) => setFormData({ ...formData, deadline_date: e.target.value })}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Goal'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}