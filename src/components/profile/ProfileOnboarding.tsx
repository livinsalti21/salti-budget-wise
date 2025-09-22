import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  UserPlus, 
  Crown, 
  Heart,
  HelpCircle,
  CheckCircle,
  ArrowRight,
  Target,
  Clock,
  AlertTriangle,
  Star,
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { hasProAccess } from '@/lib/permissions/hasProAccess';

interface ProfileOnboardingProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  profile: any;
  isSponsor: boolean;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  target?: string;
  actionText?: string;
}

const ONBOARDING_STORAGE_KEY = 'profile_onboarding_completed';

export const ProfileOnboarding: React.FC<ProfileOnboardingProps> = ({
  currentTab,
  onTabChange,
  profile,
  isSponsor
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  const hasPro = hasProAccess(profile);

  // Define onboarding steps based on current tab
  const getTabSteps = (tab: string): OnboardingStep[] => {
    switch (tab) {
      case 'profile':
        return [
          {
            id: 'user-info',
            title: 'Your Profile Overview',
            description: `Welcome! This shows your name, current plan (${hasPro ? profile?.plan : 'Free'}), and edit options. Your plan determines which features you can access.`,
            icon: <User className="h-5 w-5" />
          },
          {
            id: 'invite-friends',
            title: 'Invite Friends & Earn',
            description: 'Share your referral link to invite friends and family. You\'ll earn rewards when they join and start saving!',
            icon: <UserPlus className="h-5 w-5" />
          },
          ...(isSponsor ? [{
            id: 'sponsor-dashboard',
            title: 'Sponsor Dashboard',
            description: 'As a sponsor, you can manage your sponsorships and see the impact you\'re making in the community.',
            icon: <Heart className="h-5 w-5" />
          }] : []),
          ...(!hasPro ? [{
            id: 'upgrade-pro',
            title: 'Upgrade to Pro',
            description: 'Unlock unlimited goals, advanced projections, priority support, and exclusive features designed for serious savers.',
            icon: <Crown className="h-5 w-5" />
          }] : [{
            id: 'manage-billing',
            title: 'Manage Your Billing',
            description: 'View your Pro plan details, payment methods, and billing history. Update your payment info anytime.',
            icon: <CreditCard className="h-5 w-5" />
          }]),
          {
            id: 'help-support',
            title: 'Help & Support',
            description: 'Access FAQs, tutorials, and contact support whenever you need help with your savings journey.',
            icon: <HelpCircle className="h-5 w-5" />
          }
        ];

      case 'settings':
        return [
          {
            id: 'security-auth',
            title: 'Biometric Security',
            description: 'Enable Face ID or Touch ID for secure, quick access to your account. This keeps your financial data protected.',
            icon: <Shield className="h-5 w-5" />
          },
          {
            id: 'projection-settings',
            title: 'Customize Your Projections',
            description: 'Set your expected annual return rate (3-5% conservative, 6-8% moderate, 9-12% aggressive). This affects all future value calculations.',
            icon: <Target className="h-5 w-5" />
          },
          {
            id: 'basic-notifications',
            title: 'Notification Preferences',
            description: 'Configure push notifications and daily save reminders. We recommend 7 PM for optimal engagement.',
            icon: <Bell className="h-5 w-5" />
          }
        ];

      case 'notifications':
        return [
          {
            id: 'notification-permissions',
            title: 'Enable Push Notifications',
            description: 'Allow notifications to stay motivated and never miss important reminders. We\'ll ask for permission first.',
            icon: <Bell className="h-5 w-5" />
          },
          {
            id: 'notification-types',
            title: 'Choose Your Alerts',
            description: 'Payday reminders, round-up alerts, streak protection, and match invites - customize what matters to you.',
            icon: <Star className="h-5 w-5" />
          },
          {
            id: 'quiet-hours',
            title: 'Set Quiet Hours',
            description: 'Configure do-not-disturb periods so notifications only come when convenient for you.',
            icon: <Clock className="h-5 w-5" />
          },
          {
            id: 'frequency-limits',
            title: 'Control Notification Frequency',
            description: 'Set maximum daily (1-3) and weekly (3-7) notification limits to avoid overwhelm while staying engaged.',
            icon: <AlertTriangle className="h-5 w-5" />
          }
        ];

      case 'security':
        return [
          {
            id: 'security-score',
            title: 'Your Security Score',
            description: 'This 0-100 score tracks your account security. Email verification (+15), profile completion (+15), and more boost your score.',
            icon: <Shield className="h-5 w-5" />
          },
          {
            id: 'security-events',
            title: 'Monitor Account Activity',
            description: 'View recent logins, account linking, matches, and other security events. Watch for anything suspicious.',
            icon: <CheckCircle className="h-5 w-5" />
          },
          {
            id: 'account-health',
            title: 'Account Health Indicators',
            description: 'Active accounts with verified emails and linked banks are more secure. We encrypt all connections.',
            icon: <Star className="h-5 w-5" />
          }
        ];

      default:
        return [];
    }
  };

  const currentSteps = getTabSteps(currentTab);

  // Check if onboarding should be shown
  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    const completedTabs = completed ? JSON.parse(completed) : {};
    
    // Show onboarding if:
    // 1. First time user (no completed tabs)
    // 2. First time on this specific tab
    // 3. User has low security score (for security tab)
    // 4. Free user viewing profile (to highlight Pro benefits)
    
    const hasCompletedTab = completedTabs[currentTab];
    const isNewUser = Object.keys(completedTabs).length === 0;
    const hasLowSecurityScore = currentTab === 'security' && (profile?.security_score || 0) < 60;
    const freeUserOnProfile = currentTab === 'profile' && !hasPro;

    setShouldShowOnboarding(
      !hasCompletedTab && (isNewUser || hasLowSecurityScore || freeUserOnProfile)
    );

    if (completedTabs[currentTab]) {
      setCompletedSteps(completedTabs[currentTab]);
    } else {
      setCompletedSteps([]);
    }
  }, [currentTab, profile, hasPro]);

  const handleStartOnboarding = () => {
    setCurrentStepIndex(0);
    setIsOpen(true);
  };

  const handleNextStep = () => {
    const currentStep = currentSteps[currentStepIndex];
    if (currentStep) {
      const newCompleted = [...completedSteps, currentStep.id];
      setCompletedSteps(newCompleted);
      
      // Save to localStorage
      const allCompleted = JSON.parse(localStorage.getItem(ONBOARDING_STORAGE_KEY) || '{}');
      allCompleted[currentTab] = newCompleted;
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(allCompleted));
    }

    if (currentStepIndex < currentSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleCompleteOnboarding();
    }
  };

  const handleCompleteOnboarding = () => {
    setIsOpen(false);
    setShouldShowOnboarding(false);
    
    // Mark tab as fully completed
    const allCompleted = JSON.parse(localStorage.getItem(ONBOARDING_STORAGE_KEY) || '{}');
    allCompleted[currentTab] = currentSteps.map(step => step.id);
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(allCompleted));
  };

  const handleSkip = () => {
    setIsOpen(false);
    setShouldShowOnboarding(false);
  };

  const currentStep = currentSteps[currentStepIndex];
  const progress = currentSteps.length ? ((currentStepIndex + 1) / currentSteps.length) * 100 : 0;

  // Auto-show onboarding for new users or important features
  useEffect(() => {
    if (shouldShowOnboarding && currentSteps.length > 0) {
      // Small delay to let the page settle
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldShowOnboarding, currentSteps.length]);

  if (!currentSteps.length) return null;

  return (
    <>
      {/* Onboarding trigger button - always visible */}
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={handleStartOnboarding}
          size="sm"
          className="rounded-full shadow-lg"
        >
          <HelpCircle className="h-4 w-4 mr-1" />
          Guide
        </Button>
      </div>

      {/* Onboarding Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              {currentStep?.icon}
              <DialogTitle className="text-lg">{currentStep?.title}</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              Step {currentStepIndex + 1} of {currentSteps.length}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            
            <div className="space-y-3">
              <p className="text-sm leading-relaxed">{currentStep?.description}</p>
              
              {/* Show relevant badges for context */}
              <div className="flex gap-2 flex-wrap">
                {currentTab === 'profile' && !hasPro && currentStep?.id === 'upgrade-pro' && (
                  <Badge variant="secondary">Free Plan</Badge>
                )}
                {currentTab === 'security' && (
                  <Badge variant="outline">
                    Security Score: {profile?.security_score || 0}/100
                  </Badge>
                )}
                {currentTab === 'profile' && isSponsor && currentStep?.id === 'sponsor-dashboard' && (
                  <Badge className="bg-primary/10 text-primary">Sponsor</Badge>
                )}
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-4">
              <Button variant="ghost" onClick={handleSkip}>
                Skip Guide
              </Button>
              <div className="flex gap-2">
                <Button onClick={handleNextStep}>
                  {currentStepIndex === currentSteps.length - 1 ? 'Finish' : 'Next'}
                  {currentStepIndex < currentSteps.length - 1 && (
                    <ArrowRight className="h-4 w-4 ml-1" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick tip banner for specific contexts */}
      {!isOpen && shouldShowOnboarding && (
        <Card className="mb-4 border-primary/20 bg-primary/5">
          <CardContent className="py-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {currentTab === 'profile' && 'New to your profile?'}
                  {currentTab === 'settings' && 'Customize your experience'}
                  {currentTab === 'notifications' && 'Stay motivated with smart alerts'}
                  {currentTab === 'security' && 'Secure your account'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Take a quick tour to discover all features
                </p>
              </div>
              <Button size="sm" onClick={handleStartOnboarding}>
                Start Guide
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};