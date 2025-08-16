import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, DollarSign, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface BudgetItem {
  id?: string;
  category: string;
  planned_cents: number;
  actual_cents?: number;
}

interface Budget {
  id?: string;
  month: string;
  title: string;
  items: BudgetItem[];
}

const CATEGORIES = [
  'Income',
  'Rent/Housing',
  'Food',
  'Transportation', 
  'Entertainment',
  'Shopping',
  'Savings',
  'Other'
];

export default function BudgetInput() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [budget, setBudget] = useState<Budget>({
    month: new Date().toISOString().slice(0, 7) + '-01',
    title: 'Monthly Budget',
    items: []
  });
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState<BudgetItem>({
    category: '',
    planned_cents: 0
  });

  useEffect(() => {
    if (user) {
      loadBudget();
    }
  }, [user]);

  const loadBudget = async () => {
    if (!user) return;
    
    try {
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      
      const { data: budgetData, error: budgetError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .single();

      if (budgetError && budgetError.code !== 'PGRST116') {
        throw budgetError;
      }

      if (budgetData) {
        const { data: itemsData, error: itemsError } = await supabase
          .from('budget_items')
          .select('*')
          .eq('budget_id', budgetData.id);

        if (itemsError) throw itemsError;

        setBudget({
          id: budgetData.id,
          month: budgetData.month,
          title: budgetData.title || 'Monthly Budget',
          items: itemsData || []
        });
      }
    } catch (error) {
      console.error('Error loading budget:', error);
      toast({
        title: "Error",
        description: "Failed to load budget data",
        variant: "destructive"
      });
    }
  };

  const saveBudget = async () => {
    if (!user || budget.items.length === 0) return;
    
    setLoading(true);
    try {
      let budgetId = budget.id;
      
      if (!budgetId) {
        const { data: budgetData, error: budgetError } = await supabase
          .from('budgets')
          .insert({
            user_id: user.id,
            month: budget.month,
            title: budget.title
          })
          .select()
          .single();

        if (budgetError) throw budgetError;
        budgetId = budgetData.id;
      }

      // Delete existing items and insert new ones
      if (budgetId) {
        await supabase
          .from('budget_items')
          .delete()
          .eq('budget_id', budgetId);

        const { error: itemsError } = await supabase
          .from('budget_items')
          .insert(
            budget.items.map(item => ({
              budget_id: budgetId,
              category: item.category,
              planned_cents: item.planned_cents,
              actual_cents: item.actual_cents || 0
            }))
          );

        if (itemsError) throw itemsError;
      }

      toast({
        title: "Success!",
        description: "Budget saved successfully",
      });
      
      await loadBudget();
    } catch (error) {
      console.error('Error saving budget:', error);
      toast({
        title: "Error",
        description: "Failed to save budget",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    if (!newItem.category || newItem.planned_cents <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all fields with valid values",
        variant: "destructive"
      });
      return;
    }

    setBudget(prev => ({
      ...prev,
      items: [...prev.items, { ...newItem }]
    }));

    setNewItem({ category: '', planned_cents: 0 });
  };

  const removeItem = (index: number) => {
    setBudget(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const getTotalIncome = () => {
    return budget.items
      .filter(item => item.category === 'Income')
      .reduce((sum, item) => sum + item.planned_cents, 0);
  };

  const getTotalExpenses = () => {
    return budget.items
      .filter(item => item.category !== 'Income')
      .reduce((sum, item) => sum + item.planned_cents, 0);
  };

  const getRemaining = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Monthly Budget
          </CardTitle>
          <CardDescription>
            Track your income and expenses to build better money habits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Budget Summary */}
          {budget.items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-secondary/50 to-secondary/20 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">
                  ${formatCurrency(getTotalIncome())}
                </div>
                <div className="text-sm text-muted-foreground">Total Income</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">
                  ${formatCurrency(getTotalExpenses())}
                </div>
                <div className="text-sm text-muted-foreground">Total Expenses</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getRemaining() >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  ${formatCurrency(Math.abs(getRemaining()))}
                </div>
                <div className="text-sm text-muted-foreground">
                  {getRemaining() >= 0 ? 'Remaining' : 'Over Budget'}
                </div>
              </div>
            </div>
          )}

          {/* Add New Item */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={newItem.category} onValueChange={(value) => setNewItem(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={newItem.planned_cents > 0 ? formatCurrency(newItem.planned_cents) : ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setNewItem(prev => ({ ...prev, planned_cents: Math.round(value * 100) }));
                }}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>

          {/* Budget Items */}
          {budget.items.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Budget Items</h3>
              {budget.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={item.category === 'Income' ? 'default' : 'secondary'}>
                      {item.category}
                    </Badge>
                    <span className="font-medium">
                      ${formatCurrency(item.planned_cents)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Save Button */}
          <Button 
            onClick={saveBudget} 
            disabled={loading || budget.items.length === 0}
            className="w-full"
            size="lg"
          >
            {loading ? "Saving..." : "Save Budget"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}