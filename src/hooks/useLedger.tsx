import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// PHASE 2: Enhanced ledger entry with detailed sources
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
  // PHASE 2: Additional fields from user_ledger_detailed view
  sponsor_name?: string;
  original_save_amount_cents?: number;
  has_friend_match?: boolean;
  friend_match_name?: string;
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
      // PHASE 2: Use user_ledger_detailed view for enhanced transaction sources
      const { data, error } = await supabase
        .from('user_ledger_detailed')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      setLedgerHistory((data || []) as LedgerEntry[]);
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

  // PHASE 2: Enhanced transaction description with sources
  const getTransactionDescription = (entry: LedgerEntry): string => {
    if (entry.description) return entry.description;
    
    switch (entry.transaction_type) {
      case 'SAVE':
        if (entry.has_friend_match && entry.friend_match_name) {
          return `Matched save with ${entry.friend_match_name}`;
        }
        return 'Your Save';
      case 'MATCH_RECEIVED':
        if (entry.sponsor_name) {
          return `Sponsor Match from ${entry.sponsor_name}`;
        }
        return 'Sponsor Match';
      case 'ADJUSTMENT':
        return 'Account Adjustment';
      default:
        return 'Transaction';
    }
  };

  // PHASE 2: Get transaction icon
  const getTransactionIcon = (entry: LedgerEntry): string => {
    switch (entry.transaction_type) {
      case 'SAVE':
        return entry.has_friend_match ? '🤝' : '💰';
      case 'MATCH_RECEIVED':
        return '🎁';
      case 'ADJUSTMENT':
        return '⚙️';
      default:
        return '📝';
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
    getTransactionDescription,
    getTransactionIcon // PHASE 2: Export new helper
  };
};