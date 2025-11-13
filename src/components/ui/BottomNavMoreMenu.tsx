import { useState } from "react";
import { Camera, Calculator, Activity, Trophy, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";

export function BottomNavMoreMenu() {
  const [open, setOpen] = useState(false);

  const features = [
    {
      to: "/save-snaps",
      icon: Camera,
      title: "Save Snaps",
      description: "Capture your savings journey",
      gradient: "from-blue-500/10 to-cyan-500/10",
      border: "border-blue-500/20",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-600",
    },
    {
      to: "/what-if",
      icon: Calculator,
      title: "What If Calculator",
      description: "Model your financial future",
      gradient: "from-purple-500/10 to-pink-500/10",
      border: "border-purple-500/20",
      iconBg: "bg-purple-500/20",
      iconColor: "text-purple-600",
    },
    {
      to: "/habit-heatmap",
      icon: Activity,
      title: "Habit Heatmap",
      description: "Visualize your consistency",
      gradient: "from-green-500/10 to-emerald-500/10",
      border: "border-green-500/20",
      iconBg: "bg-green-500/20",
      iconColor: "text-green-600",
    },
    {
      to: "/challenge-arena",
      icon: Trophy,
      title: "Challenge Arena",
      description: "Compete and win prizes",
      gradient: "from-yellow-500/10 to-orange-500/10",
      border: "border-yellow-500/20",
      iconBg: "bg-yellow-500/20",
      iconColor: "text-yellow-600",
    },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex-1 flex flex-col items-center justify-center text-xs py-2 gap-1 min-h-touch text-muted-foreground">
          <MoreHorizontal className="h-5 w-5" />
          More
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto max-h-[80vh]">
        <SheetHeader>
          <SheetTitle>Explore Features</SheetTitle>
        </SheetHeader>
        <div className="grid gap-3 py-4">
          {features.map((feature) => (
            <Link
              key={feature.to}
              to={feature.to}
              onClick={() => setOpen(false)}
            >
              <Card
                className={`bg-gradient-to-br ${feature.gradient} ${feature.border} hover:shadow-md transition-all duration-200 active:scale-[0.98]`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center`}
                    >
                      <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
