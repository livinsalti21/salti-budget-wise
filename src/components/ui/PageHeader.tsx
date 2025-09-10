import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({ 
  title, 
  subtitle, 
  backTo = "/app", 
  actions,
  className = ""
}: PageHeaderProps) {
  return (
    <header className={`sticky top-0 z-10 bg-background/90 backdrop-blur p-4 border-b ${className}`}>
      <div className="flex items-center gap-3 max-w-4xl mx-auto">
        <Link to={backTo}>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-8 w-8 hover:bg-accent/50 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-primary truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}