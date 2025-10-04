import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import Settings from "@/components/Settings";
import ThemeToggle from "@/components/ThemeToggle";

interface PageHeaderProps {
  title: string;
  onStatsClick?: () => void;
  additionalButtons?: React.ReactNode;
}

export default function PageHeader({ title, onStatsClick, additionalButtons }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
      <h1 className="text-xl font-bold" data-testid="text-page-title">{title}</h1>
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
