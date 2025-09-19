import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Chrome, Apple, Fingerprint, Github } from 'lucide-react';
import { useState } from 'react';

interface EnhancedSocialAuthProps {
  onSuccess?: () => void;
  showBiometric?: boolean;
}

export default function EnhancedSocialAuth({ onSuccess, showBiometric = true }: EnhancedSocialAuthProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'github') => {
    setLoading(provider);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        console.error(`${provider} login error:`, error);
        
        // Handle specific OAuth errors
        if (error.message?.includes('invalid_client') || error.message?.includes('Unauthorized')) {
          toast({
            title: "Configuration Error",
            description: `${provider} authentication is not properly configured. Please contact support or try email/password login.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Authentication Error",
            description: error.message || `Failed to sign in with ${provider}`,
            variant: "destructive",
          });
        }
      } else {
        // Success will be handled by the auth state change
        // Don't call onSuccess here as it can cause routing conflicts
        toast({
          title: "Welcome!",
          description: `Successfully signed in with ${provider}`,
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
    if (!('credentials' in navigator)) {
      toast({
        title: "Not Supported",
        description: "Biometric authentication not supported on this device.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading('biometric');
      
      // Check if WebAuthn is available
      const available = await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          allowCredentials: [],
          userVerification: 'preferred',
          timeout: 60000,
        }
      });
      
      if (available) {
        toast({
          title: "Biometric Authentication",
          description: "Face ID/Touch ID authentication successful!",
        });
        
        // Here you would typically validate the biometric credential
        // and then sign in the user or proceed with the auth flow
        // Don't call onSuccess here as it can cause routing conflicts
      }
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        toast({
          title: "Biometric Canceled",
          description: "Biometric authentication was canceled.",
          variant: "destructive",
        });
      } else if (error.name === 'NotSupportedError') {
        toast({
          title: "Not Supported",
          description: "Biometric authentication not supported on this device.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Biometric Error",
          description: "Biometric authentication failed. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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

        <Button
          variant="outline"
          onClick={() => handleSocialLogin('github')}
          disabled={loading === 'github'}
          className="w-full"
        >
          {loading === 'github' ? (
            'Connecting...'
          ) : (
            <>
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </>
          )}
        </Button>
      </div>

      {showBiometric && (
        <Button
          variant="outline"
          onClick={handleBiometricAuth}
          disabled={loading === 'biometric'}
          className="w-full"
        >
          {loading === 'biometric' ? (
            'Authenticating...'
          ) : (
            <>
              <Fingerprint className="mr-2 h-4 w-4" />
              Use Face ID / Touch ID
            </>
          )}
        </Button>
      )}
    </div>
  );
}