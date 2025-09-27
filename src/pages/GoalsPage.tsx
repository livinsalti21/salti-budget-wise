import { useState, useEffect } from "react";
import { Plus, PiggyBank } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import GoalsOnboarding from "@/components/goals/GoalsOnboarding";
import GoalsSummary from "@/components/goals/GoalsSummary";
import GoalCard from "@/components/goals/GoalCard";
import GoalCreateForm from "@/components/goals/GoalCreateForm";
import GoalEditForm from "@/components/goals/GoalEditForm";

interface Goal {
  id: string;
  title: string;
  emoji: string;
  target_cents: number | null;
  deadline_date: string | null;
  asset_type: 'CASH' | 'BTC';
  progress_cents: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export default function GoalsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showGoalsOnboarding, setShowGoalsOnboarding] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
      checkGoalsOnboardingNeeds();
      
      // Set up real-time subscription for goals
      const channel = supabase
        .channel('goals-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'stacklets', filter: `user_id=eq.${user.id}` },
          () => loadData()
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'save_events', filter: `user_id=eq.${user.id}` },
          () => loadData()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const checkGoalsOnboardingNeeds = async () => {
    const completedGoalsOnboarding = localStorage.getItem('goals_onboarding_completed');
    
    if (!completedGoalsOnboarding) {
      try {
        const { data: saveData } = await supabase
          .from('save_events')
          .select('amount_cents')
          .eq('user_id', user?.id)
          .limit(5);

        if (!saveData || saveData.length < 5) {
          setShowGoalsOnboarding(true);
        }
      } catch (error) {
        setShowGoalsOnboarding(true);
      }
    }
  };

  const handleGoalsOnboardingComplete = () => {
    localStorage.setItem('goals_onboarding_completed', 'true');
    setShowGoalsOnboarding(false);
  };

  const loadData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Load goals (stacklets)
      const { data: goalsData, error: goalsError } = await supabase
        .from('stacklets')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;
      setGoals((goalsData || []) as Goal[]);

      // Load total saved from save_events
      const { data: saveData, error: saveError } = await supabase
        .from('save_events')
        .select('amount_cents')
        .eq('user_id', user.id);

      if (saveError) throw saveError;
      const total = saveData?.reduce((sum, save) => sum + save.amount_cents, 0) || 0;
      setTotalSaved(total);

    } catch (error: any) {
      toast({
        title: "Error loading goals",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSave = (goalId: string) => {
    // Navigate to save page with the specific goal selected
    navigate(`/app/save?goalId=${goalId}`);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
  };

  const handleEditComplete = () => {
    setEditingGoal(null);
    loadData(); // Refresh goals after edit
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader 
          title="My Goals" 
          subtitle="Track your savings goals"
          backTo="/app"
        />
        <div className="p-4 space-y-4 max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-32 bg-muted rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="My Goals" 
        subtitle="Track your savings goals"
        backTo="/app"
      />

      <main className="p-4 space-y-6 max-w-6xl mx-auto">
        {/* Summary */}
        <GoalsSummary goals={goals} totalSaved={totalSaved} />

        {/* Goals Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Your Goals</h2>
            <p className="text-sm text-muted-foreground">
              {goals.length === 0 ? 'Create your first savings goal' : `${goals.length} active goals`}
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Goal
          </Button>
        </div>

        {/* Goals Grid */}
        {goals.length === 0 ? (
          <Card className="p-8 text-center">
            <PiggyBank className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first savings goal to start tracking your progress
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Goal
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleEditGoal}
                onAddSave={handleAddSave}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Form */}
      <GoalCreateForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSuccess={loadData}
      />

      {/* Edit Form */}
      {editingGoal && (
        <GoalEditForm
          goal={editingGoal}
          open={!!editingGoal}
          onOpenChange={(open) => !open && setEditingGoal(null)}
          onSuccess={handleEditComplete}
        />
      )}

      {/* Onboarding */}
      {showGoalsOnboarding && (
        <GoalsOnboarding
          onComplete={handleGoalsOnboardingComplete}
          onSkip={handleGoalsOnboardingComplete}
        />
      )}
    </div>
  );
}