import { Coffee, ShoppingBag, Car, Heart, PiggyBank, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SaveHistory from "@/components/SaveHistory";
import { ProjectionSettings } from "@/components/ProjectionSettings";

const skippedPurchases = [
  { id: 'coffee', name: 'Coffee', icon: Coffee, amount: 5.50 },
  { id: 'lunch', name: 'Lunch out', icon: ShoppingBag, amount: 12.00 },
  { id: 'rideshare', name: 'Rideshare', icon: Car, amount: 15.00 },
  { id: 'impulse', name: 'Impulse buy', icon: ShoppingBag, amount: 8.00 },
];

export default function SavePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPurchase, setSelectedPurchase] = useState(skippedPurchases[0]);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSavings, setCurrentSavings] = useState(15000); // $150 in cents

  const calculateFutureValue = (amount: number) => {
    const annualRate = 0.08;
    const years = 30;
    const futureValue = amount * Math.pow(1 + annualRate, years);
    return futureValue;
  };

  const handleSave = async () => {
    if (!user) return;

    const amount = customAmount ? parseFloat(customAmount) : selectedPurchase.amount;
    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get user's first stacklet or create a default one
      let { data: stacklets } = await supabase
        .from('stacklets')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      let stackletId;
      if (!stacklets || stacklets.length === 0) {
        // Create a default stacklet
        const { data: newStacklet, error: stackletError } = await supabase
          .from('stacklets')
          .insert({
            user_id: user.id,
            title: 'General Savings',
            target_cents: 100000, // $1000 default
            emoji: '💰'
          })
          .select('id')
          .single();
        
        if (stackletError) throw stackletError;
        stackletId = newStacklet.id;
      } else {
        stackletId = stacklets[0].id;
      }

      const { error } = await supabase
        .from('save_events')
        .insert({
          user_id: user.id,
          stacklet_id: stackletId,
          amount_cents: Math.round(amount * 100),
          reason: selectedPurchase.name,
          source: 'manual'
        });

      if (error) throw error;

      // Navigate to confirmation page with amount and future value
      navigate(`/save/confirm?amount=${amount}&future=${calculateFutureValue(amount).toFixed(0)}&reason=${selectedPurchase.name}`);
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "Error",
        description: "Failed to save your progress",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const displayAmount = customAmount ? parseFloat(customAmount) : selectedPurchase.amount;
  const futureValue = calculateFutureValue(displayAmount);

  return (
    <div>
      <PageHeader 
        title="Save n Stack" 
        subtitle="Save, track, and grow your wealth"
        backTo="/app"
      />

      <main className="p-4 max-w-md mx-auto">
        <Tabs defaultValue="save" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="save">Save</TabsTrigger>
            <TabsTrigger value="history">
              <PiggyBank className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="growth">
              <TrendingUp className="h-4 w-4 mr-2" />
              Growth
            </TabsTrigger>
          </TabsList>

          <TabsContent value="save" className="space-y-6">
            {/* Choose skipped purchase */}
            <section className="space-y-3">
              <h2 className="font-semibold">Choose what you skipped:</h2>
              <div className="grid grid-cols-2 gap-3">
                {skippedPurchases.map((purchase) => (
                  <Card 
                    key={purchase.id}
                    className={`cursor-pointer transition-all ${
                      selectedPurchase.id === purchase.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-accent/50'
                    }`}
                    onClick={() => setSelectedPurchase(purchase)}
                  >
                    <CardContent className="text-center py-4">
                      <purchase.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="font-medium">{purchase.name}</p>
                      <p className="text-sm text-muted-foreground">${purchase.amount.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Custom amount */}
            <section className="space-y-3">
              <Label htmlFor="customAmount">Or enter custom amount:</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="customAmount"
                  type="number"
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="pl-8"
                  placeholder="0.00"
                />
              </div>
            </section>

            {/* Impact preview */}
            <Card className="bg-accent/10 border-accent/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-accent" />
                  Future Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Saving <span className="font-semibold text-success">${displayAmount.toFixed(2)}</span> today becomes:
                </p>
                <p className="text-xl sm:text-2xl font-bold text-accent">
                  ${futureValue.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  in 30 years (8% annual return)
                </p>
              </CardContent>
            </Card>

            {/* Save button */}
            <Button 
              onClick={handleSave} 
              className="w-full h-12 text-lg"
              disabled={loading || displayAmount <= 0}
            >
              {loading ? 'Saving...' : `Save $${displayAmount.toFixed(2)}`}
            </Button>

            {/* Match save option (placeholder for Phase 2) */}
            <Card className="bg-muted/30">
              <CardContent className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  💝 Match Save feature coming soon - invite friends to match your saves!
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <SaveHistory />
          </TabsContent>

          <TabsContent value="growth">
            <ProjectionSettings currentSavings={currentSavings} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}