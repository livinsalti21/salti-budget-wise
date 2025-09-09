import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, Quote, TrendingUp, Coffee, Car, Home, Plane } from 'lucide-react';

interface SuccessStory {
  id: string;
  name: string;
  avatar: string;
  timeframe: string;
  habit: string;
  savedAmount: number;
  achievement: string;
  icon: React.ReactNode;
  category: 'travel' | 'home' | 'emergency' | 'investment';
}

const SuccessStories = () => {
  const stories: SuccessStory[] = [
    {
      id: '1',
      name: 'Sarah M.',
      avatar: 'SM',
      timeframe: '18 months',
      habit: 'Skipped daily coffee & made lunch',
      savedAmount: 2400,
      achievement: 'Traveled to Japan for 2 weeks',
      icon: <Plane className="h-4 w-4" />,
      category: 'travel'
    },
    {
      id: '2', 
      name: 'Marcus J.',
      avatar: 'MJ',
      timeframe: '2 years',
      habit: 'Walked instead of Uber rides',
      savedAmount: 3200,
      achievement: 'Emergency fund that saved his job transition',
      icon: <Home className="h-4 w-4" />,
      category: 'emergency'
    },
    {
      id: '3',
      name: 'Lisa K.',
      avatar: 'LK', 
      timeframe: '8 months',
      habit: 'Cooked vs ordering takeout',
      savedAmount: 1800,
      achievement: 'Down payment for her first car',
      icon: <Car className="h-4 w-4" />,
      category: 'home'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'travel': return 'from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-700';
      case 'home': return 'from-green-500/10 to-emerald-500/10 border-green-500/20 text-green-700';
      case 'emergency': return 'from-orange-500/10 to-red-500/10 border-orange-500/20 text-orange-700';
      case 'investment': return 'from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-700';
      default: return 'from-muted/10 to-muted/5 border-muted/20 text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Real Success Stories
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            See how small habits transformed into life-changing wins
          </p>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {stories.map((story) => (
          <Card key={story.id} className={`bg-gradient-to-r ${getCategoryColor(story.category)} hover:shadow-md transition-all duration-300`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 border-2 border-white/50">
                  <AvatarFallback className="bg-white/80 text-primary font-bold">
                    {story.avatar}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{story.name}</h4>
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      {story.timeframe}
                    </Badge>
                  </div>

                  <div className="relative bg-white/50 dark:bg-black/20 rounded-lg p-3 border border-white/30 dark:border-white/10">
                    <Quote className="h-4 w-4 text-muted-foreground absolute top-2 right-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      "{story.habit}"
                    </p>
                    <div className="flex items-center gap-2">
                      {story.icon}
                      <span className="text-sm font-medium text-foreground">
                        {story.achievement}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-success">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-bold">
                        ${story.savedAmount.toLocaleString()} saved
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Community Stats */}
      <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-accent/20">
        <CardContent className="p-6 text-center">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold text-primary">10,247</p>
              <p className="text-xs text-muted-foreground">Active Savers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">$2.1M</p>
              <p className="text-xs text-muted-foreground">Total Saved</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">15,392</p>
              <p className="text-xs text-muted-foreground">Habits Tracked</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Join thousands building wealth through daily habits 🚀
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuccessStories;