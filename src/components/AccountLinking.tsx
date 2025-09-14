import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Building, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LinkedAccount {
  id: string;
  account_id: string;
  institution_name: string;
  account_name: string;
  account_type: string;
  balance_cents: number;
  last_sync: string;
  is_active: boolean;
}

export const AccountLinking: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    if (user) {
      loadLinkedAccounts();
    }
  }, [user]);

  const loadLinkedAccounts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('linked_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const initiatePlaidLink = async () => {
    setLinking(true);
    try {
      // Note: Plaid credentials are now securely handled in backend edge function
      // Frontend no longer has access to sensitive API credentials
      toast({
        title: "Secure Integration",
        description: "Account linking now uses secure backend processing. Use demo account for testing.",
      });

    } catch (error) {
      console.error('Error initiating Plaid link:', error);
      toast({
        title: "Connection Failed",
        description: "Could not initiate bank account linking",
        variant: "destructive",
      });
    } finally {
      setLinking(false);
    }
  };

  const simulateLinkAccount = async () => {
    if (!user) return;

    setLinking(true);
    try {
      // Simulate adding a test account
      const { error } = await supabase
        .from('linked_accounts')
        .insert({
          user_id: user.id,
          account_id: `demo_${Date.now()}`,
          access_token: 'demo_token_placeholder', // Required for backwards compatibility
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
        description: "Successfully linked Demo Bank account",
      });

      await loadLinkedAccounts();
    } catch (error) {
      console.error('Error adding demo account:', error);
      toast({
        title: "Error",
        description: "Could not add demo account",
        variant: "destructive",
      });
    } finally {
      setLinking(false);
    }
  };

  const removeAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('linked_accounts')
        .update({ is_active: false })
        .eq('id', accountId);

      if (error) throw error;

      setAccounts(prev => prev.filter(acc => acc.id !== accountId));
      
      toast({
        title: "Account Removed",
        description: "Bank account has been disconnected",
      });
    } catch (error) {
      console.error('Error removing account:', error);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getAccountTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      depository: 'bg-blue-100 text-blue-800',
      credit: 'bg-orange-100 text-orange-800',
      investment: 'bg-green-100 text-green-800',
      loan: 'bg-red-100 text-red-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Account Linking
              </CardTitle>
              <CardDescription>
                Connect your bank accounts for automatic transaction tracking
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={simulateLinkAccount} disabled={linking} variant="outline">
                Add Demo Account
              </Button>
              <Button onClick={initiatePlaidLink} disabled={linking}>
                {linking ? 'Connecting...' : 'Link Account'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {accounts.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Accounts Connected</h3>
            <p className="text-muted-foreground mb-4">
              Link your bank accounts to automatically track spending and optimize your budget
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={simulateLinkAccount} disabled={linking} variant="outline">
                Add Demo Account
              </Button>
              <Button onClick={initiatePlaidLink} disabled={linking}>
                Connect Real Account
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{account.account_name}</h3>
                    <p className="text-sm text-muted-foreground">{account.institution_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className={getAccountTypeColor(account.account_type)}>
                        {account.account_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Last sync: {new Date(account.last_sync).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(account.balance_cents)}
                  </p>
                  <div className="flex gap-1 mt-2">
                    <Button size="sm" variant="outline">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => removeAccount(account.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AccountLinking;