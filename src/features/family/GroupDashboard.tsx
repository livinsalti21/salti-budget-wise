import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Heart, Gift, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import InviteChild from './InviteChild';
import EncourageCard from './EncourageCard';

interface FamilyGroup {
  id: string;
  name: string;
  owner_user_id: string;
  created_at: string;
}

interface GroupMember {
  user_id: string;
  role: 'parent' | 'child';
  joined_at: string;
  profiles: {
    display_name?: string;
    mode: 'standard' | 'educational';
  };
}

interface Encouragement {
  id: string;
  emoji: string;
  note: string;
  created_at: string;
  from_user_id: string;
  to_user_id: string;
}

export default function GroupDashboard() {
  const [groups, setGroups] = useState<FamilyGroup[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [encouragements, setEncouragements] = useState<Encouragement[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<FamilyGroup | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadFamilyData();
    }
  }, [user]);

  const loadFamilyData = async () => {
    try {
      // Load groups where user is a member
      const { data: groupData, error: groupError } = await supabase
        .from('family_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (groupError) throw groupError;
      
      setGroups(groupData || []);
      
      if (groupData && groupData.length > 0) {
        const group = groupData[0];
        setSelectedGroup(group);
        
        // Load members for the first group
        const { data: memberData, error: memberError } = await supabase
          .from('family_group_members')
          .select(`
            user_id,
            role,
            joined_at,
            profiles!inner(display_name, mode)
          `)
          .eq('group_id', group.id);

        if (memberError) throw memberError;
        setMembers((memberData || []) as GroupMember[]);

        // Load encouragements
        const { data: encouragementData, error: encouragementError } = await supabase
          .from('encouragements')
          .select('*')
          .eq('group_id', group.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (encouragementError) throw encouragementError;
        setEncouragements(encouragementData || []);
      }
    } catch (error) {
      console.error('Error loading family data:', error);
      toast({
        title: "Error loading family data",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async () => {
    if (!user) return;

    try {
      const { data: groupData, error: groupError } = await supabase
        .from('family_groups')
        .insert({
          name: 'My Family Group',
          owner_user_id: user.id
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add current user as parent member
      const { error: memberError } = await supabase
        .from('family_group_members')
        .insert({
          group_id: groupData.id,
          user_id: user.id,
          role: 'parent'
        });

      if (memberError) throw memberError;

      toast({
        title: "Family Group Created!",
        description: "You can now invite your children to join.",
      });

      loadFamilyData();
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error creating group",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading family groups...</div>
        </CardContent>
      </Card>
    );
  }

  if (groups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Family Group
          </CardTitle>
          <CardDescription>
            Invite your child to cheer on their habit streaks and celebrate their wins
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Family Group Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a family group to support your child's financial learning journey
            </p>
            <Button onClick={createGroup}>
              <Plus className="h-4 w-4 mr-2" />
              Create Family Group
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const children = members.filter(m => m.role === 'child');
  const isOwner = selectedGroup?.owner_user_id === user?.id;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {selectedGroup?.name}
              </CardTitle>
              <CardDescription>Support your family's financial journey together</CardDescription>
            </div>
            {isOwner && (
              <Badge variant="outline" className="border-primary text-primary">
                <Crown className="h-3 w-3 mr-1" />
                Owner
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Members */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Family Members</h4>
              {isOwner && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowInvite(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Invite Child
                </Button>
              )}
            </div>
            
            <div className="grid gap-3">
              {members.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      member.role === 'parent' ? 'bg-primary/10' : 'bg-accent/10'
                    }`}>
                      {member.role === 'parent' ? '👨‍👩‍👧‍👦' : '👶'}
                    </div>
                    <div>
                      <div className="font-medium">
                        {member.profiles.display_name || 'Family Member'}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {member.role} • {member.profiles.mode} mode
                      </div>
                    </div>
                  </div>
                  <Badge variant={member.role === 'parent' ? 'default' : 'secondary'}>
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Encouragements Section */}
          {children.length > 0 && isOwner && (
            <div className="space-y-3">
              <h4 className="font-medium">Send Encouragement</h4>
              <div className="grid gap-3">
                {children.map((child, index) => (
                  <EncourageCard
                    key={index}
                    childName={child.profiles.display_name || 'Child'}
                    childId={child.user_id}
                    groupId={selectedGroup!.id}
                    onEncouragementSent={loadFamilyData}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recent Encouragements */}
          {encouragements.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Recent Encouragements</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {encouragements.map((encouragement, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-success/10 to-success/5 rounded-lg">
                    <span className="text-2xl">{encouragement.emoji}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">"{encouragement.note}"</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(encouragement.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Heart className="h-4 w-4 text-success" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showInvite && selectedGroup && (
        <InviteChild
          groupId={selectedGroup.id}
          onClose={() => setShowInvite(false)}
          onInviteSent={() => {
            setShowInvite(false);
            loadFamilyData();
          }}
        />
      )}
    </div>
  );
}