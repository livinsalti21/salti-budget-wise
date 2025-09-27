import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import SaveHistoryStats from './savehistory/SaveHistoryStats';
import SaveHistoryInsights from './savehistory/SaveHistoryInsights';
import SaveHistoryFilters from './savehistory/SaveHistoryFilters';
import SaveHistoryList from './savehistory/SaveHistoryList';

interface Save {
  id: string;
  amount_cents: number;
  reason: string;
  created_at: string;
  future_value_cents?: number;
  stacklet_id?: string;
}

const SaveHistory = () => {
  const [saves, setSaves] = useState<Save[]>([]);
  const [allSaves, setAllSaves] = useState<Save[]>([]);
  const [filteredSaves, setFilteredSaves] = useState<Save[]>([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [streak, setStreak] = useState(0);
  const [matches, setMatches] = useState(0);
  const [projectionRate, setProjectionRate] = useState(7);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [insights, setInsights] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSaves();
      fetchUserSettings();
      fetchMatches();
      setupRealtimeSubscription();
    }
  }, [user]);

  useEffect(() => {
    filterSaves();
  }, [allSaves, searchTerm, filterPeriod, filterCategory]);

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel('save-events-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'save_events',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newSave = {
            id: payload.new.id,
            amount_cents: payload.new.amount_cents,
            reason: payload.new.reason || payload.new.note || 'Manual Save',
            created_at: payload.new.created_at,
            future_value_cents: payload.new.future_value_cents,
            stacklet_id: payload.new.stacklet_id
          };
          
          setSaves(prev => [newSave, ...prev.slice(0, 9)]);
          setAllSaves(prev => [newSave, ...prev]);
          setTotalSaved(prev => prev + payload.new.amount_cents);
          setTotalSessions(prev => prev + 1);
          
          toast.success(`New save added: $${(payload.new.amount_cents / 100).toFixed(2)}! 🎉`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchSaves = async () => {
    if (!user) return;

    // Fetch recent saves for display
    const { data: recentSaves } = await supabase
      .from('save_events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch all saves for totals
    const { data: allSavesData } = await supabase
      .from('save_events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (recentSaves) {
      setSaves(recentSaves.map(save => ({
        id: save.id,
        amount_cents: save.amount_cents,
        reason: save.reason || save.note || 'Manual Save',
        created_at: save.created_at,
        future_value_cents: save.future_value_cents,
        stacklet_id: save.stacklet_id
      })));
    }

    if (allSavesData) {
      const allSavesFormatted = allSavesData.map(save => ({
        id: save.id,
        amount_cents: save.amount_cents,
        reason: save.reason || save.note || 'Manual Save',
        created_at: save.created_at,
        future_value_cents: save.future_value_cents,
        stacklet_id: save.stacklet_id
      }));
      
      setAllSaves(allSavesFormatted);
      const total = allSavesData.reduce((sum, save) => sum + save.amount_cents, 0);
      setTotalSaved(total);
      setTotalSessions(allSavesData.length);
      
      const streakDays = calculateStreak(allSavesData);
      setStreak(streakDays);
      
      generateInsights(allSavesFormatted);
    }
  };

  const filterSaves = () => {
    let filtered = [...allSaves];

    if (searchTerm) {
      filtered = filtered.filter(save => 
        save.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterPeriod !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filterPeriod) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(save => new Date(save.created_at) >= filterDate);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(save => save.reason.toLowerCase().includes(filterCategory.toLowerCase()));
    }

    setFilteredSaves(filtered);
  };

  const generateInsights = (savesData: Save[]) => {
    const insights: string[] = [];
    
    if (savesData.length === 0) return;

    const reasonCounts = savesData.reduce((acc, save) => {
      acc[save.reason] = (acc[save.reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topReason = Object.entries(reasonCounts).sort(([,a], [,b]) => b - a)[0];
    if (topReason) {
      insights.push(`Your top saving trigger: ${topReason[0]} (${topReason[1]} times)`);
    }

    const avgAmount = savesData.reduce((sum, save) => sum + save.amount_cents, 0) / savesData.length;
    insights.push(`Your average save: $${(avgAmount / 100).toFixed(2)}`);

    const recentSaves = savesData.filter(save => {
      const saveDate = new Date(save.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return saveDate >= weekAgo;
    });
    
    if (recentSaves.length > 0) {
      insights.push(`${recentSaves.length} saves this week - great momentum! 🔥`);
    }

    setInsights(insights);
  };

  const fetchUserSettings = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_settings')
      .select('projection_rate_percent')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setProjectionRate(Number(data.projection_rate_percent));
    }
  };

  const fetchMatches = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('match_events')
      .select('*')
      .eq('recipient_user_id', user.id);

    if (data) {
      setMatches(data.length);
    }
  };

  const calculateStreak = (savesData: any[]) => {
    if (!savesData.length) return 0;

    const today = new Date();
    let streak = 0;
    const savesByDate = new Map();

    savesData.forEach(save => {
      const date = new Date(save.created_at).toDateString();
      savesByDate.set(date, true);
    });

    let currentDate = new Date(today);
    while (savesByDate.has(currentDate.toDateString())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  };

  const filteredTotal = filteredSaves.reduce((sum, save) => sum + save.amount_cents, 0);

  return (
    <div className="space-y-6">
      <SaveHistoryStats
        totalSaved={totalSaved}
        totalSessions={totalSessions}
        streak={streak}
        matches={matches}
      />
      
      <SaveHistoryInsights insights={insights} />
      
      <SaveHistoryFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterPeriod={filterPeriod}
        setFilterPeriod={setFilterPeriod}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filteredCount={filteredSaves.length}
        totalCount={allSaves.length}
        filteredTotal={filteredTotal}
      />
      
      <SaveHistoryList
        saves={filteredSaves.length > 0 ? filteredSaves : saves}
        title={filteredSaves.length > 0 ? `Filtered Results (${filteredSaves.length})` : "Recent Saves"}
        description={filteredSaves.length > 0 ? 
          `${filteredSaves.length} saves matching your filters` : 
          "Your latest Save & Stack activities"
        }
        projectionRate={projectionRate}
      />
    </div>
  );
};

export default SaveHistory;