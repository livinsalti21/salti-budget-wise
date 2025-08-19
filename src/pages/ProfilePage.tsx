import { ArrowLeft, User, Settings, HelpCircle, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="pb-20 safe-area-top">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur p-4 border-b">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-primary">Profile</h1>
            <p className="text-sm text-muted-foreground">Account & settings</p>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-6">
        {/* User Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{user?.email || 'User'}</CardTitle>
                <CardDescription>Livin Salti Member</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Link to="/settings">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-3 py-4">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">Settings</p>
                  <p className="text-sm text-muted-foreground">Notifications, privacy, and more</p>
                </div>
              </CardContent>
            </Card>
          </Link>

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
      </main>
    </div>
  );
}