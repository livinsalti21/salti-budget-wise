import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ArrowRight, DollarSign, TrendingUp, Users, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
interface MatchHeroProps {
  onInviteClick: () => void;
  className?: string;
}
export function MatchHero({
  onInviteClick,
  className
}: MatchHeroProps) {
  return <Card className={cn("bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/15 border-primary/20 overflow-hidden", className)}>
      
    </Card>;
}