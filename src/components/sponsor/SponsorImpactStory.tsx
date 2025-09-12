import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, Calendar, Award, Heart, Sparkles } from "lucide-react";

interface SponsorImpactStoryProps {
  sponseeData: {
    name: string;
    totalSaved: number;
    currentStreak: number;
    matchesReceived: number;
    goal: string;
    goalAmount: number;
    startDate: string;
    avatar?: string;
  };
  matchRuleData: {
    totalMatched: number;
    matchPercentage: number;
    weeklyCapCents: number;
  };
}

export function SponsorImpactStory({ sponseeData, matchRuleData }: SponsorImpactStoryProps) {
  const progressPercentage = Math.min((sponseeData.totalSaved / sponseeData.goalAmount) * 100, 100);
  const daysSinceStart = Math.floor((Date.now() - new Date(sponseeData.startDate).getTime()) / (1000 * 60 * 60 * 24));
  const projectedCompletion = sponseeData.totalSaved > 0 ? 
    Math.ceil((sponseeData.goalAmount - sponseeData.totalSaved) / (sponseeData.totalSaved / daysSinceStart)) : 
    null;

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 100) return "🔥 Century Saver!";
    if (streak >= 50) return "🌟 Streak Master!";
    if (streak >= 30) return "💪 Momentum Builder!";
    if (streak >= 14) return "⚡ Getting Strong!";
    if (streak >= 7) return "🚀 Building Habits!";
    return "🌱 Fresh Start!";
  };

  return (
    <div className="space-y-6">
      {/* Hero Impact Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 border-primary/20">
        <CardHeader className="text-center pb-2">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl">Your Impact Story</CardTitle>
          <CardDescription>
            You're transforming {sponseeData.name}'s financial future
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <div className="text-3xl font-bold text-primary">{formatCurrency(matchRuleData.totalMatched)}</div>
              <div className="text-sm text-muted-foreground">You've Contributed</div>
            </div>
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{formatCurrency(sponseeData.totalSaved)}</div>
              <div className="text-sm text-muted-foreground">They've Saved</div>
            </div>
          </div>

          {/* Progress Towards Goal */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold flex items-center gap-2">
                <Target className="w-5 h-5" />
                {sponseeData.goal} Progress
              </h4>
              <Badge variant="secondary">
                {progressPercentage.toFixed(1)}% Complete
              </Badge>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatCurrency(sponseeData.totalSaved)} saved</span>
              <span>{formatCurrency(sponseeData.goalAmount)} goal</span>
            </div>
            {projectedCompletion && (
              <div className="text-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 inline mr-1" />
                Projected completion: {projectedCompletion} days
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Streak & Habits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Habit Building Success
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div>
              <div className="text-2xl font-bold text-orange-600">{sponseeData.currentStreak} days</div>
              <div className="text-sm text-orange-700">Current Streak</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">{getStreakMessage(sponseeData.currentStreak)}</div>
              <div className="text-sm text-muted-foreground">Keep it going!</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{sponseeData.matchesReceived}</div>
              <div className="text-sm text-blue-700">Matches Received</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">{daysSinceStart}</div>
              <div className="text-sm text-green-700">Days on Journey</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Match Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Your Matching Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-muted-foreground">Match Percentage:</span>
              <span className="font-semibold">{matchRuleData.matchPercentage}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-muted-foreground">Weekly Cap:</span>
              <span className="font-semibold">{formatCurrency(matchRuleData.weeklyCapCents)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
              <span className="text-sm text-primary font-medium">Total Impact:</span>
              <span className="font-bold text-primary">{formatCurrency(matchRuleData.totalMatched + sponseeData.totalSaved)}</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
            <h5 className="font-semibold text-green-800 mb-2">Compound Interest Magic</h5>
            <p className="text-sm text-green-700">
              With conservative 7% annual growth, their current savings of {formatCurrency(sponseeData.totalSaved)} 
              could grow to <strong>{formatCurrency(sponseeData.totalSaved * 1.5)}</strong> in just 5 years!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Milestone Celebration */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-6 text-center">
          <Award className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
          <h4 className="font-semibold text-yellow-800 mb-2">Next Milestone</h4>
          <p className="text-sm text-yellow-700">
            {sponseeData.totalSaved < 10000 
              ? `${formatCurrency(10000 - sponseeData.totalSaved)} away from their first $100!`
              : sponseeData.totalSaved < 50000
              ? `${formatCurrency(50000 - sponseeData.totalSaved)} away from $500 milestone!`
              : `${formatCurrency(100000 - sponseeData.totalSaved)} away from $1,000 achievement!`
            }
          </p>
          <Badge variant="secondary" className="mt-2">
            They're {Math.floor(progressPercentage)}% there!
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}