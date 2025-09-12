import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Trophy, Star, Crown, Flame, Target, Users, TrendingUp } from "lucide-react";

interface SponsorGameificationProps {
  sponsorStats: {
    totalMatched: number;
    activeSponsorees: number;
    totalSavesMatched: number;
    daysSinceFirstSponsorship: number;
    longestSponsorshipDays: number;
    averageMatchAmount: number;
  };
}

const SPONSOR_LEVELS = [
  { name: "Bronze Helper", min: 0, max: 999, icon: Award, color: "text-orange-600 bg-orange-100" },
  { name: "Silver Supporter", min: 1000, max: 4999, icon: Star, color: "text-gray-600 bg-gray-100" },
  { name: "Gold Guardian", min: 5000, max: 9999, icon: Trophy, color: "text-yellow-600 bg-yellow-100" },
  { name: "Platinum Pioneer", min: 10000, max: 24999, icon: Crown, color: "text-purple-600 bg-purple-100" },
  { name: "Diamond Dynasty", min: 25000, max: Infinity, icon: Crown, color: "text-blue-600 bg-blue-100" }
];

const ACHIEVEMENTS = [
  {
    id: "first_match",
    title: "First Match",
    description: "Made your first sponsorship match",
    icon: Target,
    requirement: (stats: any) => stats.totalSavesMatched >= 1,
    rarity: "common"
  },
  {
    id: "century_club",
    title: "Century Club",
    description: "Matched 100 saves",
    icon: Flame,
    requirement: (stats: any) => stats.totalSavesMatched >= 100,
    rarity: "rare"
  },
  {
    id: "generous_heart",
    title: "Generous Heart", 
    description: "Matched over $1,000",
    icon: Award,
    requirement: (stats: any) => stats.totalMatched >= 100000,
    rarity: "epic"
  },
  {
    id: "community_builder",
    title: "Community Builder",
    description: "Sponsor 3+ people simultaneously",
    icon: Users,
    requirement: (stats: any) => stats.activeSponsorees >= 3,
    rarity: "rare"
  },
  {
    id: "loyal_sponsor",
    title: "Loyal Sponsor",
    description: "Sponsor someone for 6+ months",
    icon: Trophy,
    requirement: (stats: any) => stats.longestSponsorshipDays >= 180,
    rarity: "epic"
  },
  {
    id: "growth_catalyst",
    title: "Growth Catalyst",
    description: "Help someone 10x their savings",
    icon: TrendingUp,
    requirement: (stats: any) => stats.totalMatched >= 500000,
    rarity: "legendary"
  }
];

const CHALLENGES = [
  {
    id: "weekly_warrior",
    title: "Weekly Warrior",
    description: "Match 7 saves this week",
    progress: 5,
    target: 7,
    reward: "50 XP",
    endDate: "2024-01-21"
  },
  {
    id: "compound_champion",
    title: "Compound Champion", 
    description: "Help someone reach $500 saved",
    progress: 387,
    target: 500,
    reward: "Achievement Badge",
    endDate: "2024-02-01"
  }
];

export function SponsorGameification({ sponsorStats }: SponsorGameificationProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const getCurrentLevel = () => {
    return SPONSOR_LEVELS.find(level => 
      sponsorStats.totalMatched >= level.min * 100 && 
      sponsorStats.totalMatched < level.max * 100
    ) || SPONSOR_LEVELS[0];
  };

  const getNextLevel = () => {
    const currentLevel = getCurrentLevel();
    const currentIndex = SPONSOR_LEVELS.indexOf(currentLevel);
    return currentIndex < SPONSOR_LEVELS.length - 1 ? SPONSOR_LEVELS[currentIndex + 1] : null;
  };

  const getLevelProgress = () => {
    const currentLevel = getCurrentLevel();
    const progress = sponsorStats.totalMatched - (currentLevel.min * 100);
    const range = (currentLevel.max * 100) - (currentLevel.min * 100);
    return Math.min((progress / range) * 100, 100);
  };

  const getUnlockedAchievements = () => {
    return ACHIEVEMENTS.filter(achievement => achievement.requirement(sponsorStats));
  };

  const getLockedAchievements = () => {
    return ACHIEVEMENTS.filter(achievement => !achievement.requirement(sponsorStats));
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "border-gray-300 bg-gray-50";
      case "rare": return "border-blue-300 bg-blue-50";
      case "epic": return "border-purple-300 bg-purple-50";
      case "legendary": return "border-yellow-300 bg-yellow-50";
      default: return "border-gray-300 bg-gray-50";
    }
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const CurrentLevelIcon = currentLevel.icon;

  return (
    <div className="space-y-6">
      {/* Level & Progress */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <CardHeader className="text-center">
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${currentLevel.color}`}>
            <CurrentLevelIcon className="w-10 h-10" />
          </div>
          <CardTitle className="text-2xl">{currentLevel.name}</CardTitle>
          <CardDescription>
            You've matched {formatCurrency(sponsorStats.totalMatched)} in total
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {nextLevel && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to {nextLevel.name}</span>
                <span>{getLevelProgress().toFixed(1)}%</span>
              </div>
              <Progress value={getLevelProgress()} className="h-3" />
              <div className="text-center text-sm text-muted-foreground">
                {formatCurrency((nextLevel.min * 100) - sponsorStats.totalMatched)} more to next level
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{sponsorStats.activeSponsorees}</div>
              <div className="text-xs text-muted-foreground">Active Sponsees</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{sponsorStats.totalSavesMatched}</div>
              <div className="text-xs text-muted-foreground">Saves Matched</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{sponsorStats.daysSinceFirstSponsorship}</div>
              <div className="text-xs text-muted-foreground">Days Active</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Achievements
          </CardTitle>
          <CardDescription>
            {getUnlockedAchievements().length} of {ACHIEVEMENTS.length} unlocked
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Unlocked Achievements */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">UNLOCKED</h4>
            <div className="grid grid-cols-1 gap-2">
              {getUnlockedAchievements().map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div 
                    key={achievement.id}
                    className={`p-3 rounded-lg border-2 ${getRarityColor(achievement.rarity)} relative`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold">{achievement.title}</h5>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {achievement.rarity}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Locked Achievements */}
          {getLockedAchievements().length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">LOCKED</h4>
              <div className="grid grid-cols-1 gap-2">
                {getLockedAchievements().slice(0, 3).map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <div 
                      key={achievement.id}
                      className="p-3 rounded-lg border border-gray-200 bg-gray-50 opacity-60"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-600">{achievement.title}</h5>
                          <p className="text-sm text-gray-500">{achievement.description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {achievement.rarity}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Active Challenges
          </CardTitle>
          <CardDescription>
            Complete challenges to earn extra rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {CHALLENGES.map((challenge) => (
            <div key={challenge.id} className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">{challenge.title}</h4>
                  <p className="text-sm text-muted-foreground">{challenge.description}</p>
                </div>
                <Badge variant="secondary">{challenge.reward}</Badge>
              </div>
              <div className="space-y-2">
                <Progress value={(challenge.progress / challenge.target) * 100} />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{challenge.progress} / {challenge.target}</span>
                  <span>Ends {challenge.endDate}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}