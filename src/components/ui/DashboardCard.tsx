import { Link } from "react-router-dom";

type Props = { 
  to: string; 
  title: string; 
  subtitle?: string; 
  icon?: React.ReactNode; 
  color?: string; 
};

export default function DashboardCard({ to, title, subtitle, icon, color = "bg-card" }: Props) {
  return (
    <Link 
      to={to} 
      className={`block ${color} rounded-2xl shadow-sm border p-4 active:scale-[0.99] transition-all duration-200 hover:shadow-md`}
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-foreground">{title}</div>
          {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}
        </div>
      </div>
    </Link>
  );
}