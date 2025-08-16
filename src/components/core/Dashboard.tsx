import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Target, PiggyBank, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardData {
  totalSaved: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsThisMonth: number;
  projectedNetWorth: number;
  savingStreak: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data] = useState<DashboardData>({
    totalSaved: 15000, // $150
    monthlyIncome: 350000, // $3500
    monthlyExpenses: 280000, // $2800
    savingsThisMonth: 5000, // $50
    projectedNetWorth: 133000, // $1330
    savingStreak: 7
  });

  const formatCurrency = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const getBalanceColor = () => {
    const balance = data.monthlyIncome - data.monthlyExpenses;
    return balance >= 0 ? 'text-success' : 'text-destructive';
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Saved</p>
                <p className="text-2xl font-bold text-primary">
                  ${formatCurrency(data.totalSaved)}
                </p>
              </div>
              <PiggyBank className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Balance</p>
                <p className={`text-2xl font-bold ${getBalanceColor()}`}>
                  ${formatCurrency(data.monthlyIncome - data.monthlyExpenses)}
                </p>
              </div>
              {data.monthlyIncome - data.monthlyExpenses >= 0 ? 
                <TrendingUp className="h-8 w-8 text-success" /> :
                <TrendingDown className="h-8 w-8 text-destructive" />
              }
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-accent">
                  ${formatCurrency(data.savingsThisMonth)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">30Y Projection</p>
                <p className="text-2xl font-bold text-warning">
                  ${Math.round(data.projectedNetWorth).toLocaleString()}
                </p>
              </div>
              <Target className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
          <CardDescription>Your financial overview for this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-lg">
              <DollarSign className="h-8 w-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-success">
                ${formatCurrency(data.monthlyIncome)}
              </div>
              <div className="text-sm text-muted-foreground">Monthly Income</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-lg">
              <TrendingDown className="h-8 w-8 text-destructive mx-auto mb-2" />
              <div className="text-2xl font-bold text-destructive">
                ${formatCurrency(data.monthlyExpenses)}
              </div>
              <div className="text-sm text-muted-foreground">Monthly Expenses</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
              <Target className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">
                ${formatCurrency(data.savingsThisMonth)}
              </div>
              <div className="text-sm text-muted-foreground">Saved This Month</div>
            </div>
          </div>
          
          {data.savingStreak > 0 && (
            <div className="mt-6 text-center">
              <Badge variant="default" className="text-lg px-4 py-2">
                🔥 {data.savingStreak} day saving streak!
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Welcome Message */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Welcome to Livin Salti! 🎉</h3>
            <p className="text-muted-foreground mb-4">
              Start your wealth-building journey by making your first save. Every small step counts!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-background/50 rounded-lg">
                <PiggyBank className="h-6 w-6 mx-auto mb-1 text-primary" />
                <div className="font-medium">Save & Stack</div>
                <div className="text-muted-foreground">Log your conscious spending choices</div>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <Target className="h-6 w-6 mx-auto mb-1 text-accent" />
                <div className="font-medium">See Your Future</div>
                <div className="text-muted-foreground">Watch small saves become big wealth</div>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <TrendingUp className="h-6 w-6 mx-auto mb-1 text-success" />
                <div className="font-medium">Build Habits</div>
                <div className="text-muted-foreground">Celebrate every financial win</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}