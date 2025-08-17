import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DollarSign, ArrowLeft, ArrowRight } from "lucide-react";

export default function SaveChoose() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [amount, setAmount] = useState(0);
  const [source, setSource] = useState('manual');
  const [pushId, setPushId] = useState<string | null>(null);

  useEffect(() => {
    const defaultCents = parseInt(searchParams.get('default_cents') || '500');
    const sourceParam = searchParams.get('source') || 'manual';
    const pushIdParam = searchParams.get('push_id');

    setAmount(defaultCents);
    setSource(sourceParam);
    setPushId(pushIdParam);
  }, [searchParams]);

  const formatCurrency = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const quickAmounts = [500, 1000, 2000, 5000]; // $5, $10, $20, $50

  const handleSliderChange = (value: number[]) => {
    setAmount(value[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAmount(Math.round(value * 100));
  };

  const continueToConfirm = () => {
    const params = new URLSearchParams({
      amount_cents: amount.toString(),
      source,
    });
    
    if (pushId) {
      params.set('push_id', pushId);
    }

    navigate(`/app/save/confirm?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="max-w-md mx-auto space-y-6 pt-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/app')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Choose Your Amount
            </CardTitle>
            <CardDescription>
              Select how much you'd like to save
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Amount Display */}
            <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
              <div className="text-4xl font-bold text-primary">
                ${formatCurrency(amount)}
              </div>
            </div>

            {/* Quick Amount Chips */}
            <div className="space-y-3">
              <Label>Quick select:</Label>
              <div className="grid grid-cols-2 gap-2">
                {quickAmounts.map(quickAmount => (
                  <Button
                    key={quickAmount}
                    variant={amount === quickAmount ? "default" : "outline"}
                    onClick={() => setAmount(quickAmount)}
                  >
                    ${formatCurrency(quickAmount)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-4">
              <Label>Adjust amount:</Label>
              <Slider
                value={[amount]}
                onValueChange={handleSliderChange}
                max={10000} // $100 max
                min={100}   // $1 min
                step={25}   // 25 cent steps
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$1</span>
                <span>$100</span>
              </div>
            </div>

            {/* Custom Input */}
            <div className="space-y-2">
              <Label htmlFor="custom-amount">Or enter exact amount:</Label>
              <Input
                id="custom-amount"
                type="number"
                step="0.01"
                min="0.01"
                max="1000"
                placeholder="0.00"
                value={amount > 0 ? formatCurrency(amount) : ''}
                onChange={handleInputChange}
              />
            </div>

            {/* Continue Button */}
            <Button
              onClick={continueToConfirm}
              disabled={amount <= 0}
              className="w-full"
              size="lg"
            >
              Continue to Confirm
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}