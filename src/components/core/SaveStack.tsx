import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PiggyBank, TrendingUp, Target, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ImpactProjection {
  oneYear: number;
  fiveYears: number;
  tenYears: number;
  twentyYears: number;
  thirtyYears: number;
}

export default function SaveStack() {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalSaved, setTotalSaved] = useState(0);
  const [saveCount, setSaveCount] = useState(0);

  const calculateImpactProjection = (amountCents: number): ImpactProjection => {
    const annualRate = 0.08; // 8% annual return
    const amount = amountCents / 100;
    
    return {
      oneYear: amount * Math.pow(1 + annualRate, 1),
      fiveYears: amount * Math.pow(1 + annualRate, 5),
      tenYears: amount * Math.pow(1 + annualRate, 10),
      twentyYears: amount * Math.pow(1 + annualRate, 20),
      thirtyYears: amount * Math.pow(1 + annualRate, 30)
    };
  };

  const handleSaveStack = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const amountCents = Math.round(parseFloat(amount) * 100);
      const projection = calculateImpactProjection(amountCents);
      
      // Store locally for demo
      const newTotal = totalSaved + amountCents;
      setTotalSaved(newTotal);
      setSaveCount(saveCount + 1);
      
      alert(`🎉 Save & Stack Success! $${amount} saved! In 30 years, this could be worth $${projection.thirtyYears.toFixed(2)}`);

      // Reset form
      setAmount('');
      setNote('');
      
    } catch (error) {
      console.error('Error saving:', error);
      alert("Failed to save your money. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getProjectionPreview = (): ImpactProjection | null => {
    const amountValue = parseFloat(amount);
    if (!amountValue || amountValue <= 0) return null;
    
    return calculateImpactProjection(Math.round(amountValue * 100));
  };

  const formatCurrency = (value: number) => {
    return value.toFixed(2);
  };

  const projection = getProjectionPreview();

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              ${formatCurrency(totalSaved / 100)}
            </div>
            <div className="text-sm text-muted-foreground">Total Saved</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-success/10 to-success/5">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">
              {saveCount}
            </div>
            <div className="text-sm text-muted-foreground">Save Sessions</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">
              ${formatCurrency(calculateImpactProjection(totalSaved).thirtyYears)}
            </div>
            <div className="text-sm text-muted-foreground">30Y Projection</div>
          </CardContent>
        </Card>
      </div>

      {/* Save & Stack Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-primary" />
            Save & Stack
          </CardTitle>
          <CardDescription>
            Turn your conscious spending into future wealth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveStack} className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount Saved ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="5.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="note">What did you save on? (optional)</Label>
              <Textarea
                id="note"
                placeholder="e.g., Skipped coffee, cooked at home, walked instead of Uber..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? "Saving..." : "Save & Stack"}
              <Sparkles className="h-4 w-4 ml-2" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Impact Projection Preview */}
      {projection && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Impact Projection
            </CardTitle>
            <CardDescription>
              See how your ${amount} save grows over time (8% annual return)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="text-center p-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
                <div className="text-lg font-bold text-primary">
                  ${formatCurrency(projection.oneYear)}
                </div>
                <div className="text-xs text-muted-foreground">1 Year</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
                <div className="text-lg font-bold text-primary">
                  ${formatCurrency(projection.fiveYears)}
                </div>
                <div className="text-xs text-muted-foreground">5 Years</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
                <div className="text-lg font-bold text-primary">
                  ${formatCurrency(projection.tenYears)}
                </div>
                <div className="text-xs text-muted-foreground">10 Years</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
                <div className="text-lg font-bold text-primary">
                  ${formatCurrency(projection.twentyYears)}
                </div>
                <div className="text-xs text-muted-foreground">20 Years</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-success/10 to-success/20 rounded-lg border border-success/20">
                <div className="text-lg font-bold text-success">
                  ${formatCurrency(projection.thirtyYears)}
                </div>
                <div className="text-xs text-muted-foreground">30 Years</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gradient-to-r from-success/10 to-accent/10 rounded-lg">
              <div className="text-sm text-center text-muted-foreground">
                <Target className="h-4 w-4 inline mr-1" />
                Assumes 8% annual return • Past performance doesn't predict future results
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}