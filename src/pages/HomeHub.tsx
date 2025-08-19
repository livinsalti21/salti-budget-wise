import DashboardCard from "@/components/ui/DashboardCard";
import { PiggyBank, Calculator, TrendingUp, FileSpreadsheet, Upload, Users, Target, Settings, Crown } from "lucide-react";

export default function HomeHub() {
  return (
    <div className="pb-20 safe-area-top"> {/* space for bottom nav */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur p-4 border-b">
        <h1 className="text-2xl font-bold text-primary">Livin Salti</h1>
        <p className="text-sm text-muted-foreground">Save n Stack • Live Your Way</p>
      </header>

      <main className="p-4 space-y-6 max-w-md mx-auto">
        {/* Hero quick actions */}
        <section className="grid grid-cols-2 gap-3">
          <DashboardCard 
            to="/save" 
            title="Save n Stack" 
            subtitle="Auto-save & stack" 
            color="bg-primary/5 border-primary/20" 
            icon={<PiggyBank className="h-5 w-5" />}
          />
          <DashboardCard 
            to="/budget" 
            title="Budget" 
            subtitle="Plan & track" 
            color="bg-success/5 border-success/20" 
            icon={<Calculator className="h-5 w-5" />}
          />
        </section>

        {/* Financial dashboards */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Financial Tools</h2>
          <DashboardCard 
            to="/net-worth" 
            title="Net Worth" 
            subtitle="Live + projected wealth" 
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <DashboardCard 
            to="/goals" 
            title="Goals & Projections" 
            subtitle="Future value calculator" 
            icon={<Target className="h-5 w-5" />}
          />
        </section>

        {/* Social & Community */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Community</h2>
          <DashboardCard 
            to="/groups" 
            title="Groups & Challenges" 
            subtitle="Save together, win together" 
            icon={<Users className="h-5 w-5" />}
          />
          <DashboardCard 
            to="/sponsors" 
            title="Sponsors & Perks" 
            subtitle="Rewards & partnerships" 
            icon={<Crown className="h-5 w-5" />}
          />
        </section>

        {/* Tools & Settings */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Tools</h2>
          <div className="grid grid-cols-2 gap-3">
            <DashboardCard 
              to="/upload" 
              title="Upload" 
              subtitle="Import CSV files" 
              icon={<Upload className="h-4 w-4" />}
            />
            <DashboardCard 
              to="/settings" 
              title="Settings" 
              subtitle="Preferences" 
              icon={<Settings className="h-4 w-4" />}
            />
          </div>
        </section>
      </main>
    </div>
  );
}