import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LedgerEntry {
  id: string;
  user_id: string;
  transaction_type: 'SAVE' | 'MATCH_RECEIVED' | 'ADJUSTMENT';
  amount_cents: number;
  running_balance_cents: number;
  description?: string;
  reference_id?: string;
  future_value_40yr_cents: number;
  created_at: string;
}

interface AccountSummary {
  user_id: string;
  current_balance_cents: number;
  total_inflow_cents: number;
  projected_40yr_value_cents: number;
  last_transaction_at?: string;
}

export const useLedger = () => {
  const { user } = useAuth();
  const [ledgerHistory, setLedgerHistory] = useState<LedgerEntry[]>([]);
  const [accountSummary, setAccountSummary] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const createLedgerEntry = async (
    amountCents: number,
    transactionType: 'SAVE' | 'MATCH_RECEIVED' | 'ADJUSTMENT',
    description?: string,
    referenceId?: string
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('ledger-operations', {
        body: {
          operation: 'create_ledger_entry',
          amount_cents: amountCents,
          transaction_type: transactionType,
          description,
          reference_id: referenceId
        }
      });

      if (error) throw error;

      if (data.success) {
        setAccountSummary(data.account_summary);
        // Refresh ledger history
        await fetchLedgerHistory();
        return data.ledger_entry;
      }
    } catch (error) {
      console.error('Error creating ledger entry:', error);
      toast.error('Failed to create ledger entry');
      return null;
    }
  };

  const fetchLedgerHistory = async (limit = 50, offset = 0) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ledger-operations', {
        body: {
          operation: 'get_ledger_history',
          limit,
          offset
        }
      });

      if (error) throw error;

      if (data.success) {
        setLedgerHistory(data.ledger_history);
      }
    } catch (error) {
      console.error('Error fetching ledger history:', error);
      toast.error('Failed to fetch ledger history');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountSummary = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setAccountSummary(data);
    } catch (error) {
      console.error('Error fetching account summary:', error);
    }
  };

  const formatCurrency = (cents: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getTransactionDescription = (entry: LedgerEntry): string => {
    if (entry.description) return entry.description;
    
    switch (entry.transaction_type) {
      case 'SAVE':
        return 'Wealth Building Save';
      case 'MATCH_RECEIVED':
        return 'Sponsor Match Received';
      case 'ADJUSTMENT':
        return 'Account Adjustment';
      default:
        return 'Transaction';
    }
  };

  useEffect(() => {
    if (user) {
      fetchAccountSummary();
      fetchLedgerHistory();
    }
  }, [user]);

  return {
    ledgerHistory,
    accountSummary,
    loading,
    createLedgerEntry,
    fetchLedgerHistory,
    fetchAccountSummary,
    formatCurrency,
    getTransactionDescription
  };
};