import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

interface ErrorStats {
  totalErrors: number;
  criticalErrors: number;
  status: 'healthy' | 'warning' | 'critical';
}

export const ErrorStatusWidget = () => {
  const [stats, setStats] = useState<ErrorStats>({
    totalErrors: 0,
    criticalErrors: 0,
    status: 'healthy'
  });
  const [loading, setLoading] = useState(true);

  const loadErrorStats = async () => {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('security_audit_log')
        .select('severity, event_type')
        .gte('created_at', oneHourAgo)
        .eq('event_type', 'edge_function_call');

      if (error) throw error;

      const totalErrors = data?.filter(d => d.severity === 'error').length || 0;
      const criticalErrors = data?.filter(d => d.severity === 'critical').length || 0;

      // Determine status based on thresholds
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (criticalErrors > 0 || totalErrors > 50) {
        status = 'critical';
      } else if (totalErrors > 10) {
        status = 'warning';
      }

      setStats({
        totalErrors,
        criticalErrors,
        status
      });
    } catch (error) {
      console.error('Error loading error stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadErrorStats();

    // Set up real-time subscription
    const channel = supabase
      .channel('error-monitoring')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_audit_log',
          filter: 'event_type=eq.edge_function_call'
        },
        () => {
          loadErrorStats();
        }
      )
      .subscribe();

    // Refresh every 30 seconds as backup
    const interval = setInterval(loadErrorStats, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const getStatusConfig = () => {
    switch (stats.status) {
      case 'healthy':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          label: 'Healthy',
          badgeVariant: 'default' as const
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          label: 'Warning',
          badgeVariant: 'secondary' as const
        };
      case 'critical':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          label: 'Critical',
          badgeVariant: 'destructive' as const
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Link to="/monitoring">
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${statusConfig.bgColor}`}>
                <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalErrors}</div>
                <div className="text-xs text-muted-foreground">Errors (Last Hour)</div>
              </div>
            </div>
            <Badge variant={statusConfig.badgeVariant}>
              {statusConfig.label}
            </Badge>
          </div>
          
          {stats.criticalErrors > 0 && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center gap-2 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span>{stats.criticalErrors} critical error{stats.criticalErrors !== 1 ? 's' : ''}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};
