import { ArrowLeft, User, Settings, HelpCircle, LogOut, UserPlus, Crown, Edit3, CreditCard, Bell, Shield, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { hasProAccess } from "@/lib/permissions/hasProAccess";
import SettingsPanel from "@/components/SettingsPanel";
import NotificationCenter from "@/components/NotificationCenter";
import { SecurityDashboard } from "@/components/SecurityDashboard";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isSponsor, setIsSponsor] = useState<boolean>(false);
  const [sponsorLoading, setSponsorLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      loadProfile();
      checkSponsorStatus();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const checkSponsorStatus = async () => {
    if (!user?.email) {
      setSponsorLoading(false);
      return;
    }
    
    try {
      const { data } = await supabase
        .from('sponsors')
        .select('id')
        .eq('email', user.email)
        .single();
      
      setIsSponsor(!!data);
    } catch (error) {
      // If no sponsor record found, that's fine
      setIsSponsor(false);
    } finally {
      setSponsorLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const hasPro = hasProAccess(profile);

  return (
    <div className="pb-20 safe-area-top">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur p-4 border-b">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-primary">Profile</h1>
          <p className="text-sm text-muted-foreground">Account & settings</p>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-1" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-1" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* User Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{profile?.display_name || user?.email || 'User'}</CardTitle>
                    <CardDescription>
                      {hasPro ? `${profile?.plan} Plan` : 'Free Plan'} • Livin Salti Member
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-3">
              <Link to="/referrals">
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center gap-3 py-4">
                    <UserPlus className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">Invite Friends</p>
                      <p className="text-sm text-muted-foreground">Share your referral link and earn rewards</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Sponsor Dashboard Access */}
              {sponsorLoading ? (
                <Card className="animate-pulse">
                  <CardContent className="flex items-center gap-3 py-4">
                    <div className="h-5 w-5 bg-muted rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-32" />
                      <div className="h-3 bg-muted rounded w-48" />
                    </div>
                  </CardContent>
                </Card>
              ) : isSponsor && (
                <Link to="/sponsor">
                  <Card className="hover:bg-primary/10 transition-all duration-200 cursor-pointer border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
                    <CardContent className="flex items-center gap-3 py-4">
                      <Heart className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-primary">Sponsor Dashboard</p>
                        <p className="text-sm text-muted-foreground">Manage your sponsorships and view impact</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}

              {!hasPro ? (
                <Link to="/upgrade">
                  <Card className="hover:bg-primary/10 transition-colors cursor-pointer border-primary/20">
                    <CardContent className="flex items-center gap-3 py-4">
                      <Crown className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-primary">Upgrade to Pro</p>
                        <p className="text-sm text-muted-foreground">Unlock unlimited goals and features</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center gap-3 py-4">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">Manage Billing</p>
                      <p className="text-sm text-muted-foreground">View plans and payment methods</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Link to="/help">
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center gap-3 py-4">
                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">Help & Support</p>
                      <p className="text-sm text-muted-foreground">FAQs, contact us, tutorials</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Card className="border-destructive/20">
                <CardContent className="py-4">
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Version info */}
            <div className="text-center pt-4">
              <p className="text-xs text-muted-foreground">Livin Salti v1.0.0</p>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPanel />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationCenter />
          </TabsContent>

          <TabsContent value="security">
            <SecurityDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}