import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Target, Flame, TrendingUp } from 'lucide-react';
import { SaveEngine } from '@/simulation/saveEngine';

interface SaveEnginePanelProps {
  saveEngine: SaveEngine;
  onSaveAdded: (amount: number) => void;
}

export default function SaveEnginePanel({ saveEngine, onSaveAdded }: SaveEnginePanelProps) {
  const [showAddSave, setShowAddSave] = useState(false);
  const [saveAmount, setSaveAmount] = useState('');
  
  const state = saveEngine.getState();
  const nextSaveDate = new Date();
  nextSaveDate.setDate(nextSaveDate.getDate() + 1);

  const handleAddSave = () => {
    const amount = parseFloat(saveAmount) * 100; // Convert to cents
    if (amount > 0) {
      saveEngine.addSave(amount, 'manual');
      onSaveAdded(amount);
      setSaveAmount('');
      setShowAddSave(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-success';
    if (streak >= 7) return 'text-warning';
    return 'text-accent';
  };

  const getStreakIcon = (streak: number) => {
    if (streak >= 30) return '🔥';
    if (streak >= 7) return '⭐';
    return '💫';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Save n Stack (Practice)
            </CardTitle>
            <CardDescription>Build your saving streak and see future potential</CardDescription>
          </div>
          <Badge variant="outline" className="border-accent text-accent">
            Demo Mode
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Streak */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Flame className={`h-5 w-5 ${getStreakColor(state.streak.current)}`} />
              <span className="text-2xl">{getStreakIcon(state.streak.current)}</span>
            </div>
            <div className={`text-2xl font-bold ${getStreakColor(state.streak.current)}`}>
              {state.streak.current}
            </div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
            <TrendingUp className="h-5 w-5 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(state.totalSaved)}
            </div>
            <div className="text-sm text-muted-foreground">Total Saved</div>
          </div>
        </div>

        {/* Next Save Target */}
        <div className="p-4 bg-gradient-to-r from-success/10 to-success/5 rounded-lg border border-success/20">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-success" />
            <div>
              <div className="font-medium">Next Save Target</div>
              <div className="text-sm text-muted-foreground">
                {nextSaveDate.toLocaleDateString()} - Keep your streak alive!
              </div>
            </div>
          </div>
        </div>

        {/* Add Save Section */}
        {!showAddSave ? (
          <Button 
            onClick={() => setShowAddSave(true)}
            className="w-full"
            variant="outline"
          >
            Add a Save to Your Streak
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Amount (e.g., 5.00)"
                value={saveAmount}
                onChange={(e) => setSaveAmount(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md"
                step="0.01"
                min="0"
              />
              <Button onClick={handleAddSave} disabled={!saveAmount || parseFloat(saveAmount) <= 0}>
                Save
              </Button>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setShowAddSave(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Milestone Progress */}
        {state.streak.current < 30 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to 30-day milestone</span>
              <span>{state.streak.current}/30 days</span>
            </div>
            <Progress value={(state.streak.current / 30) * 100} className="h-2" />
          </div>
        )}

        {/* Recent Activity */}
        {state.events.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Recent Activity</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {state.events.slice(-3).reverse().map((event, index) => (
                <div key={index} className="flex justify-between text-sm p-2 bg-background/50 rounded">
                  <span>{formatCurrency(event.amount)} saved</span>
                  <span className="text-muted-foreground">
                    {event.date.toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            🎯 Set a weekly amount and watch your streak grow. Small steps stack big!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}