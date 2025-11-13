import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Users, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Challenge {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  entry_fee_cents: number;
  prize_pool_cents: number;
  current_participants: number;
  max_participants: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  challenge_type: string;
}

interface ChallengeCardProps {
  challenge: Challenge;
  onJoin?: (challengeId: string) => void;
  isJoined?: boolean;
  onViewDetails?: (challengeId: string) => void;
}

export function ChallengeCard({ challenge, onJoin, isJoined, onViewDetails }: ChallengeCardProps) {
  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500/10 text-blue-600 border-blue-300';
      case 'active':
        return 'bg-green-500/10 text-green-600 border-green-300';
      case 'completed':
        return 'bg-gray-500/10 text-gray-600 border-gray-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const participantsPercentage = (challenge.current_participants / challenge.max_participants) * 100;

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{challenge.title}</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {challenge.description}
            </p>
          </div>
          <Badge className={getStatusColor(challenge.status)}>
            {challenge.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg">
            <DollarSign className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Entry Fee</p>
              <p className="text-sm font-semibold">{formatCurrency(challenge.entry_fee_cents)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-success/5 rounded-lg">
            <Trophy className="h-4 w-4 text-success" />
            <div>
              <p className="text-xs text-muted-foreground">Prize Pool</p>
              <p className="text-sm font-semibold">{formatCurrency(challenge.prize_pool_cents)}</p>
            </div>
          </div>
        </div>

        {/* Participants */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Participants</span>
            </div>
            <span className="font-medium">
              {challenge.current_participants} / {challenge.max_participants}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${participantsPercentage}%` }}
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {challenge.status === 'active' && (
            <span>Ends {formatDistanceToNow(new Date(challenge.end_date), { addSuffix: true })}</span>
          )}
          {challenge.status === 'upcoming' && (
            <span>Starts {formatDistanceToNow(new Date(challenge.start_date), { addSuffix: true })}</span>
          )}
          {challenge.status === 'completed' && (
            <span>Completed</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {!isJoined && (challenge.status === 'upcoming' || challenge.status === 'active') && (
            <Button
              onClick={() => onJoin?.(challenge.id)}
              className="flex-1"
              disabled={challenge.current_participants >= challenge.max_participants}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Join Challenge
            </Button>
          )}
          {isJoined && (
            <Badge className="flex-1 justify-center py-2 bg-primary/10 text-primary">
              ✓ Joined
            </Badge>
          )}
          <Button
            onClick={() => onViewDetails?.(challenge.id)}
            variant="outline"
            className={!isJoined ? "flex-1" : ""}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
