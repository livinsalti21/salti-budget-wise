import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface SaveSnapCardProps {
  amount_cents: number;
  ai_caption?: string;
  photo_url?: string;
  created_at: string;
  reason?: string;
  future_value_cents?: number;
}

export default function SaveSnapCard({
  amount_cents,
  ai_caption,
  photo_url,
  created_at,
  reason,
  future_value_cents,
}: SaveSnapCardProps) {
  const amount = amount_cents / 100;
  const futureValue = future_value_cents ? future_value_cents / 100 : null;

  const handleShare = async () => {
    const shareText = ai_caption || `I just saved $${amount.toFixed(2)}! 💰`;
    
    if (navigator.share && photo_url) {
      try {
        // Fetch the image as a blob
        const response = await fetch(photo_url);
        const blob = await response.blob();
        const file = new File([blob], 'save-snap.jpg', { type: blob.type });

        await navigator.share({
          text: shareText,
          files: [file],
        });
      } catch (error) {
        // Fallback to text only
        if (navigator.share) {
          await navigator.share({ text: shareText });
        } else {
          await navigator.clipboard.writeText(shareText);
          toast.success('Copied to clipboard!');
        }
      }
    } else if (navigator.share) {
      await navigator.share({ text: shareText });
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success('Copied to clipboard!');
    }
  };

  return (
    <Card className="overflow-hidden border-primary/20 hover:border-primary/40 transition-colors">
      {photo_url && (
        <div className="relative w-full h-64 bg-muted">
          <img 
            src={photo_url} 
            alt="Save moment" 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3">
            <Badge className="bg-success/90 backdrop-blur-sm text-success-foreground">
              ${amount.toFixed(2)}
            </Badge>
          </div>
        </div>
      )}
      
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            {ai_caption && (
              <p className="text-sm font-medium text-foreground mb-2">
                {ai_caption}
              </p>
            )}
            {reason && (
              <p className="text-sm text-muted-foreground">
                {reason}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="flex-shrink-0"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(created_at), 'MMM d, yyyy')}</span>
          </div>
          
          {futureValue && (
            <div className="flex items-center gap-1 text-success">
              <TrendingUp className="h-3 w-3" />
              <span>${futureValue.toLocaleString()} in 40y</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
