import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PiggyBank, GraduationCap, Users, Banknote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ModeSelectProps {
  onModeSelect: (mode: 'standard' | 'educational', hasParentConsent?: boolean) => void;
}

export default function ModeSelect({ onModeSelect }: ModeSelectProps) {
  const [selectedMode, setSelectedMode] = useState<'standard' | 'educational' | null>(null);
  const [hasParentConsent, setHasParentConsent] = useState(false);

  const handleContinue = () => {
    if (selectedMode) {
      onModeSelect(selectedMode, selectedMode === 'educational' ? hasParentConsent : undefined);
    }
  };

  const canContinue = selectedMode && (selectedMode === 'standard' || hasParentConsent);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <PiggyBank className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Livin Salti
            </h1>
          </div>
          <h2 className="text-2xl font-semibold mb-2">How do you want to start?</h2>
          <p className="text-muted-foreground">Choose the experience that's right for you</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedMode === 'standard' 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => setSelectedMode('standard')}
          >
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Banknote className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Ready for Real Money</CardTitle>
              <CardDescription>Full financial features with actual accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Link real bank accounts</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Save and invest real money</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Connect with family & friends</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Track actual financial progress</span>
                </div>
              </div>
              <Badge variant="secondary" className="w-full justify-center">
                Full Access
              </Badge>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedMode === 'educational' 
                ? 'ring-2 ring-accent border-accent' 
                : 'hover:border-accent/50'
            }`}
            onClick={() => setSelectedMode('educational')}
          >
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-accent to-success rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Practice & Learn First</CardTitle>
              <CardDescription>Safe demo environment to build habits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-sm">Demo wallet with simulated money</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-sm">Practice saving & budgeting habits</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-sm">Family encouragement & support</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-sm">See future value projections</span>
                </div>
              </div>
              <Badge variant="outline" className="w-full justify-center border-accent text-accent">
                <GraduationCap className="h-3 w-3 mr-1" />
                Learning Mode
              </Badge>
            </CardContent>
          </Card>
        </div>

        {selectedMode === 'educational' && (
          <Card className="mb-6 border-accent/20 bg-accent/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Checkbox 
                  id="parent-consent"
                  checked={hasParentConsent}
                  onCheckedChange={(checked) => setHasParentConsent(checked as boolean)}
                />
                <div className="space-y-2">
                  <label 
                    htmlFor="parent-consent" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    I have family support or permission to use Livin Salti
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Practice Mode uses simulated balances only. No real money moves.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center space-y-4">
          <Button 
            onClick={handleContinue}
            disabled={!canContinue}
            size="lg"
            className="min-w-[200px]"
          >
            Continue
          </Button>
          
          <p className="text-xs text-muted-foreground">
            You can switch to Real Money mode later when you're ready.
          </p>
          
          <p className="text-xs text-muted-foreground">
            By continuing you agree to our{' '}
            <a href="/legal/terms" className="text-primary hover:underline">Terms</a>{' '}
            and{' '}
            <a href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}