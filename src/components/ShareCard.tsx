import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Copy, Check, Download, Heart, Flame, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareCardData {
  amount: string;
  goalEmoji: string;
  goalTitle: string;
  streakDays: number;
  futureValue: string;
  totalSaved: string;
}

interface ShareCardProps {
  data: ShareCardData;
  onClose?: () => void;
}

const ShareCard = ({ data, onClose }: ShareCardProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareText = `🎯 Just saved $${data.amount} toward my ${data.goalTitle}!\n\n💪 Streak: ${data.streakDays} days\n📈 Future value: $${data.futureValue}\n💰 Total saved: $${data.totalSaved}\n\n#LivinSalti #SaveNStack #FinancialFreedom`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast({
        title: "Copied to clipboard! 📋",
        description: "Share your success on social media",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareToSocial = async (platform?: string) => {
    // Try native share first (Capacitor)
    try {
      const { Share } = await import('@capacitor/share');
      await Share.share({
        title: 'My Savings Progress - Livin Salti',
        text: shareText,
        url: 'https://livinsalti.com',
      });
      return;
    } catch (error) {
      // Fallback to web sharing
      console.log('Native share not available, using web fallback');
    }

    // Web fallback for specific platforms
    if (platform) {
      const encodedText = encodeURIComponent(shareText);
      const urls = {
        twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://livinsalti.com')}&quote=${encodedText}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://livinsalti.com')}&summary=${encodedText}`
      };

      if (urls[platform as keyof typeof urls]) {
        window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          {/* Share Card Preview */}
          <div className="bg-gradient-to-br from-primary via-accent to-secondary p-6 rounded-lg text-white mb-6 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 text-6xl">{data.goalEmoji}</div>
              <div className="absolute bottom-4 left-4 text-4xl">💎</div>
            </div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Livin Salti
                </Badge>
                <div className="flex items-center gap-1 text-white/90">
                  <Flame className="h-4 w-4" />
                  <span className="text-sm font-medium">{data.streakDays} day streak</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  ${data.amount} SAVED
                </div>
                <div className="text-lg mb-3 opacity-90">
                  {data.goalEmoji} {data.goalTitle}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-xs opacity-80">Future Value</span>
                    </div>
                    <div className="font-semibold">${data.futureValue}</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Heart className="h-3 w-3" />
                      <span className="text-xs opacity-80">Total Saved</span>
                    </div>
                    <div className="font-semibold">${data.totalSaved}</div>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-4 text-xs opacity-75">
                Building wealth, one save at a time 💪
              </div>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-4">
            <h3 className="font-semibold text-center">Share Your Success! 🎉</h3>
            
            {/* Copy Text & Native Share */}
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={copyToClipboard}
                variant="outline" 
                className="flex-1"
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
              
              <Button 
                onClick={() => shareToSocial()}
                className="flex-1"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
            
            {/* Social Media Fallbacks */}
            <div className="grid grid-cols-3 gap-2">
              <Button 
                onClick={() => shareToSocial('twitter')}
                variant="outline"
                size="sm"
                className="text-blue-500 border-blue-500/20 hover:bg-blue-500/10"
              >
                Twitter
              </Button>
              <Button 
                onClick={() => shareToSocial('facebook')}
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-600/20 hover:bg-blue-600/10"
              >
                Facebook
              </Button>
              <Button 
                onClick={() => shareToSocial('linkedin')}
                variant="outline"
                size="sm"
                className="text-blue-700 border-blue-700/20 hover:bg-blue-700/10"
              >
                LinkedIn
              </Button>
            </div>
            
            {/* Close */}
            <Button 
              onClick={onClose}
              variant="ghost" 
              className="w-full"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShareCard;