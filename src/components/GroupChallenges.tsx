import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Plus, Crown, Trophy, Calendar, Target, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Group {
  id: string;
  title: string;
  code: string;
  owner_id: string;
  start_at: string;
  end_at: string;
  max_members: number;
  created_at: string;
  member_count?: number;
  is_owner?: boolean;
  has_joined?: boolean;
}

interface LeaderboardEntry {
  user_id: string;
  total_saved: number;
  save_count: number;
  rank: number;
}

const GroupChallenges = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    duration_days: '14'
  });
  const [joinCode, setJoinCode] = useState('');
  
  const { user } = useAuth();
  const { toast } = useToast();

  const loadGroups = async () => {
    if (!user) return;

    // Get groups the user is a member of or owns
    const { data: membershipData, error: membershipError } = await supabase
      .from('group_members')
      .select(`
        group_id,
        groups (*)
      `)
      .eq('user_id', user.id);

    if (membershipError) {
      console.error('Error loading groups:', membershipError);
      return;
    }

    const userGroups = (membershipData || []).map(item => ({
      ...item.groups,
      has_joined: true,
      is_owner: item.groups.owner_id === user.id
    })) as Group[];

    // Get member counts for each group
    for (const group of userGroups) {
      const { count } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group.id);
      
      group.member_count = count || 0;
    }

    setGroups(userGroups);
  };

  const loadLeaderboard = async (groupId: string) => {
    if (!user || !groupId) return;

    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    // Get all group members
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId);

    if (membersError) {
      console.error('Error loading members:', membersError);
      return;
    }

    if (!members || members.length === 0) {
      setLeaderboard([]);
      return;
    }

    // Get saves for all members within the challenge period
    const { data: saves, error: savesError } = await supabase
      .from('save_events')
      .select('user_id, amount_cents')
      .in('user_id', members.map(m => m.user_id))
      .gte('created_at', group.start_at)
      .lte('created_at', group.end_at);

    if (savesError) {
      console.error('Error loading saves:', savesError);
      return;
    }

    // Calculate leaderboard
    const userStats = new Map<string, { total_saved: number; save_count: number }>();
    
    members.forEach(member => {
      userStats.set(member.user_id, { total_saved: 0, save_count: 0 });
    });

    (saves || []).forEach(save => {
      const stats = userStats.get(save.user_id);
      if (stats) {
        stats.total_saved += save.amount_cents;
        stats.save_count += 1;
      }
    });

    const leaderboardData: LeaderboardEntry[] = Array.from(userStats.entries())
      .map(([user_id, stats]) => ({
        user_id,
        total_saved: stats.total_saved,
        save_count: stats.save_count,
        rank: 0
      }))
      .sort((a, b) => b.total_saved - a.total_saved)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    setLeaderboard(leaderboardData);
  };

  useEffect(() => {
    loadGroups();
  }, [user]);

  useEffect(() => {
    if (selectedGroup) {
      loadLeaderboard(selectedGroup.id);
    }
  }, [selectedGroup, groups]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + parseInt(formData.duration_days));

    // Generate unique code
    const { data: codeData, error: codeError } = await supabase
      .rpc('generate_group_code');

    if (codeError) {
      toast({
        title: "Error generating code",
        description: codeError.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Create group
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .insert({
        title: formData.title,
        code: codeData,
        owner_id: user.id,
        start_at: startDate.toISOString(),
        end_at: endDate.toISOString(),
      })
      .select()
      .single();

    if (groupError) {
      toast({
        title: "Error creating group",
        description: groupError.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Join own group
    const { error: joinError } = await supabase
      .from('group_members')
      .insert({
        group_id: groupData.id,
        user_id: user.id,
      });

    if (joinError) {
      console.error('Error joining own group:', joinError);
    }

    toast({
      title: "Challenge created! 🎉",
      description: `Share code ${codeData} with friends to join`,
    });
    
    setFormData({ title: '', duration_days: '14' });
    setShowCreateDialog(false);
    loadGroups();
    setIsLoading(false);
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !joinCode.trim()) return;
    
    setIsLoading(true);

    // Find group by code
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('code', joinCode.trim().toUpperCase())
      .single();

    if (groupError) {
      toast({
        title: "Group not found",
        description: "Please check the code and try again",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupData.id)
      .eq('user_id', user.id)
      .single();

    if (existingMember) {
      toast({
        title: "Already joined",
        description: "You're already a member of this challenge",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Join group
    const { error: joinError } = await supabase
      .from('group_members')
      .insert({
        group_id: groupData.id,
        user_id: user.id,
      });

    if (joinError) {
      toast({
        title: "Error joining group",
        description: joinError.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Joined challenge! 🎊",
        description: `Welcome to ${groupData.title}`,
      });
      
      setJoinCode('');
      setShowJoinDialog(false);
      loadGroups();
    }
    
    setIsLoading(false);
  };

  const copyGroupCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast({
        title: "Code copied! 📋",
        description: "Share this code with friends to invite them",
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const isActive = (group: Group) => {
    const now = new Date();
    const start = new Date(group.start_at);
    const end = new Date(group.end_at);
    return now >= start && now <= end;
  };

  const formatAmount = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Group Challenges</h2>
          <p className="text-muted-foreground">Save together, win together</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Join Challenge
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join Challenge</DialogTitle>
                <DialogDescription>
                  Enter the challenge code to join a group
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleJoinGroup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="join_code">Challenge Code</Label>
                  <Input
                    id="join_code"
                    placeholder="ABC123"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="text-center font-mono text-lg"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? 'Joining...' : 'Join Challenge'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowJoinDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Challenge
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Challenge</DialogTitle>
                <DialogDescription>
                  Start a saving challenge and invite friends
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Challenge Name</Label>
                  <Input
                    id="title"
                    placeholder="Spring Break Savings Challenge"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (Days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="7"
                    max="90"
                    value={formData.duration_days}
                    onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Challenge'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Groups List */}
      {groups.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No challenges yet</h3>
          <p className="text-muted-foreground mb-4">
            Create or join a challenge to start saving with friends
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Challenge
            </Button>
            <Button variant="outline" onClick={() => setShowJoinDialog(true)}>
              <Users className="mr-2 h-4 w-4" />
              Join Challenge
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Groups Grid */}
          <div className="space-y-4">
            {groups.map((group) => {
              const daysLeft = getDaysRemaining(group.end_at);
              const active = isActive(group);
              
              return (
                <Card 
                  key={group.id} 
                  className={`cursor-pointer transition-all ${
                    selectedGroup?.id === group.id ? 'border-primary' : ''
                  } ${active ? 'border-success/20 bg-success/5' : ''}`}
                  onClick={() => setSelectedGroup(group)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          {group.title}
                          {group.is_owner && <Crown className="h-4 w-4 text-yellow-500" />}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {group.member_count} members
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={active ? 'default' : 'secondary'}>
                          {active ? `${daysLeft} days left` : 'Ended'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyGroupCode(group.code);
                        }}
                      >
                        {copiedCode === group.code ? (
                          <Check className="mr-1 h-3 w-3" />
                        ) : (
                          <Copy className="mr-1 h-3 w-3" />
                        )}
                        {group.code}
                      </Button>
                      
                      <span className="text-xs text-muted-foreground">
                        {new Date(group.start_at).toLocaleDateString()} - {new Date(group.end_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Leaderboard */}
          {selectedGroup && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  {selectedGroup.title} Leaderboard
                </CardTitle>
                <CardDescription>
                  Challenge progress and rankings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leaderboard.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No saves yet in this challenge</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((entry, index) => (
                      <div 
                        key={entry.user_id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          entry.user_id === user?.id 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'bg-secondary/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-600 text-white' :
                            'bg-secondary text-secondary-foreground'
                          }`}>
                            {entry.rank}
                          </div>
                          <div>
                            <p className="font-medium">
                              {entry.user_id === user?.id ? 'You' : `User ${entry.rank}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {entry.save_count} saves
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-success">
                            ${formatAmount(entry.total_saved)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupChallenges;