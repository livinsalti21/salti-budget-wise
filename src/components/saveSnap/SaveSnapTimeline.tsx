import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, TrendingUp, Loader2 } from 'lucide-react';
import SaveSnapCard from './SaveSnapCard';
import { toast } from 'sonner';

interface SaveSnap {
  id: string;
  amount_cents: number;
  ai_caption: string | null;
  photo_url: string | null;
  created_at: string;
  reason: string | null;
  future_value_cents: number | null;
}

export default function SaveSnapTimeline() {
  const { user } = useAuth();
  const [snaps, setSnaps] = useState<SaveSnap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSnaps = async () => {
      try {
        const { data, error } = await supabase
          .from('save_events')
          .select('id, amount_cents, ai_caption, photo_url, created_at, reason, future_value_cents')
          .eq('user_id', user.id)
          .not('photo_url', 'is', null)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        setSnaps(data || []);
      } catch (error) {
        console.error('Error fetching save snaps:', error);
        toast.error('Failed to load save snaps');
      } finally {
        setLoading(false);
      }
    };

    fetchSnaps();

    // Set up real-time subscription
    const channel = supabase
      .channel('save-snaps-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'save_events',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new.photo_url) {
            setSnaps((prev) => [payload.new as SaveSnap, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (snaps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Save Snaps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">No save snaps yet</p>
            <p className="text-sm text-muted-foreground">
              Add photos to your saves to create your visual wealth journey
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalSaved = snaps.reduce((sum, snap) => sum + snap.amount_cents, 0) / 100;
  const totalFutureValue = snaps.reduce(
    (sum, snap) => sum + (snap.future_value_cents || 0),
    0
  ) / 100;

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Save Snaps Total</p>
              <p className="text-3xl font-bold text-primary">
                ${totalSaved.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">40Y Projection</p>
              <div className="flex items-center gap-1 text-success">
                <TrendingUp className="h-4 w-4" />
                <p className="text-2xl font-bold">
                  ${totalFutureValue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Your Save Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {snaps.map((snap) => (
              <SaveSnapCard key={snap.id} {...snap} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
