import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Fingerprint, Shield, Smartphone, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SettingsPanel = () => {
  const [pushNotifications, setPushNotifications] = useState(false);
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [faceIdSupported, setFaceIdSupported] = useState(false);
  const { toast } = useToast();

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
  }, []);

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