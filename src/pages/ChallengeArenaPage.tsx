import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { ChallengeLeaderboard } from "@/components/challenges/ChallengeLeaderboard";
import { JoinChallengeModal } from "@/components/challenges/JoinChallengeModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Flame, TrendingUp, Loader2 } from "lucide-react";
import { FLAGS } from "@/lib/flags";
import { Navigate } from "react-router-dom";

export default function ChallengeArenaPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [myChallenges, setMyChallenges] = useState<any[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [userBalance, setUserBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Feature flag check
  if (!FLAGS.CHALLENGES) {
    return <Navigate to="/app" replace />;
  }

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadChallenges(),
        loadMyChallenges(),
        loadUserBalance(),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChallenges = async () => {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .in('status', ['upcoming', 'active', 'completed'])
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error loading challenges:', error);
      return;
    }

    setChallenges(data || []);
  };

  const loadMyChallenges = async () => {
    const { data, error } = await supabase
      .from('challenge_participants')
      .select(`
        *,
        challenges (*)
      `)
      .eq('user_id', user?.id)
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('Error loading my challenges:', error);
      return;
    }

    setMyChallenges(data || []);
  };

  const loadUserBalance = async () => {
    const { data, error } = await supabase
      .from('user_accounts')
      .select('current_balance_cents')
      .eq('user_id', user?.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading balance:', error);
      return;
    }

    setUserBalance(data?.current_balance_cents || 0);
  };

  const loadLeaderboard = async (challengeId: string) => {
    const { data, error } = await supabase
      .from('challenge_leaderboards')
      .select('*')
      .eq('challenge_id', challengeId)
      .order('rank');

    if (error) {
      console.error('Error loading leaderboard:', error);
      return;
    }

    setLeaderboardData(data || []);
  };

  const handleJoinChallenge = async (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    setSelectedChallenge(challenge);
    setShowJoinModal(true);
  };

  const handleConfirmJoin = async (challengeId: string) => {
    try {
      const response = await supabase.functions.invoke('challenge-operations', {
        body: {
          action: 'join_challenge',
          challengeId,
        },
      });

      if (response.error) throw response.error;

      toast({
        title: "Success!",
        description: "You've joined the challenge. Good luck!",
      });

      // Reload data
      await loadData();
    } catch (error: any) {
      toast({
        title: "Failed to join",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = async (challengeId: string) => {
    await loadLeaderboard(challengeId);
    const challenge = challenges.find(c => c.id === challengeId);
    setSelectedChallenge(challenge);
  };

  const myActiveChallenges = myChallenges.filter(
    mc => mc.challenges?.status === 'active'
  );

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <PageHeader
        title="Challenge Arena"
        subtitle="Compete, save, and win prizes"
        backTo="/app"
      />

      <main className="p-4 max-w-7xl mx-auto space-y-6">
        {/* Stats Overview */}
        {myActiveChallenges.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  Active Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{myActiveChallenges.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-success" />
                  Total Saved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    myActiveChallenges.reduce((sum, c) => sum + (c.total_saved_cents || 0), 0)
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Best Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {Math.max(...myActiveChallenges.map(c => c.streak_days || 0), 0)} days
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="my-challenges">My Challenges</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {challenges
                .filter(c => c.status === 'upcoming' || c.status === 'active')
                .map((challenge) => {
                  const isJoined = myChallenges.some(
                    mc => mc.challenge_id === challenge.id
                  );
                  
                  return (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      isJoined={isJoined}
                      onJoin={handleJoinChallenge}
                      onViewDetails={handleViewDetails}
                    />
                  );
                })}
            </div>

            {challenges.filter(c => c.status === 'upcoming' || c.status === 'active').length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No challenges available right now.</p>
                  <p className="text-sm mt-2">Check back soon for new competitions!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="my-challenges" className="mt-6">
            <div className="space-y-4">
              {myChallenges.map((participation) => (
                <Card key={participation.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{participation.challenges?.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {participation.challenges?.description}
                        </p>
                      </div>
                      {participation.rank && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Rank</p>
                          <p className="text-2xl font-bold text-primary">#{participation.rank}</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Score</p>
                        <p className="text-lg font-semibold flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          {participation.score?.toFixed(0) || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Saved</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(participation.total_saved_cents || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Streak</p>
                        <p className="text-lg font-semibold flex items-center gap-1">
                          <Flame className="h-4 w-4 text-orange-500" />
                          {participation.streak_days || 0}d
                        </p>
                      </div>
                    </div>

                    {participation.reward_cents > 0 && !participation.reward_claimed && (
                      <div className="mt-4 p-3 bg-success/10 border border-success/30 rounded-lg">
                        <p className="text-sm font-medium text-success">
                          🎉 You won {formatCurrency(participation.reward_cents)}! Claim your reward.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {myChallenges.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>You haven't joined any challenges yet.</p>
                    <p className="text-sm mt-2">Check out the Available tab to get started!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-6">
            {selectedChallenge && leaderboardData.length > 0 ? (
              <ChallengeLeaderboard
                entries={leaderboardData}
                currentUserId={user?.id}
              />
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a challenge to view its leaderboard</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <JoinChallengeModal
        challenge={selectedChallenge}
        open={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setSelectedChallenge(null);
        }}
        onConfirm={handleConfirmJoin}
        userBalance={userBalance}
      />
    </div>
  );
}
