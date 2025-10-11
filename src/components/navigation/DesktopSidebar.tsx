import { NavLink, useLocation } from "react-router-dom";
import { Home, PiggyBank, Calculator, Heart, User, LogOut, UserPlus, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function DesktopSidebar() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: "/app", icon: Home, label: "Home" },
    { to: "/save", icon: PiggyBank, label: "Save n Stack" },
    { to: "/budget", icon: Calculator, label: "Budget" },
    { to: "/match", icon: Heart, label: "Match" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  const isActive = (path: string) => {
    if (path === "/app") return location.pathname === "/app";
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 bg-background/95 backdrop-blur border-r z-40">
      {/* Logo Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-lg">
            ✌🏽
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Livin Salti
            </h1>
            <p className="text-xs text-muted-foreground">Build your wealth</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                active
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <Separator className="my-4" />

        {/* Streaks Quick Link */}
        <NavLink
          to="/streaks"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            isActive("/streaks")
              ? "bg-orange-500/10 text-orange-600 font-semibold"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          <Flame className="h-5 w-5" />
          <span>Streaks</span>
        </NavLink>
      </nav>

      {/* User Profile & Actions */}
      <div className="p-4 border-t space-y-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-sm">
              {user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email}</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => {/* TODO: Implement invite */}}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Friends
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
