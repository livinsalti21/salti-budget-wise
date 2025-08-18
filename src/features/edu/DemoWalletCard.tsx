import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PiggyBank, Plus, TrendingUp, Clock } from 'lucide-react';

interface DemoWalletProps {
  balance: number;
  lastActivity?: Date;
  onAddSave: () => void;
}

export default function DemoWalletCard({ balance, lastActivity, onAddSave }: DemoWalletProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'No activity yet';
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <PiggyBank className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Demo Wallet</CardTitle>
              <CardDescription>Practice with simulated money</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="border-accent text-accent">
            Learning Mode
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold text-accent">
            {formatCurrency(balance)}
          </div>
          <p className="text-sm text-muted-foreground">Current Balance</p>
        </div>

        {lastActivity && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
            <Clock className="h-4 w-4" />
            <span>Last activity: {formatDate(lastActivity)}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <TrendingUp className="h-5 w-5 text-success mx-auto mb-1" />
            <div className="text-sm font-medium">Growing</div>
            <div className="text-xs text-muted-foreground">Building habits</div>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <PiggyBank className="h-5 w-5 text-primary mx-auto mb-1" />
            <div className="text-sm font-medium">Safe</div>
            <div className="text-xs text-muted-foreground">Demo only</div>
          </div>
        </div>

        <Button 
          onClick={onAddSave}
          className="w-full"
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add a Save
        </Button>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            💡 This wallet uses simulated money to help you practice good saving habits
          </p>
        </div>
      </CardContent>
    </Card>
  );
}