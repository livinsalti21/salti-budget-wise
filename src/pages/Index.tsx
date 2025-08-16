import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SaveStack from "@/components/SaveStack";
import SaveHistory from "@/components/SaveHistory";
import GameDashboard from "@/components/GameDashboard";
import BudgetTracker from "@/components/BudgetTracker";
import MySaves from "@/components/MySaves";
import HabitTracker from "@/components/HabitTracker";
import { Button } from '@/components/ui/button';
import { PiggyBank, LogOut, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, loading, signOut } = useAuth();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Livin Salti
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Invite Friends
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Build wealth through habits. Celebrate progress. Transform small saves into lifelong gains — together.
          </p>
        </div>

      <Tabs defaultValue="mysaves" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="mysaves">My Saves</TabsTrigger>
          <TabsTrigger value="save">Save & Stack</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="mysaves">
          <MySaves />
        </TabsContent>

        <TabsContent value="save">
          <SaveStack />
        </TabsContent>

        <TabsContent value="habits">
          <HabitTracker />
        </TabsContent>

        <TabsContent value="budget">
          <BudgetTracker />
        </TabsContent>

        <TabsContent value="challenges">
          <GameDashboard />
        </TabsContent>

        <TabsContent value="history">
          <SaveHistory />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default Index;