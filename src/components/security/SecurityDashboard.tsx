import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, Activity, Lock, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface SecurityEvent {
  id: string;
  event_type: string;
  event_details: any;
  ip_address: string | null;
  user_agent: string;
  created_at: string;
  user_id?: string;
}

interface SecurityMetrics {
  totalEvents: number;
  failedLogins: number;
  suspiciousActivity: number;
  blockedAttempts: number;
}

export default function SecurityDashboard() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    failedLogins: 0,
    suspiciousActivity: 0,
    blockedAttempts: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    loadSecurityData();
  }, [selectedTimeFrame]);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      const timeFrames = {
        '1h': 1,
        '24h': 24,
        '7d': 24 * 7,
        '30d': 24 * 30
      };

      const hoursAgo = timeFrames[selectedTimeFrame];
      const startTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

      // Load recent security events
      const { data: eventsData, error: eventsError } = await supabase
        .from('security_audit_log')
        .select('*')
        .gte('created_at', startTime)
        .order('created_at', { ascending: false })
        .limit(100);

      if (eventsError) {
        console.error('Error loading security events:', eventsError);
        toast.error('Failed to load security events');
        return;
      }

      setEvents((eventsData || []).map(event => ({
        ...event,
        ip_address: (event.ip_address as string) || 'unknown'
      })));

      // Calculate metrics
      const totalEvents = eventsData?.length || 0;
      const failedLogins = eventsData?.filter(e => 
        e.event_type === 'login_attempt' && (e.event_details as any)?.success === false
      ).length || 0;
      const suspiciousActivity = eventsData?.filter(e => 
        e.event_type.includes('failed') || e.event_type.includes('blocked')
      ).length || 0;
      const blockedAttempts = eventsData?.filter(e => 
        e.event_type.includes('blocked')
      ).length || 0;

      setMetrics({
        totalEvents,
        failedLogins,
        suspiciousActivity,
        blockedAttempts
      });

    } catch (error) {
      console.error('Error loading security data:', error);
      toast.error('Failed to load security dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getEventSeverity = (eventType: string): 'low' | 'medium' | 'high' => {
    if (eventType.includes('failed') || eventType.includes('blocked')) return 'high';
    if (eventType.includes('expired') || eventType.includes('suspicious')) return 'medium';
    return 'low';
  };

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('login') || eventType.includes('auth')) return <Lock className="h-4 w-4" />;
    if (eventType.includes('deep_link')) return <Shield className="h-4 w-4" />;
    if (eventType.includes('rate_limit')) return <AlertTriangle className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'default';
    }
  };

  const formatEventType = (eventType: string) => {
    return eventType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const MetricCard = ({ title, value, icon, description }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 animate-pulse text-primary" />
          <p className="text-muted-foreground">Loading security data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Dashboard</h1>
          <p className="text-muted-foreground">Monitor security events and system health</p>
        </div>
        <div className="flex gap-2">
          {['1h', '24h', '7d', '30d'].map((timeFrame) => (
            <Button
              key={timeFrame}
              variant={selectedTimeFrame === timeFrame ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeFrame(timeFrame as any)}
            >
              {timeFrame}
            </Button>
          ))}
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Events"
          value={metrics.totalEvents}
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          description={`Last ${selectedTimeFrame}`}
        />
        <MetricCard
          title="Failed Logins"
          value={metrics.failedLogins}
          icon={<Lock className="h-4 w-4 text-destructive" />}
          description="Authentication failures"
        />
        <MetricCard
          title="Suspicious Activity"
          value={metrics.suspiciousActivity}
          icon={<AlertTriangle className="h-4 w-4 text-warning" />}
          description="Potential threats detected"
        />
        <MetricCard
          title="Blocked Attempts"
          value={metrics.blockedAttempts}
          icon={<Shield className="h-4 w-4 text-success" />}
          description="Rate limited requests"
        />
      </div>

      {/* Alerts */}
      {metrics.suspiciousActivity > 10 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>High Suspicious Activity Detected</AlertTitle>
          <AlertDescription>
            There have been {metrics.suspiciousActivity} suspicious events in the last {selectedTimeFrame}. 
            Please review the security logs carefully.
          </AlertDescription>
        </Alert>
      )}

      {/* Security Events */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="rate-limit">Rate Limiting</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <EventsList events={events} />
        </TabsContent>

        <TabsContent value="auth" className="space-y-4">
          <EventsList events={events.filter(e => e.event_type.includes('login') || e.event_type.includes('signup'))} />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <EventsList events={events.filter(e => e.event_type.includes('deep_link') || e.event_type.includes('verification'))} />
        </TabsContent>

        <TabsContent value="rate-limit" className="space-y-4">
          <EventsList events={events.filter(e => e.event_type.includes('rate_limit'))} />
        </TabsContent>
      </Tabs>
    </div>
  );

  function EventsList({ events }: { events: SecurityEvent[] }) {
    if (events.length === 0) {
      return (
        <Card>
          <CardContent className="py-8 text-center">
            <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No security events found</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-2">
        {events.map((event) => {
          const severity = getEventSeverity(event.event_type);
          return (
            <Card key={event.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getEventIcon(event.event_type)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatEventType(event.event_type)}</span>
                        <Badge variant={getSeverityColor(severity) as any}>{severity}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {event.ip_address} • {new Date(event.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    {event.event_details && (
                      <pre className="text-xs text-muted-foreground max-w-xs overflow-hidden">
                        {JSON.stringify(event.event_details, null, 2).slice(0, 100)}...
                      </pre>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }
}