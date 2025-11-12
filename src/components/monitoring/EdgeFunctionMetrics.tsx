import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { ErrorLogger } from '@/utils/errorLogger';

interface FunctionMetrics {
  function_name: string;
  total_calls: number;
  error_count: number;
  error_rate: number;
  avg_response_time?: number;
  last_error?: string;
  last_error_time?: string;
}

interface ErrorByLevel {
  level: string;
  count: number;
}

export const EdgeFunctionMetrics = () => {
  const [metrics, setMetrics] = useState<FunctionMetrics[]>([]);
  const [errorsByLevel, setErrorsByLevel] = useState<ErrorByLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');

  useEffect(() => {
    loadMetrics();
  }, [timeRange]);

  const getTimeRangeDate = () => {
    const now = new Date();
    switch (timeRange) {
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000);
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  };

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const startTime = getTimeRangeDate().toISOString();

      // Query edge function logs from security_audit_log
      const { data: logs, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .gte('created_at', startTime)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Aggregate metrics by function name
      const functionMap = new Map<string, {
        total: number;
        errors: number;
        lastError?: string;
        lastErrorTime?: string;
      }>();

      const levelMap = new Map<string, number>();

      logs?.forEach((log) => {
        const eventDetails = log.event_details as Record<string, any> | null;
        const functionName = eventDetails?.function_name || 
                            log.event_type?.replace(/_/g, '-') || 
                            'unknown';
        
        if (!functionMap.has(functionName)) {
          functionMap.set(functionName, { total: 0, errors: 0 });
        }

        const metrics = functionMap.get(functionName)!;
        metrics.total++;

        // Count errors (event_type contains 'error' or 'failed')
        const isError = log.event_type?.includes('error') || 
                       log.event_type?.includes('failed') ||
                       eventDetails?.level === 'error';
        
        if (isError) {
          metrics.errors++;
          if (!metrics.lastError) {
            metrics.lastError = eventDetails?.error || eventDetails?.message || 'Unknown error';
            metrics.lastErrorTime = log.created_at;
          }
        }

        // Count by severity level
        const level = eventDetails?.level || 'info';
        levelMap.set(level, (levelMap.get(level) || 0) + 1);
      });

      // Convert to array and calculate rates
      const metricsArray: FunctionMetrics[] = Array.from(functionMap.entries()).map(
        ([function_name, data]) => ({
          function_name,
          total_calls: data.total,
          error_count: data.errors,
          error_rate: data.total > 0 ? (data.errors / data.total) * 100 : 0,
          last_error: data.lastError,
          last_error_time: data.lastErrorTime,
        })
      ).sort((a, b) => b.total_calls - a.total_calls);

      const levelArray: ErrorByLevel[] = Array.from(levelMap.entries()).map(
        ([level, count]) => ({ level, count })
      ).sort((a, b) => b.count - a.count);

      setMetrics(metricsArray);
      setErrorsByLevel(levelArray);
    } catch (error) {
      ErrorLogger.logError(error, {
        component: 'EdgeFunctionMetrics',
        action: 'load_metrics'
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'destructive';
      case 'warn':
        return 'warning';
      case 'debug':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getErrorRateBadge = (rate: number) => {
    if (rate === 0) return <Badge variant="outline" className="bg-green-50"><CheckCircle className="w-3 h-3 mr-1" />0%</Badge>;
    if (rate < 5) return <Badge variant="secondary">{rate.toFixed(1)}%</Badge>;
    if (rate < 20) return <Badge variant="warning"><AlertCircle className="w-3 h-3 mr-1" />{rate.toFixed(1)}%</Badge>;
    return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />{rate.toFixed(1)}%</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  const totalCalls = metrics.reduce((sum, m) => sum + m.total_calls, 0);
  const totalErrors = metrics.reduce((sum, m) => sum + m.error_count, 0);
  const overallErrorRate = totalCalls > 0 ? (totalErrors / totalCalls) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setTimeRange('1h')}
          className={`px-3 py-1 rounded text-sm ${
            timeRange === '1h' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          Last Hour
        </button>
        <button
          onClick={() => setTimeRange('24h')}
          className={`px-3 py-1 rounded text-sm ${
            timeRange === '24h' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          Last 24 Hours
        </button>
        <button
          onClick={() => setTimeRange('7d')}
          className={`px-3 py-1 rounded text-sm ${
            timeRange === '7d' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          Last 7 Days
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalls.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{totalErrors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallErrorRate.toFixed(2)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Functions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Errors by Severity Level */}
      <Card>
        <CardHeader>
          <CardTitle>Errors by Severity Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {errorsByLevel.map((item) => (
              <Badge key={item.level} variant={getSeverityColor(item.level) as any}>
                {item.level.toUpperCase()}: {item.count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Function Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Edge Function Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Function</th>
                  <th className="text-right p-2 font-medium">Total Calls</th>
                  <th className="text-right p-2 font-medium">Errors</th>
                  <th className="text-right p-2 font-medium">Error Rate</th>
                  <th className="text-left p-2 font-medium">Last Error</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric) => (
                  <tr key={metric.function_name} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {metric.function_name}
                      </code>
                    </td>
                    <td className="text-right p-2">{metric.total_calls.toLocaleString()}</td>
                    <td className="text-right p-2">
                      {metric.error_count > 0 ? (
                        <span className="text-destructive font-medium">{metric.error_count}</span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                    <td className="text-right p-2">{getErrorRateBadge(metric.error_rate)}</td>
                    <td className="p-2">
                      {metric.last_error ? (
                        <div className="text-xs">
                          <div className="text-destructive truncate max-w-xs" title={metric.last_error}>
                            {metric.last_error}
                          </div>
                          <div className="text-muted-foreground">
                            {new Date(metric.last_error_time!).toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">No errors</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
