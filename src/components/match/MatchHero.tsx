import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ArrowRight, DollarSign, TrendingUp, Users, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchHeroProps {
  onInviteClick: () => void;
  className?: string;
}

export function MatchHero({ onInviteClick, className }: MatchHeroProps) {
  return (
    <Card className={cn("bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/15 border-primary/20 overflow-hidden", className)}>
      <CardContent className="p-6">
        {/* Hero Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Double Your Impact</h2>
          <p className="text-muted-foreground">
            Invite family & friends to match your saves. Turn every $5 into $10!
          </p>
        </div>

        {/* Interactive Demo */}
        <div className="bg-background/50 rounded-lg p-4 mb-6 border border-primary/10">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium">You save</p>
              <p className="text-xl font-bold text-primary">$5</p>
            </div>
            
            <div className="flex items-center">
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <Heart className="h-4 w-4 text-red-500 mx-1" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-2">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <p className="text-sm font-medium">Total impact</p>
              <p className="text-xl font-bold text-accent">$10</p>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-xs text-muted-foreground">
              With a 100% match sponsor, your savings double instantly! 🎯
            </p>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs font-medium">Family</p>
            <p className="text-xs text-muted-foreground">Support</p>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <p className="text-xs font-medium">2x Faster</p>
            <p className="text-xs text-muted-foreground">Growth</p>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Gift className="h-5 w-5 text-secondary" />
            </div>
            <p className="text-xs font-medium">Free</p>
            <p className="text-xs text-muted-foreground">Setup</p>
          </div>
        </div>

        {/* Call to Action */}
        <Button 
          onClick={onInviteClick}
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Heart className="h-4 w-4 mr-2" />
          Invite Your First Sponsor
        </Button>
        
        <p className="text-xs text-muted-foreground text-center mt-3">
          Takes 30 seconds • No fees • Cancel anytime
        </p>
      </CardContent>
    </Card>
  );
}