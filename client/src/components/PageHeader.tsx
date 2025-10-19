import { Button } from "@/components/ui/button";
import { BarChart3, LucideIcon } from "lucide-react";
import Settings from "@/components/Settings";
import ThemeToggle from "@/components/ThemeToggle";

interface PageHeaderProps {
  title: string;
  icon?: LucideIcon;
  onStatsClick?: () => void;
  additionalButtons?: React.ReactNode;
}

export default function PageHeader({ title, icon: Icon, onStatsClick, additionalButtons }: PageHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-white/20 dark:border-gray-700/20 px-4 py-3 flex items-center justify-between">
      <h1 className="text-xl font-bold flex items-center gap-2" data-testid="text-page-title">
        {Icon && <Icon className="w-5 h-5" />}
        {title}
      </h1>
      <div className="flex gap-2">
        {additionalButtons}
        {onStatsClick && (
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onStatsClick}
            data-testid="button-monthly-stats"
          >
            <BarChart3 className="w-4 h-4" />
          </Button>
        )}
        <Settings />
        <ThemeToggle />
      </div>
    </header>
  );
}
