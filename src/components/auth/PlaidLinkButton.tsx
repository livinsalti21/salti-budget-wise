import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { CreditCard } from 'lucide-react';

interface PlaidLinkButtonProps {
  onSuccess?: () => void;
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
}

export default function PlaidLinkButton({ onSuccess, variant = 'default', className }: PlaidLinkButtonProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePlaidLink = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to link your bank account.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create link token via Supabase edge function
      const { data, error } = await supabase.functions.invoke('create-link-token', {
        body: { user_id: user.id }
      });

      if (error) throw error;

      const { link_token } = data;

      // Dynamically import Plaid Link (only when needed)
      try {
        const PlaidModule = await import('react-plaid-link');
        const { usePlaidLink } = PlaidModule;
        
        // For now, show configuration needed message
        toast({
          title: "OAuth Configuration Needed",
          description: "Plaid Link requires OAuth setup in Supabase Dashboard. Using demo account for now.",
        });
      } catch (importError) {
        console.log('Plaid Link not available, using demo account');
        toast({
          title: "Demo Mode",
          description: "Plaid integration not configured. Creating demo account instead.",
        });
      }

      // Fallback to demo account creation
      await createDemoAccount();

    } catch (error: any) {
      console.error('Plaid link error:', error);
      toast({
        title: "Connection Error",
        description: error.message || "Failed to initialize bank account linking",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDemoAccount = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('linked_accounts')
        .insert({
          user_id: user.id,
          account_id: `demo_${Date.now()}`,
          access_token: 'demo_token_placeholder', // Required field for backwards compatibility
          encrypted_access_token: btoa('demo_encrypted_token'),
          token_iv: btoa('demo_iv'),
          institution_name: 'Demo Bank',
          account_name: 'Demo Checking',
          account_type: 'depository',
          balance_cents: 250000, // $2,500
          last_sync: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Demo Account Added",
        description: "Successfully created demo bank account",
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Demo account error:', error);
      toast({
        title: "Error",
        description: "Failed to create demo account",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={handlePlaidLink}
      disabled={loading}
      variant={variant}
      className={className}
    >
      {loading ? (
        'Connecting...'
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Link Bank Account
        </>
      )}
    </Button>
  );
}