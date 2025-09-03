import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Crown, UserPlus, TrendingUp, Flame, PiggyBank, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ProGate from '@/components/core/ProGate';

interface Group {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
  member_count?: number;
  total_saved?: number;
  group_streak?: number;
}

interface GroupMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

const GroupPods = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadGroups = async () => {
    // Mock groups for now until database is set up
    setGroups([
      {
        id: '1',
        name: 'Family Pod',
        description: 'Saving together as a family',
        owner_id: user?.id || '',
        created_at: new Date().toISOString(),
        member_count: 4,
        total_saved: 50000,
        group_streak: 7
      }
    ]);
  };

  useEffect(() => {
    loadGroups();
  }, [user]);

  const createGroup = async () => {
    if (!user || !newGroupName.trim()) return;

    setIsLoading(true);
    
    // Mock creation for now
    setTimeout(() => {
      toast({
        title: "Pod created! 🎉",
        description: `Welcome to ${newGroupName}! Database setup needed to save permanently.`,
      });

      setNewGroupName('');
      setNewGroupDescription('');
      setIsCreateDialogOpen(false);
      setIsLoading(false);
      loadGroups();
    }, 1000);
  };

  const inviteToGroup = (groupId: string, groupName: string) => {
    // For now, just show a success message
    toast({
      title: "Invite sent! 📨",
      description: `Invitation to join ${groupName} has been sent to your friend.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Family & Friend Pods</h2>
          <p className="text-muted-foreground">Save together, celebrate together, grow together</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <ProGate feature="create_pod" fallback={null}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Pod
              </Button>
            </DialogTrigger>
          </ProGate>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Pod</DialogTitle>
              <DialogDescription>
                Start a savings pod with friends and family. Save together and watch your collective wealth grow!
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="groupName">Pod Name</Label>
                <Input
                  id="groupName"
                  placeholder="Family Savers, College Squad, etc."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="groupDescription">Description (Optional)</Label>
                <Textarea
                  id="groupDescription"
                  placeholder="What's this pod about? Set some goals or motivation..."
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={createGroup} 
                  disabled={isLoading || !newGroupName.trim()}
                  className="flex-1"
                >
                  {isLoading ? 'Creating...' : 'Create Pod'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Groups List */}
      {groups.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No pods yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first pod to start saving with friends and family!
            </p>
            <ProGate feature="create_pod">
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Pod
              </Button>
            </ProGate>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((group) => (
            <Card key={group.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {group.name}
                    {group.owner_id === user?.id && (
                      <Crown className="h-4 w-4 text-warning" />
                    )}
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => inviteToGroup(group.id, group.name)}>
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
                {group.description && (
                  <CardDescription>{group.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {/* Pod Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">{group.member_count}</p>
                    <p className="text-xs text-muted-foreground">Members</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <PiggyBank className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm font-medium">${((group.total_saved || 0) / 100).toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">Total Saved</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Flame className="h-4 w-4 text-warning" />
                    </div>
                    <p className="text-sm font-medium">{group.group_streak}</p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    View Stats
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Target className="mr-2 h-4 w-4" />
                    Challenges
                  </Button>
                </div>

                {/* Pod Activity Preview */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Created {new Date(group.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupPods;