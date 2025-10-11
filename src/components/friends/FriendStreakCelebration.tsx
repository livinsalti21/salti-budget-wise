import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Flame, Share2 } from 'lucide-react';

interface FriendStreakCelebrationProps {
  open: boolean;
  onClose: () => void;
  friendName: string;
  streakDays: number;
  milestone?: number;
}

export default function FriendStreakCelebration({
  open,
  onClose,
  friendName,
  streakDays,
  milestone
}: FriendStreakCelebrationProps) {
  const getMilestoneMessage = () => {
    if (!milestone) return "Friend Streak Active!";
    
    const messages: Record<number, string> = {
      7: "One week of saving together! 🎉",
      14: "Two weeks strong! You're building momentum! 🚀",
      30: "30 days together! This friendship is gold! 💎",
      50: "50 days! You're both financial legends! ⭐",
      100: "100 DAYS! UNSTOPPABLE TOGETHER! 👑"
    };
    
    return messages[milestone] || "Amazing Streak!";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl flex flex-col items-center gap-2">
            <div className="h-16 w-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center animate-pulse">
              <Flame className="h-8 w-8 text-white" />
            </div>
            {getMilestoneMessage()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          <p className="text-3xl font-bold text-orange-600">{streakDays} Days</p>
          <p className="text-muted-foreground">
            You and <strong>{friendName}</strong> have saved together for {streakDays} consecutive days!
          </p>
          
          <div className="bg-blue-50 rounded-lg p-4 text-sm">
            <p className="font-medium text-blue-900 mb-2">💡 Keep It Going!</p>
            <ul className="text-blue-700 space-y-1 text-left">
              <li>• You both need to save every day to maintain the streak</li>
              <li>• Even $1 counts – it's about consistency!</li>
              <li>• Reach 30 days for special rewards</li>
            </ul>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
            <Button className="flex-1 bg-orange-500 hover:bg-orange-600">
              <Share2 className="h-4 w-4 mr-2" />
              Share Streak
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
