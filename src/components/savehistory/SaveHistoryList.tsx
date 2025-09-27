import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, PiggyBank } from 'lucide-react';

interface Save {
  id: string;
  amount_cents: number;
  reason: string;
  created_at: string;
  future_value_cents?: number;
  stacklet_id?: string;
}

interface SaveHistoryListProps {
  saves: Save[];
  title: string;
  description: string;
  projectionRate: number;
}

export default function SaveHistoryList({ saves, title, description, projectionRate }: SaveHistoryListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const calculateFutureValue = (amount: number, years: number = 10) => {
    const principal = amount / 100;
    const annualRate = projectionRate / 100;
    return principal * Math.pow(1 + annualRate, years);
  };

  const maxAmount = Math.max(...saves.map(s => s.amount_cents), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {saves.length === 0 ? (
          <div className="text-center py-8">
            <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No saves to display</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {saves.map((save, index) => (
              <div 
                key={save.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/30 transition-all duration-200 hover:shadow-sm animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-lg">${(save.amount_cents / 100).toFixed(2)}</p>
                    <Badge variant="secondary" className="text-xs">
                      {save.reason}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(save.created_at)}</p>
                </div>
                
                <div className="text-right space-y-1">
                  <p className="text-sm font-medium text-success">
                    ${calculateFutureValue(save.amount_cents).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">in 10 years</p>
                  <Progress 
                    value={(save.amount_cents / maxAmount) * 100} 
                    className="h-1 w-16"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}