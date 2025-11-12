import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import { EdgeFunctionMetrics } from '@/components/monitoring/EdgeFunctionMetrics';
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/lib/permissions/roleCheck';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MonitoringPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false);
        return;
      }

      const adminStatus = await isAdmin(user.id);
      setHasAccess(adminStatus);
    };

    checkAccess();
  }, [user]);

  if (hasAccess === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader
          title="Access Denied"
          subtitle="You don't have permission to view this page"
        />
        
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="border-destructive/50">
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <ShieldAlert className="h-16 w-16 text-destructive" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Administrator Access Required</h3>
                <p className="text-muted-foreground mb-6">
                  This monitoring dashboard contains sensitive system metrics and is only accessible to administrators.
                </p>
                <Button onClick={() => navigate('/app')}>
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
