import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface SaveHistoryInsightsProps {
  insights: string[];
}

export default function SaveHistoryInsights({ insights }: SaveHistoryInsightsProps) {
  if (insights.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-accent" />
          Smart Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 p-3 bg-gradient-to-r from-accent/5 to-success/5 rounded-lg border border-accent/20"
            >
              <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-foreground">{insight}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}