import { NavLink } from "react-router-dom";
import { Home, PiggyBank, Calculator, User } from "lucide-react";

export default function BottomNav() {
  const item = "flex-1 flex flex-col items-center justify-center text-xs py-2 gap-1 min-h-touch";
  const active = ({ isActive }: any) => isActive ? "text-primary font-medium" : "text-muted-foreground";
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 z-50 safe-area-bottom">
      <div className="max-w-md mx-auto h-16 grid grid-cols-4">
        <NavLink to="/" className={(s) => `${item} ${active(s)}`}>
          <Home className="h-5 w-5" />
          Home
        </NavLink>
        <NavLink to="/save" className={(s) => `${item} ${active(s)}`}>
          <PiggyBank className="h-5 w-5" />
          Save
        </NavLink>
        <NavLink to="/budget" className={(s) => `${item} ${active(s)}`}>
          <Calculator className="h-5 w-5" />
          Budget
        </NavLink>
        <NavLink to="/profile" className={(s) => `${item} ${active(s)}`}>
          <User className="h-5 w-5" />
          Profile
        </NavLink>
      </div>
    </nav>
  );
}