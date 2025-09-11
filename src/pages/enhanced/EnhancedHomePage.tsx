import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Users, BookOpen, Sparkles, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileDashboard from '@/components/mobile/MobileDashboard';
import MobileLayout from '@/components/mobile/MobileLayout';
import HabitTracker from '@/components/HabitTracker';
import SuccessStories from '@/components/SuccessStories';
import EducationalContent from '@/components/EducationalContent';
import FutureSelfVisualization from '@/components/FutureSelfVisualization';
import StoryTimeline from '@/components/StoryTimeline';
import MissionClarityBanner from '@/components/MissionClarityBanner';

const EnhancedHomePage = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Mobile-optimized layout
  if (isMobile) {
    return (
      <MobileLayout>
        <div className="space-y-6">
          <MissionClarityBanner />
          <MobileDashboard />
          <HabitTracker />
          <SuccessStories />
        </div>
      </MobileLayout>
    );
  }

  // Desktop layout with enhanced features
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 md:px-6 py-6 space-y-8">
        {/* Mission Clarity Header */}
        <MissionClarityBanner />

        {/* Enhanced Features - Focus on Content */}
        <div className="space-y-6">
          <p className="text-center text-muted-foreground">
            Enhanced features and tools for your financial journey.
          </p>
        </div>

        {/* Enhanced Features Tabs */}
        <Tabs defaultValue="habits" className="space-y-6">
          <div className="relative">
            <TabsList className="flex gap-2 overflow-x-auto whitespace-nowrap [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden scroll-snap-x pb-1 w-max min-w-full bg-transparent">
              <TabsTrigger value="habits" className="scroll-snap-child shrink-0">
                <TrendingUp className="h-4 w-4 mr-2" />
                Habit Tracker
              </TabsTrigger>
              <TabsTrigger value="future" className="scroll-snap-child shrink-0">
                <Sparkles className="h-4 w-4 mr-2" />
                Future Vision
              </TabsTrigger>
              <TabsTrigger value="stories" className="scroll-snap-child shrink-0">
                <Users className="h-4 w-4 mr-2" />
                Success Stories
              </TabsTrigger>
              <TabsTrigger value="education" className="scroll-snap-child shrink-0">
                <BookOpen className="h-4 w-4 mr-2" />
                Learn & Grow
              </TabsTrigger>
              <TabsTrigger value="timeline" className="scroll-snap-child shrink-0">
                <Brain className="h-4 w-4 mr-2" />
                Your Story
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="habits" className="space-y-6">
            <HabitTracker />
          </TabsContent>

          <TabsContent value="future" className="space-y-6">
            <FutureSelfVisualization />
          </TabsContent>

          <TabsContent value="stories" className="space-y-6">
            <SuccessStories />
          </TabsContent>

          <TabsContent value="education" className="space-y-6">
            <EducationalContent />
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <StoryTimeline />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedHomePage;