import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Wifi, Battery, Shield } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useNetworkStatus } from '@/components/ui/offline-support';

interface SystemStatusProps {
  className?: string;
}

export function SystemStatus({ className }: SystemStatusProps) {
  const isOnline = useNetworkStatus();
  const platform = Capacitor.getPlatform();
  const isNative = Capacitor.isNativePlatform();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Platform</span>
          <Badge variant={isNative ? "default" : "secondary"}>
            {platform}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm">Network</span>
          <div className="flex items-center gap-2">
            <Wifi className={`h-4 w-4 ${isOnline ? 'text-success' : 'text-destructive'}`} />
            <Badge variant={isOnline ? "default" : "destructive"}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Data Sync</span>
          <Badge variant={isOnline ? "default" : "secondary"}>
            {isOnline ? 'Active' : 'Queued'}
          </Badge>
        </div>

        {isNative && (
          <div className="flex items-center justify-between">
            <span className="text-sm">Native Features</span>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-success" />
              <Badge variant="default">Enabled</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}