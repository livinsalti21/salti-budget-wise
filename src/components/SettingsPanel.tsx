import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Bell, Fingerprint, Shield, Smartphone, CheckCircle, XCircle, TrendingUp, Percent } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const SettingsPanel = () => {
  const [pushNotifications, setPushNotifications] = useState(false);
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [faceIdSupported, setFaceIdSupported] = useState(false);
  const [projectionRate, setProjectionRate] = useState(7);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Check if push notifications are supported
    setPushSupported('Notification' in window && 'serviceWorker' in navigator);
    
    // Check if Face ID/biometric authentication is supported
    setFaceIdSupported('credentials' in navigator && 'PublicKeyCredential' in window);
    
    // Load saved preferences
    const savedPushPref = localStorage.getItem('pushNotifications');
    const savedFaceIdPref = localStorage.getItem('faceIdEnabled');
    
    setPushNotifications(savedPushPref === 'true');
    setFaceIdEnabled(savedFaceIdPref === 'true');

    // Load user settings
    if (user) {
      loadUserSettings();
    }
  }, [user]);

  const loadUserSettings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_settings')
      .select('projection_rate_percent')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setProjectionRate(Number(data.projection_rate_percent));
    } else if (error && error.code === 'PGRST116') {
      // Create default settings if none exist
      await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          projection_rate_percent: 7
        });
    }
  };

  const handlePushNotificationToggle = async (enabled: boolean) => {
    if (!pushSupported) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported on this device.",
        variant: "destructive"
      });
      return;
    }

    if (enabled) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setPushNotifications(true);
          localStorage.setItem('pushNotifications', 'true');
          toast({
            title: "Push Notifications Enabled",
            description: "You'll now receive notifications about your savings goals and achievements."
          });
        } else {
          toast({
            title: "Permission Denied",
            description: "Please enable notifications in your browser settings.",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to enable push notifications.",
          variant: "destructive"
        });
      }
    } else {
      setPushNotifications(false);
      localStorage.setItem('pushNotifications', 'false');
      toast({
        title: "Push Notifications Disabled",
        description: "You won't receive push notifications anymore."
      });
    }
  };

  const handleFaceIdToggle = async (enabled: boolean) => {
    if (!faceIdSupported) {
      toast({
        title: "Not Supported",
        description: "Biometric authentication is not supported on this device.",
        variant: "destructive"
      });
      return;
    }

    if (enabled) {
      try {
        // Create a new credential for Face ID/Touch ID
        const credential = await navigator.credentials.create({
          publicKey: {
            challenge: new Uint8Array(32),
            rp: {
              name: "Livin Salti",
              id: window.location.hostname,
            },
            user: {
              id: new Uint8Array(16),
              name: "user@livinsalti.com",
              displayName: "Livin Salti User",
            },
            pubKeyCredParams: [{alg: -7, type: "public-key"}],
            authenticatorSelection: {
              authenticatorAttachment: "platform",
              userVerification: "required"
            },
            timeout: 60000,
            attestation: "direct"
          }
        });

        if (credential) {
          setFaceIdEnabled(true);
          localStorage.setItem('faceIdEnabled', 'true');
          toast({
            title: "Face ID Enabled",
            description: "You can now use biometric authentication to log in."
          });
        }
      } catch (error) {
        toast({
          title: "Setup Failed",
          description: "Could not set up biometric authentication. Make sure your device supports it.",
          variant: "destructive"
        });
      }
    } else {
      setFaceIdEnabled(false);
      localStorage.setItem('faceIdEnabled', 'false');
      toast({
        title: "Face ID Disabled",
        description: "Biometric authentication has been turned off."
      });
    }
  };

  const handleProjectionRateChange = async (value: string) => {
    const rate = parseFloat(value);
    if (isNaN(rate) || rate < 0 || rate > 50) return;

    setProjectionRate(rate);
    
    if (!user) return;

    setIsLoading(true);

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        projection_rate_percent: rate
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save projection rate",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Settings Updated",
        description: `Projection rate set to ${rate}% annually`
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage your app preferences and security settings</p>
      </div>

      <div className="grid gap-6">
        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Authentication
            </CardTitle>
            <CardDescription>
              Secure your account with biometric authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Fingerprint className="h-4 w-4" />
                  Face ID / Touch ID
                </Label>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  {faceIdSupported ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Available on this device
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      Not supported on this device
                    </>
                  )}
                </div>
              </div>
              <Switch
                checked={faceIdEnabled}
                onCheckedChange={handleFaceIdToggle}
                disabled={!faceIdSupported}
              />
            </div>
          </CardContent>
        </Card>

        {/* Projection Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Projection Settings
            </CardTitle>
            <CardDescription>
              Customize your future value calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-medium flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Annual Return Rate
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  value={projectionRate}
                  onChange={(e) => handleProjectionRateChange(e.target.value)}
                  className="w-24"
                  disabled={isLoading}
                />
                <span className="text-sm text-muted-foreground">% per year</span>
              </div>
              <p className="text-sm text-muted-foreground">
                This rate is used to calculate future value projections for all your saves. 
                Typical ranges: Conservative (3-5%), Moderate (6-8%), Aggressive (9-12%)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Stay updated on your savings progress and achievements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Push Notifications
                </Label>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  {pushSupported ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Available on this device
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      Not supported on this browser
                    </>
                  )}
                </div>
              </div>
              <Switch
                checked={pushNotifications}
                onCheckedChange={handlePushNotificationToggle}
                disabled={!pushSupported}
              />
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardHeader>
            <CardTitle>About Livin Salti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Build</span>
              <span>2024.01</span>
            </div>
            <div className="pt-2">
              <Button variant="outline" className="w-full">
                Privacy Policy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPanel;