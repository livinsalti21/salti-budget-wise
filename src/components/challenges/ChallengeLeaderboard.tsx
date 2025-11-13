import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Target, Flame } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  score: number;
  total_saved_cents: number;
  save_count: number;
  streak_days: number;
  reward_cents: number;
}

interface ChallengeLeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

export function ChallengeLeaderboard({ entries, currentUserId }: ChallengeLeaderboardProps) {
  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Trophy className="h-5 w-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      const colors = {
        1: 'bg-yellow-500/20 text-yellow-700 border-yellow-400',
        2: 'bg-gray-400/20 text-gray-700 border-gray-400',
        3: 'bg-orange-500/20 text-orange-700 border-orange-400',
      };
      return colors[rank as keyof typeof colors];
    }
    return 'bg-muted text-muted-foreground';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {entries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No participants yet. Be the first to join!
            </p>
          ) : (
            entries.map((entry) => {
              const isCurrentUser = entry.user_id === currentUserId;
              
              return (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    isCurrentUser
                      ? 'bg-primary/5 border-primary/30 shadow-sm'
                      : 'bg-card border-border hover:bg-muted/50'
                  }`}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-10">
                    {getRankIcon(entry.rank) || (
                      <Badge className={getRankBadge(entry.rank)}>
                        #{entry.rank}
                      </Badge>
                    )}
                  </div>

                  {/* User Info */}
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {entry.display_name?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">
                      {entry.display_name || 'Anonymous'}
                      {isCurrentUser && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          You
                        </Badge>
                      )}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {entry.save_count} saves
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3" />
                        {entry.streak_days}d streak
                      </span>
                    </div>
                  </div>

                  {/* Score & Stats */}
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="font-bold text-lg">{entry.score.toFixed(0)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(entry.total_saved_cents)} saved
                    </p>
                    {entry.reward_cents > 0 && (
                      <Badge className="mt-1 bg-success/10 text-success border-success/30">
                        +{formatCurrency(entry.reward_cents)}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
