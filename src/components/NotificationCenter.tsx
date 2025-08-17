import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, DollarSign, Users, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Capacitor imports for mobile push notifications
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

interface NotificationSettings {
  push_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  timezone: string;
  payday_enabled: boolean;
  roundup_enabled: boolean;
  streak_enabled: boolean;
  match_enabled: boolean;
  max_daily_pushes: number;
  max_weekly_pushes: number;
}

export default function NotificationCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<string>('prompt');
  const [pushToken, setPushToken] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSettings();
      checkPushPermissions();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }

      if (data) {
        setSettings(data);
      } else {
        // Create default settings
        const defaultSettings = {
          user_id: user?.id,
          push_enabled: true,
          quiet_hours_start: '21:00:00',
          quiet_hours_end: '08:00:00',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          payday_enabled: true,
          roundup_enabled: true,
          streak_enabled: true,
          match_enabled: true,
          max_daily_pushes: 1,
          max_weekly_pushes: 4
        };

        const { data: newSettings, error: insertError } = await supabase
          .from('notification_settings')
          .insert(defaultSettings)
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
      toast({
        title: "Failed to Load Settings",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkPushPermissions = async () => {
    if (!Capacitor.isNativePlatform()) {
      // Web notifications
      if ('Notification' in window) {
        setPermissionStatus(Notification.permission);
      }
      return;
    }

    try {
      // Check current permission status
      const permission = await PushNotifications.checkPermissions();
      setPermissionStatus(permission.receive);

      if (permission.receive === 'granted') {
        // Get the push token
        const result = await PushNotifications.register();
        console.log('Push registration result:', result);
      }
    } catch (error) {
      console.error('Error checking push permissions:', error);
    }
  };

  const requestPushPermissions = async () => {
    if (!Capacitor.isNativePlatform()) {
      // Web notifications
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setPermissionStatus(permission);
        
        if (permission === 'granted') {
          toast({
            title: "Notifications Enabled! 🎉",
            description: "You'll now receive helpful saving reminders."
          });
        }
      }
      return;
    }

    try {
      const permission = await PushNotifications.requestPermissions();
      setPermissionStatus(permission.receive);

      if (permission.receive === 'granted') {
        await PushNotifications.register();
        
        toast({
          title: "Notifications Enabled! 🎉",
          description: "You'll now receive helpful saving reminders."
        });
      } else {
        toast({
          title: "Notifications Disabled",
          description: "You can enable them later in your device settings.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error requesting push permissions:', error);
      toast({
        title: "Permission Error",
        description: "Failed to request notification permissions.",
        variant: "destructive"
      });
    }
  };

  const updateSetting = async (key: keyof NotificationSettings, value: any) => {
    if (!settings || !user) return;

    try {
      const updatedSettings = { ...settings, [key]: value };
      setSettings(updatedSettings);

      const { error } = await supabase
        .from('notification_settings')
        .update({ [key]: value })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved."
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Update Failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading notification settings...</p>
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>Failed to load notification settings.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Control when and how you receive saving reminders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Permission Status */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <h3 className="font-medium">Push Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Status: <Badge variant={permissionStatus === 'granted' ? 'default' : 'secondary'}>
                  {permissionStatus === 'granted' ? 'Enabled' : 
                   permissionStatus === 'denied' ? 'Disabled' : 'Not Set'}
                </Badge>
              </p>
            </div>
            {permissionStatus !== 'granted' && (
              <Button onClick={requestPushPermissions}>
                Enable Notifications
              </Button>
            )}
          </div>

          {/* Master Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-enabled">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive helpful saving reminders
              </p>
            </div>
            <Switch
              id="push-enabled"
              checked={settings.push_enabled}
              onCheckedChange={(checked) => updateSetting('push_enabled', checked)}
            />
          </div>

          {settings.push_enabled && (
            <>
              {/* Notification Types */}
              <div className="space-y-4">
                <h3 className="font-medium">Notification Types</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <div>
                        <Label>Payday Reminders</Label>
                        <p className="text-xs text-muted-foreground">Get nudged to save when you get paid</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.payday_enabled}
                      onCheckedChange={(checked) => updateSetting('payday_enabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <div>
                        <Label>Round-up Alerts</Label>
                        <p className="text-xs text-muted-foreground">Convert spare change to savings</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.roundup_enabled}
                      onCheckedChange={(checked) => updateSetting('roundup_enabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔥</span>
                      <div>
                        <Label>Streak Protection</Label>
                        <p className="text-xs text-muted-foreground">Don't break your saving streak</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.streak_enabled}
                      onCheckedChange={(checked) => updateSetting('streak_enabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <div>
                        <Label>Match Invites</Label>
                        <p className="text-xs text-muted-foreground">Friends and family match notifications</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.match_enabled}
                      onCheckedChange={(checked) => updateSetting('match_enabled', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Quiet Hours */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">Quiet Hours</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start (Do Not Disturb)</Label>
                    <Select
                      value={settings.quiet_hours_start}
                      onValueChange={(value) => updateSetting('quiet_hours_start', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0');
                          return (
                            <SelectItem key={hour} value={`${hour}:00:00`}>
                              {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i-12}:00 PM`}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>End (Resume)</Label>
                    <Select
                      value={settings.quiet_hours_end}
                      onValueChange={(value) => updateSetting('quiet_hours_end', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0');
                          return (
                            <SelectItem key={hour} value={`${hour}:00:00`}>
                              {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i-12}:00 PM`}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Frequency Limits */}
              <div className="space-y-4">
                <h3 className="font-medium">Frequency Limits</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Max per Day</Label>
                    <Select
                      value={settings.max_daily_pushes.toString()}
                      onValueChange={(value) => updateSetting('max_daily_pushes', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 notification</SelectItem>
                        <SelectItem value="2">2 notifications</SelectItem>
                        <SelectItem value="3">3 notifications</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Max per Week</Label>
                    <Select
                      value={settings.max_weekly_pushes.toString()}
                      onValueChange={(value) => updateSetting('max_weekly_pushes', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 notifications</SelectItem>
                        <SelectItem value="4">4 notifications</SelectItem>
                        <SelectItem value="5">5 notifications</SelectItem>
                        <SelectItem value="7">7 notifications</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}