import { Heart, Utensils, Dumbbell, Calendar, CheckSquare } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function BottomNav() {
  const [location] = useLocation();

  const tabs = [
    { path: "/", label: "Health", icon: Heart },
    { path: "/food", label: "Food", icon: Utensils },
    { path: "/sport", label: "Sport", icon: Dumbbell },
    { path: "/calendar", label: "Calendar", icon: Calendar },
    { path: "/todo", label: "To Do", icon: CheckSquare },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border h-16 flex items-center justify-around px-4 z-50">
      {tabs.map((tab) => {
        const isActive = location === tab.path;
        const Icon = tab.icon;
        
        return (
          <Link
            key={tab.path}
            href={tab.path}
            data-testid={`link-tab-${tab.label.toLowerCase().replace(' ', '-')}`}
          >
            <button
              className={`flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover-elevate"
              }`}
              data-testid={`button-tab-${tab.label.toLowerCase().replace(' ', '-')}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          </Link>
        );
      })}
    </nav>
  );
}
