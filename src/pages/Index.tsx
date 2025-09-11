import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { PiggyBank, LogOut, Users, DollarSign, Target, TrendingUp, Heart, Upload, Store, Settings, Bell, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import MobileDashboard from '@/components/mobile/MobileDashboard';
import MobileLayout from '@/components/mobile/MobileLayout';
import MatchASave from '@/components/MatchASave';
import { BudgetUpload } from '@/components/BudgetUpload';
import TemplateStore from '@/components/TemplateStore';
import NotificationCenter from '@/components/NotificationCenter';
import { SecurityDashboard } from '@/components/SecurityDashboard';
import EnhancedStreaksDashboard from '@/components/EnhancedStreaksDashboard';
import { FloatingSaveButton } from '@/components/ui/FloatingSaveButton';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  const [onboardingStatus, setOnboardingStatus] = useState<'loading' | 'incomplete' | 'complete'>('loading');


  // Check onboarding status when user loads
  useEffect(() => {
    if (user && onboardingStatus === 'loading') {
      checkOnboardingStatus();
    }
  }, [user, onboardingStatus]);

  const checkOnboardingStatus = async () => {
    if (!user) return;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('completed_onboarding')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking onboarding status:', error);
        setOnboardingStatus('incomplete'); // Default to incomplete on error
        return;
      }

      // If profile doesn't exist or onboarding not completed, redirect to onboarding
      setOnboardingStatus(profile?.completed_onboarding ? 'complete' : 'incomplete');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setOnboardingStatus('incomplete');
    }
  };

  // Loading states
  if (loading || onboardingStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <div className="text-center">
          <PiggyBank className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to onboarding if not completed
  if (onboardingStatus === 'incomplete') {
    return <Navigate to="/onboarding" replace />;
  }


  // Mobile-optimized layout
  if (isMobile) {
    return (
      <MobileLayout>
        <div className="space-y-6">
          <MobileDashboard />
        </div>
        {location.pathname === '/app' && <FloatingSaveButton />}
      </MobileLayout>
    );
  }

  // Desktop layout (existing)
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 md:px-6 py-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                <span className="text-lg">✌🏽</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight">
                Livin Salti
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Users className="h-4 w-4 mr-2" />
                Invite Friends
              </Button>
              <Button variant="outline" size="sm" onClick={signOut} className="w-full sm:w-auto">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
            Save smarter, stack faster, live your way. Turn small saves into future wealth — celebrate every step.
          </p>
        </div>

        {/* Main Dashboard - Now Using Tabs */}
        <div className="space-y-6">
          <p className="text-center text-muted-foreground">
            Choose a category below to explore your financial tools and features.
          </p>
        </div>

      <Tabs defaultValue="sponsors" className="space-y-6">
        <div className="relative">
          <TabsList className="flex gap-2 overflow-x-auto whitespace-nowrap [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden scroll-snap-x pb-1 w-max min-w-full bg-transparent">
            <TabsTrigger value="sponsors" className="scroll-snap-child shrink-0">
              <Heart className="h-4 w-4 mr-2" />
              Sponsors
            </TabsTrigger>
            <TabsTrigger value="upload" className="scroll-snap-child shrink-0">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="store" className="scroll-snap-child shrink-0">
              <Store className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="streaks" className="scroll-snap-child shrink-0">
              <Users className="h-4 w-4 mr-2" />
              Streaks
            </TabsTrigger>
            <TabsTrigger value="notifications" className="scroll-snap-child shrink-0">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="scroll-snap-child shrink-0">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="sponsors">
          <MatchASave />
        </TabsContent>

        <TabsContent value="upload">
          <BudgetUpload />
        </TabsContent>

        <TabsContent value="store">
          <TemplateStore />
        </TabsContent>

        <TabsContent value="streaks">
          <EnhancedStreaksDashboard />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationCenter />
        </TabsContent>

        <TabsContent value="security">
          <SecurityDashboard />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default Index;