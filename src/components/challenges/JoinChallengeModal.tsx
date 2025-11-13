import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DollarSign, Trophy, Users, AlertCircle, TrendingUp } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  entry_fee_cents: number;
  prize_pool_cents: number;
  current_participants: number;
  max_participants: number;
}

interface JoinChallengeModalProps {
  challenge: Challenge | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (challengeId: string) => Promise<void>;
  userBalance: number;
}

export function JoinChallengeModal({
  challenge,
  open,
  onClose,
  onConfirm,
  userBalance,
}: JoinChallengeModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!challenge) return null;

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const hasEnoughBalance = userBalance >= challenge.entry_fee_cents;
  const balanceAfterEntry = userBalance - challenge.entry_fee_cents;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(challenge.id);
      onClose();
    } catch (error) {
      console.error('Failed to join challenge:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Join Challenge
          </DialogTitle>
          <DialogDescription>{challenge.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Challenge Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Entry Fee</span>
              </div>
              <p className="text-lg font-bold">{formatCurrency(challenge.entry_fee_cents)}</p>
            </div>

            <div className="p-3 bg-success/5 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4 text-success" />
                <span className="text-xs text-muted-foreground">Prize Pool</span>
              </div>
              <p className="text-lg font-bold">{formatCurrency(challenge.prize_pool_cents)}</p>
            </div>
          </div>

          {/* Balance Info */}
          <div className="p-3 border rounded-lg">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Current Balance</span>
              <span className="font-semibold">{formatCurrency(userBalance)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Balance After Entry</span>
              <span className={`font-semibold ${balanceAfterEntry < 0 ? 'text-destructive' : 'text-success'}`}>
                {formatCurrency(balanceAfterEntry)}
              </span>
            </div>
          </div>

          {/* Warnings */}
          {!hasEnoughBalance && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Insufficient balance. You need {formatCurrency(challenge.entry_fee_cents - userBalance)} more to join.
              </AlertDescription>
            </Alert>
          )}

          {/* Participants Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {challenge.current_participants} / {challenge.max_participants} participants
            </span>
          </div>

          {/* How It Works */}
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              How It Works
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
              <li>Save consistently to earn points</li>
              <li>Build streaks for bonus multipliers</li>
              <li>Top 3 players share the prize pool</li>
              <li>1st: 50%, 2nd: 30%, 3rd: 20%</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!hasEnoughBalance || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              "Joining..."
            ) : (
              <>
                <Trophy className="h-4 w-4" />
                Join Challenge
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
