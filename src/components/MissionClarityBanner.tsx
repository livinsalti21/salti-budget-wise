import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Coffee, ShoppingCart, Car, Lightbulb, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const MissionClarityBanner = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const habitExamples = [
    { icon: <Coffee className="h-4 w-4" />, habit: "Skip daily coffee", saving: "$5", future: "$64,000" },
    { icon: <ShoppingCart className="h-4 w-4" />, habit: "Cook vs delivery", saving: "$15", future: "$192,000" },
    { icon: <Car className="h-4 w-4" />, habit: "Walk vs Uber", saving: "$8", future: "$102,000" }
  ];

  return (
    <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 overflow-hidden">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-2xl">
              <Heart className="h-6 w-6 text-primary animate-pulse" />
              <span>✌🏽</span>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Building Wealth Through Small Daily Habits
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Every skip becomes future freedom. Transform tiny decisions into life-changing wealth.
            </p>
          </div>

          {!isExpanded ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="group"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Why Livin Salti?
              <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {habitExamples.map((example, index) => (
                  <div 
                    key={index} 
                    className="bg-white/50 dark:bg-black/20 rounded-lg p-3 border border-white/30 dark:border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {example.icon}
                      <span className="text-sm font-medium">{example.habit}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="text-success font-semibold">{example.saving}/day</span> = 
                      <span className="text-primary font-bold ml-1">{example.future}</span> in 30 years
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-accent/10 rounded-lg p-3 border border-accent/20">
                <p className="text-sm text-accent font-medium text-center">
                  🎯 It's not about the amount — it's about building the habit of choosing your future over instant gratification
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="text-xs text-muted-foreground"
              >
                Got it ↑
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MissionClarityBanner;