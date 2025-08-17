import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { PiggyBank, LogOut, Users, DollarSign, Target, TrendingUp, Heart, Upload, Store, Settings, Bell, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Onboarding from '@/components/core/Onboarding';
import Dashboard from '@/components/core/Dashboard';
import BudgetInput from '@/components/core/BudgetInput';
import SaveStack from '@/components/core/SaveStack';
import MatchASave from '@/components/MatchASave';
import { BudgetUpload } from '@/components/BudgetUpload';
import TemplateStore from '@/components/TemplateStore';
import SettingsPanel from '@/components/SettingsPanel';
import { ProjectionSettings } from '@/components/ProjectionSettings';
import NotificationCenter from '@/components/NotificationCenter';
import { SecurityDashboard } from '@/components/SecurityDashboard';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [currentSavings, setCurrentSavings] = useState(15000); // $150 in cents

  useEffect(() => {
    // Check if user has completed onboarding
    const completedOnboarding = localStorage.getItem(`onboarding_completed_${user?.id}`);
    setHasCompletedOnboarding(!!completedOnboarding);
    
    if (user && !completedOnboarding) {
      setShowOnboarding(true);
    }
  }, [user]);

  const handleOnboardingComplete = () => {
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
      setHasCompletedOnboarding(true);
      setShowOnboarding(false);
    }
  };

  // Redirect to auth if not logged in
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <div className="text-center">
          <PiggyBank className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Show onboarding for new users
  if (showOnboarding && !hasCompletedOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

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

      <Tabs defaultValue="dashboard" className="space-y-6">
        <div className="relative">
          <TabsList className="flex gap-2 overflow-x-auto whitespace-nowrap [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden scroll-snap-x pb-1 w-max min-w-full bg-transparent">
            <TabsTrigger value="dashboard" className="scroll-snap-child shrink-0">
              <Target className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="save" className="scroll-snap-child shrink-0">
              <PiggyBank className="h-4 w-4 mr-2" />
              Save & Stack
            </TabsTrigger>
            <TabsTrigger value="budget" className="scroll-snap-child shrink-0">
              <DollarSign className="h-4 w-4 mr-2" />
              Budget
            </TabsTrigger>
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
            <TabsTrigger value="projections" className="scroll-snap-child shrink-0">
              <TrendingUp className="h-4 w-4 mr-2" />
              Wealth Growth
            </TabsTrigger>
            <TabsTrigger value="notifications" className="scroll-snap-child shrink-0">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="scroll-snap-child shrink-0">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="settings" className="scroll-snap-child shrink-0">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard">
          <Dashboard />
        </TabsContent>

        <TabsContent value="save">
          <SaveStack />
        </TabsContent>

        <TabsContent value="budget">
          <BudgetInput />
        </TabsContent>

        <TabsContent value="sponsors">
          <MatchASave />
        </TabsContent>

        <TabsContent value="upload">
          <BudgetUpload />
        </TabsContent>

        <TabsContent value="store">
          <TemplateStore />
        </TabsContent>

        <TabsContent value="projections">
          <ProjectionSettings currentSavings={currentSavings} />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationCenter />
        </TabsContent>

        <TabsContent value="security">
          <SecurityDashboard />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsPanel />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default Index;