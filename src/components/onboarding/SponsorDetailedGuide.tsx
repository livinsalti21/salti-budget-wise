// ============================================
// PHASE 6: Sponsor Match Onboarding Guide
// ============================================
// Explains how sponsor matching works (MONEY TRANSFER to user's account)

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, DollarSign, TrendingUp, Receipt, AlertCircle } from 'lucide-react';

export function SponsorDetailedGuide() {
  return (
    <Card className="border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Gift className="h-6 w-6 text-accent" />
          How Sponsor Matching Works
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* What is a Sponsor */}
        <div className="p-4 border border-border rounded-lg bg-card hover:bg-accent/5 transition-colors">
          <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
            <Gift className="h-4 w-4 text-accent" />
            What is a Sponsor?
          </h3>
          <p className="text-sm text-muted-foreground">
            A sponsor (parent, mentor, employer, or organization) <span className="font-semibold text-foreground">adds real money to YOUR account</span> when you save. 
            This accelerates your wealth building.
          </p>
        </div>

        {/* How Matching Works */}
        <div className="p-4 border border-border rounded-lg bg-card hover:bg-accent/5 transition-colors">
          <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-accent" />
            How Matching Works
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-muted/50 rounded-md">
              <p className="text-xs font-mono text-foreground">
                You save: <span className="font-bold text-primary">$20.00</span>
              </p>
              <p className="text-xs font-mono text-muted-foreground mt-1">
                Sponsor matches 50% = <span className="font-bold text-accent">$10.00</span> added to YOUR account
              </p>
              <div className="border-t border-border mt-2 pt-2">
                <p className="text-xs font-mono font-bold text-foreground">
                  Total wealth added: <span className="text-primary">$30.00</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2 p-2 bg-accent/10 rounded text-xs">
              <AlertCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Weekly caps:</span> Sponsors set a maximum match per week (e.g., match up to $25/week)
              </p>
            </div>
          </div>
        </div>

        {/* Your Ledger */}
        <div className="p-4 border border-border rounded-lg bg-card hover:bg-accent/5 transition-colors">
          <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-accent" />
            What is Your Ledger?
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Your ledger tracks every transaction with detailed sources:
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                💰
              </Badge>
              <span className="text-muted-foreground">Your saves</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                🎁
              </Badge>
              <span className="text-muted-foreground">Sponsor matches (shows sponsor name)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                📈
              </Badge>
              <span className="text-muted-foreground">40-year projected value (10% annual return)</span>
            </div>
          </div>
        </div>

        {/* Example Ledger Entry */}
        <div className="p-4 bg-gradient-to-r from-accent/5 to-primary/5 rounded-lg border border-accent/20">
          <p className="text-xs font-semibold mb-2 text-foreground">Example Ledger Entry:</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎁</span>
              <div>
                <p className="text-xs font-semibold text-foreground">Sponsor Match from Microsoft</p>
                <p className="text-xs text-muted-foreground">Matched your $20.00 save</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm font-bold text-accent">+$10.00</p>
                <p className="text-xs text-muted-foreground">40yr: $217</p>
              </div>
            </div>
          </div>
        </div>

        {/* Impact Statement */}
        <div className="p-4 bg-accent/50 rounded-lg border border-accent">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm mb-1">Real Impact:</p>
              <p className="text-xs text-muted-foreground mb-2">
                50% match at $25/week maximum:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Annual impact: <span className="font-bold text-foreground">$1,300</span></li>
                <li>• 10-year value: <span className="font-bold text-foreground">$20,655</span> (with 10% returns)</li>
                <li>• 40-year value: <span className="font-bold text-foreground">$282,130</span> 🚀</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Key Difference */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
          <p className="text-xs font-semibold mb-2 text-foreground">Key Difference:</p>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <span className="font-bold text-primary">•</span>
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Friend Match:</span> You both save to your own accounts (motivation)
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-accent">•</span>
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Sponsor Match:</span> They add money to YOUR account (financial support)
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
