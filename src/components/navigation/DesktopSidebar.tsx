import { NavLink, useLocation } from "react-router-dom";
import { Home, PiggyBank, Calculator, User, LogOut, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function DesktopSidebar() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: "/app", icon: Home, label: "Home" },
    { to: "/save", icon: PiggyBank, label: "Save" },
    { to: "/budget", icon: Calculator, label: "Budget" },
    { to: "/streaks", icon: Flame, label: "Streaks" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  const isActive = (path: string) => {
    if (path === "/app") return location.pathname === "/app";
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-56 bg-background border-r z-40">
      <div className="p-5 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm">✌🏽</div>
          <h1 className="text-lg font-bold text-foreground">Livin Salti</h1>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t space-y-2">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
              {user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <p className="text-xs text-muted-foreground truncate flex-1">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-destructive text-xs"
          onClick={signOut}
        >
          <LogOut className="h-3.5 w-3.5 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
