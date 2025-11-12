import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ErrorMetrics {
  totalCalls: number;
  errorCount: number;
  criticalCount: number;
  errorRate: number;
}

const ERROR_RATE_THRESHOLD = 0.10; // 10%
const CHECK_INTERVAL = 60000; // Check every 60 seconds
const COOLDOWN_PERIOD = 300000; // 5 minutes cooldown between alerts

export const ErrorAlertMonitor = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const lastAlertTime = useRef<{ [key: string]: number }>({});
  const [isMonitoring, setIsMonitoring] = useState(false);

  const checkErrorMetrics = async () => {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('security_audit_log')
        .select('severity, event_type, event_details')
        .gte('created_at', oneHourAgo)
        .eq('event_type', 'edge_function_call');

      if (error) throw error;

      if (!data || data.length === 0) return;

      // Group by function name
      const functionMetrics: { [key: string]: ErrorMetrics } = {};

      data.forEach(entry => {
        const eventDetails = entry.event_details as any;
        const funcName = eventDetails?.function_name || 'unknown';
        
        if (!functionMetrics[funcName]) {
          functionMetrics[funcName] = {
            totalCalls: 0,
            errorCount: 0,
            criticalCount: 0,
            errorRate: 0
          };
        }

        functionMetrics[funcName].totalCalls++;
        
        if (entry.severity === 'error') {
          functionMetrics[funcName].errorCount++;
        }
        if (entry.severity === 'critical') {
          functionMetrics[funcName].criticalCount++;
          functionMetrics[funcName].errorCount++;
        }
      });

      // Calculate error rates and check thresholds
      const now = Date.now();
      Object.entries(functionMetrics).forEach(([funcName, metrics]) => {
        metrics.errorRate = metrics.totalCalls > 0 
          ? metrics.errorCount / metrics.totalCalls 
          : 0;

        // Check critical errors (immediate alert, shorter cooldown)
        if (metrics.criticalCount > 0) {
          const alertKey = `critical_${funcName}`;
          const lastAlert = lastAlertTime.current[alertKey] || 0;
          
          if (now - lastAlert > COOLDOWN_PERIOD) {
            lastAlertTime.current[alertKey] = now;
            showCriticalErrorAlert(funcName, metrics.criticalCount);
          }
        }
        // Check error rate threshold
        else if (metrics.errorRate > ERROR_RATE_THRESHOLD && metrics.totalCalls >= 10) {
          const alertKey = `rate_${funcName}`;
          const lastAlert = lastAlertTime.current[alertKey] || 0;
          
          if (now - lastAlert > COOLDOWN_PERIOD) {
            lastAlertTime.current[alertKey] = now;
            showErrorRateAlert(funcName, metrics.errorRate, metrics.errorCount);
          }
        }
      });

    } catch (error) {
      console.error('Error checking metrics:', error);
    }
  };

  const showCriticalErrorAlert = (functionName: string, count: number) => {
    toast({
      variant: "destructive",
      title: "🚨 Critical Error Detected",
      description: (
        <div className="space-y-2">
          <p>
            {count} critical error{count !== 1 ? 's' : ''} in <strong>{functionName}</strong>
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => navigate('/monitoring')}
          >
            View Monitoring Dashboard →
          </Button>
        </div>
      ),
      duration: 10000,
    });
  };

  const showErrorRateAlert = (functionName: string, errorRate: number, errorCount: number) => {
    toast({
      variant: "destructive",
      title: "⚠️ High Error Rate Alert",
      description: (
        <div className="space-y-2">
          <p>
            <strong>{functionName}</strong> has {(errorRate * 100).toFixed(1)}% error rate
            ({errorCount} errors)
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => navigate('/monitoring')}
          >
            View Monitoring Dashboard →
          </Button>
        </div>
      ),
      duration: 10000,
    });
  };

  useEffect(() => {
    // Initial check
    checkErrorMetrics();
    setIsMonitoring(true);

    // Set up periodic checks
    const interval = setInterval(checkErrorMetrics, CHECK_INTERVAL);

    // Set up real-time subscription for immediate critical error alerts
    const channel = supabase
      .channel('error-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_audit_log',
          filter: 'event_type=eq.edge_function_call'
        },
        (payload) => {
          const newEntry = payload.new as any;
          
          // Immediate alert for critical errors
          if (newEntry.severity === 'critical') {
            const eventDetails = newEntry.event_details || {};
            const funcName = eventDetails.function_name || 'unknown';
            const alertKey = `critical_${funcName}`;
            const now = Date.now();
            const lastAlert = lastAlertTime.current[alertKey] || 0;
            
            // Shorter cooldown for real-time critical alerts (1 minute)
            if (now - lastAlert > 60000) {
              lastAlertTime.current[alertKey] = now;
              showCriticalErrorAlert(funcName, 1);
            }
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
      setIsMonitoring(false);
    };
  }, []);

  // This component doesn't render anything visible
  return null;
};
