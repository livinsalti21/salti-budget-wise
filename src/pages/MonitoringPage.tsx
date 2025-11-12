import PageHeader from '@/components/ui/PageHeader';
import { EdgeFunctionMetrics } from '@/components/monitoring/EdgeFunctionMetrics';

const MonitoringPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="System Monitoring"
        subtitle="Edge function performance, errors, and health metrics"
      />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <EdgeFunctionMetrics />
      </div>
    </div>
  );
};

export default MonitoringPage;
