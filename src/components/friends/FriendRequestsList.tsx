import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FriendRequest {
  id: string;
  user_id: string;
  friend_user_id: string;
  status: string;
  created_at: string;
  profiles: {
    display_name: string | null;
    email: string | null;
  } | null;
}

export default function FriendRequestsList() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadPendingRequests();
    }
  }, [user]);

  const loadPendingRequests = async () => {
    if (!user) return;

    try {
      // Get pending friend connections where current user is the recipient
      const { data: connections, error: connectionsError } = await supabase
        .from('friend_connections')
        .select('id, user_id, friend_user_id, status, created_at')
        .eq('friend_user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (connectionsError) throw connectionsError;

      if (!connections || connections.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      // Get profile info for each requester
      const userIds = connections.map(c => c.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Merge data
      const requestsWithProfiles = connections.map(conn => ({
        ...conn,
        profiles: profiles?.find(p => p.id === conn.user_id) || null
      }));

      setRequests(requestsWithProfiles);
    } catch (error) {
      console.error('Error loading friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    setProcessingId(requestId);

    try {
      const { error } = await supabase
        .from('friend_connections')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "🎉 Friend Request Accepted!",
        description: "You can now save and build streaks together",
      });

      // Remove from list
      setRequests(requests.filter(r => r.id !== requestId));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept friend request",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (requestId: string) => {
    setProcessingId(requestId);

    try {
      const { error } = await supabase
        .from('friend_connections')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Request Declined",
        description: "Friend request has been removed",
      });

      // Remove from list
      setRequests(requests.filter(r => r.id !== requestId));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decline friend request",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="h-32 animate-pulse" />
      </Card>
    );
  }

  if (requests.length === 0) {
    return null; // Don't show anything if no pending requests
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Friend Requests
          </CardTitle>
          <Badge variant="default">{requests.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
          >
            <div className="flex-1">
              <p className="font-medium text-sm">
                {request.profiles?.display_name || request.profiles?.email || 'Unknown User'}
              </p>
              <p className="text-xs text-muted-foreground">
                Wants to be your saving buddy
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleAccept(request.id)}
                disabled={processingId === request.id}
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDecline(request.id)}
                disabled={processingId === request.id}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
