import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, Eye, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  id: string;
  event_type: string;
  event_details: any;
  created_at: string;
  user_agent: string;
}

export const SecurityDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [securityScore, setSecurityScore] = useState(0);

  useEffect(() => {
    if (user) {
      loadSecurityEvents();
      calculateSecurityScore();
    }
  }, [user]);

  const loadSecurityEvents = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading security events:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSecurityScore = async () => {
    if (!user) return;

    try {
      // Check various security factors
      let score = 0;

      // Check if user has linked accounts (encrypted)
      const { count: linkedAccounts } = await supabase
        .from('linked_accounts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (linkedAccounts && linkedAccounts > 0) score += 20;

      // Check if user has notification settings configured
      const { count: notificationSettings } = await supabase
        .from('notification_settings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (notificationSettings && notificationSettings > 0) score += 20;

      // Check if user has recent activity (less vulnerable to dormant account attacks)
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: recentActivity } = await supabase
        .from('save_events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', oneWeekAgo);

      if (recentActivity && recentActivity > 0) score += 30;

      // Check if user has profile information
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile?.display_name) score += 15;

      // Check email verification status
      if (user.email_confirmed_at) score += 15;

      setSecurityScore(score);
    } catch (error) {
      console.error('Error calculating security score:', error);
    }
  };

  const getEventTypeColor = (eventType: string) => {
    const colors: Record<string, string> = {
      'account_linked': 'bg-blue-100 text-blue-800',
      'match_processed': 'bg-green-100 text-green-800',
      'login': 'bg-yellow-100 text-yellow-800',
      'failed_login': 'bg-red-100 text-red-800',
      'password_change': 'bg-purple-100 text-purple-800',
    };
    return colors[eventType] || 'bg-gray-100 text-gray-800';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security Dashboard
              </CardTitle>
              <CardDescription>
                Monitor your account security and recent activity
              </CardDescription>
            </div>
            <Button onClick={loadSecurityEvents} disabled={loading} variant="outline">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Security Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getScoreIcon(securityScore)}
            Security Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className={`text-3xl font-bold ${getScoreColor(securityScore)}`}>
              {securityScore}/100
            </span>
            <Badge variant={securityScore >= 80 ? 'default' : securityScore >= 60 ? 'secondary' : 'destructive'}>
              {securityScore >= 80 ? 'Excellent' : securityScore >= 60 ? 'Good' : 'Needs Improvement'}
            </Badge>
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            {securityScore < 100 && (
              <div>
                <p className="font-medium">Improve your security:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {!user?.email_confirmed_at && <li>Verify your email address</li>}
                  {securityScore < 80 && <li>Link a bank account for enhanced verification</li>}
                  {securityScore < 70 && <li>Complete your profile information</li>}
                  {securityScore < 90 && <li>Stay active to maintain account security</li>}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Recent Security Events
          </CardTitle>
          <CardDescription>
            Your recent account activity and security events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Security Events</h3>
              <p className="text-muted-foreground">
                Your security events will appear here once you start using the app.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className={getEventTypeColor(event.event_type)}>
                          {event.event_type.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(event.created_at).toLocaleString()}
                        </span>
                      </div>
                      {event.event_details && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {JSON.stringify(event.event_details, null, 2).length > 100 
                            ? JSON.stringify(event.event_details).substring(0, 100) + '...'
                            : JSON.stringify(event.event_details)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};