import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, AlertCircle, Clock, Database } from 'lucide-react';
import { useProfileSync } from '@/hooks/useProfileSync';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';

export const ProfileDataStatus = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { syncStatus, forceProfileSync, checkProfileIntegrity } = useProfileSync();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    // Check profile integrity on mount
    checkProfileIntegrity();
    setLastChecked(new Date());
  }, [checkProfileIntegrity]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await forceProfileSync();
      setLastChecked(new Date());
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!user || !profile) return null;

  const getStatusIcon = () => {
    if (syncStatus.syncError) return <AlertCircle className="h-4 w-4 text-destructive" />;
    if (!syncStatus.isSync) return <RefreshCw className="h-4 w-4 text-warning animate-spin" />;
    return <CheckCircle className="h-4 w-4 text-success" />;
  };

  const getStatusText = () => {
    if (syncStatus.syncError) return 'Sync Error';
    if (!syncStatus.isSync) return 'Syncing...';
    return 'Up to Date';
  };

  const getStatusVariant = () => {
    if (syncStatus.syncError) return 'destructive' as const;
    if (!syncStatus.isSync) return 'secondary' as const;
    return 'default' as const;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Profile Data Status
        </CardTitle>
        <CardDescription>
          Monitor your save data synchronization and integrity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sync Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">Data Sync</span>
          </div>
          <Badge variant={getStatusVariant()}>
            {getStatusText()}
          </Badge>
        </div>

        {/* Error Details */}
        {syncStatus.syncError && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{syncStatus.syncError}</p>
          </div>
        )}

        {/* Last Sync Time */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Last Updated</span>
          </div>
          <span>
            {syncStatus.lastSyncAt 
              ? syncStatus.lastSyncAt.toLocaleString()
              : profile.updated_at 
                ? new Date(profile.updated_at).toLocaleString()
                : 'Unknown'
            }
          </span>
        </div>

        {/* Data Summary */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-semibold">{profile.total_saves_count || 0}</div>
            <div className="text-xs text-muted-foreground">Total Saves</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{profile.current_streak_days || 0}</div>
            <div className="text-xs text-muted-foreground">Current Streak</div>
          </div>
        </div>

        {/* Manual Refresh */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-full"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>

        {/* Last Checked */}
        {lastChecked && (
          <p className="text-xs text-muted-foreground text-center">
            Last checked: {lastChecked.toLocaleTimeString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};