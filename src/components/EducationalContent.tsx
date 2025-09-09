import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, BookOpen, TrendingUp, Lightbulb, PlayCircle, ArrowRight, Calendar } from 'lucide-react';
import { useState } from 'react';

interface EducationalItem {
  id: string;
  type: 'tip' | 'fact' | 'lesson' | 'video';
  title: string;
  content: string;
  category: 'psychology' | 'compound' | 'habits' | 'budgeting';
  readTime?: number;
  videoLength?: string;
  impact: 'beginner' | 'intermediate' | 'advanced';
}

const EducationalContent = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const weeklyContent: EducationalItem[] = [
    {
      id: '1',
      type: 'tip',
      title: 'The $5 Challenge Psychology',
      content: 'Your brain treats small sacrifices differently than large ones. A $5 coffee skip feels manageable, but saving $1,825/year feels impossible. Start small to rewire your money mindset.',
      category: 'psychology',
      readTime: 2,
      impact: 'beginner'
    },
    {
      id: '2',
      type: 'fact',
      title: 'Compound Interest Reality Check',
      content: 'Saving $10/day for 40 years at 7% return = $868,000. Most people underestimate compound growth by 300%. Time is your biggest wealth multiplier.',
      category: 'compound',
      readTime: 1,
      impact: 'intermediate'
    },
    {
      id: '3',
      type: 'lesson', 
      title: 'Habit Stacking for Savers',
      content: 'Link saving to existing habits: "After I buy groceries, I save the money I didn\'t spend on impulse items." This creates automatic wealth-building behaviors.',
      category: 'habits',
      readTime: 3,
      impact: 'intermediate'
    },
    {
      id: '4',
      type: 'video',
      title: 'The Latte Factor Myth Busted',
      content: 'It\'s not about the coffee - it\'s about the mindset. Learn why small habit changes create massive psychological shifts toward abundance thinking.',
      category: 'psychology',
      videoLength: '5:30',
      impact: 'advanced'
    }
  ];

  const didYouKnowFacts = [
    "Millionaires have an average of 7 income streams - many start with saved pocket change",
    "The typical American spends $3,526/year on dining out - that's $450K over 30 years at 8% return",
    "People who track expenses save 15-20% more than those who don't",
    "Small habit changes are 300% more effective than willpower for long-term savings"
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tip': return <Lightbulb className="h-4 w-4" />;
      case 'fact': return <TrendingUp className="h-4 w-4" />;
      case 'lesson': return <BookOpen className="h-4 w-4" />;
      case 'video': return <PlayCircle className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'beginner': return 'bg-green-500/10 text-green-700 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/10 text-red-700 border-red-500/30';
      default: return 'bg-muted/10 text-muted-foreground border-muted/30';
    }
  };

  const filteredContent = selectedCategory === 'all' 
    ? weeklyContent 
    : weeklyContent.filter(item => item.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Weekly Money Wisdom
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Transform your relationship with money through education and insights
          </p>
        </CardHeader>
      </Card>

      {/* Quick Did You Know */}
      <Card className="bg-gradient-to-r from-accent/10 to-warning/10 border-accent/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-accent/20 rounded-full">
              <Lightbulb className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">💡 Did You Know?</h3>
              <p className="text-sm text-muted-foreground">
                {didYouKnowFacts[Math.floor(Math.random() * didYouKnowFacts.length)]}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'psychology', 'compound', 'habits', 'budgeting'].map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="shrink-0 capitalize text-xs"
          >
            {category === 'all' ? 'All Topics' : category}
          </Button>
        ))}
      </div>

      {/* Educational Content Cards */}
      <div className="space-y-4">
        {filteredContent.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-all duration-300 group">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-primary/10 rounded-full">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-sm">{item.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-1.5 py-0.5 ${getImpactColor(item.impact)}`}
                        >
                          {item.impact}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {item.readTime && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {item.readTime} min read
                      </span>
                    )}
                    {item.videoLength && (
                      <span className="flex items-center gap-1">
                        <PlayCircle className="h-3 w-3" />
                        {item.videoLength}
                      </span>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    {item.type === 'video' ? 'Watch' : 'Read More'}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Educational Series Preview */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <CardContent className="p-6 text-center">
          <BookOpen className="h-8 w-8 text-purple-500 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-purple-700 dark:text-purple-300 mb-2">
            Habit-to-Wealth Masterclass
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            7-day series on the psychology of building wealth through micro-habits
          </p>
          <Button variant="outline" className="border-purple-500/30 text-purple-700 hover:bg-purple-500/10">
            Start Learning
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EducationalContent;