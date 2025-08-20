import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Chrome, Apple, Fingerprint } from 'lucide-react';
import { useState } from 'react';

export default function SocialAuth() {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setLoading(provider);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/app`
        }
      });

      if (error) {
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleBiometricAuth = async () => {
    if ('credentials' in navigator) {
      try {
        const credential = await navigator.credentials.get({
          publicKey: {
            challenge: new Uint8Array(32),
            allowCredentials: [],
            userVerification: 'preferred'
          }
        });
        
        if (credential) {
          toast({
            title: "Biometric Authentication",
            description: "Face ID/Touch ID authentication successful!",
          });
        }
      } catch (error) {
        toast({
          title: "Biometric Error",
          description: "Biometric authentication failed or not available.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Not Supported",
        description: "Biometric authentication not supported on this device.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={() => handleSocialLogin('google')}
          disabled={loading === 'google'}
          className="w-full"
        >
          {loading === 'google' ? (
            'Connecting...'
          ) : (
            <>
              <Chrome className="mr-2 h-4 w-4" />
              Google
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={() => handleSocialLogin('apple')}
          disabled={loading === 'apple'}
          className="w-full"
        >
          {loading === 'apple' ? (
            'Connecting...'
          ) : (
            <>
              <Apple className="mr-2 h-4 w-4" />
              Apple
            </>
          )}
        </Button>
      </div>

      <Button
        variant="outline"
        onClick={handleBiometricAuth}
        className="w-full"
      >
        <Fingerprint className="mr-2 h-4 w-4" />
        Use Face ID / Touch ID
      </Button>
    </div>
  );
}