import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings, LucideIcon } from "lucide-react";

interface ActionButton {
  icon: LucideIcon;
  onClick: () => void;
  title?: string;
}

interface UniversalContainerProps {
  isEmpty: boolean;
  onAdd: () => void;
  onSettings?: () => void;
  customButtons?: ActionButton[];
  emptyMessage?: string;
  children: ReactNode;
}

/**
 * Universal Container - Single styling for ALL Health/Food/Sport components
 * Follows Menstrual Cycle pattern exactly
 */
export default function UniversalContainer({
  isEmpty,
  onAdd,
  onSettings,
  customButtons = [],
  emptyMessage = "No data yet",
  children
}: UniversalContainerProps) {
  return (
    <>
      {/* Button row below title - Same as Menstrual Cycle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {/* Custom buttons first (e.g., Calendar icon in Menstrual Cycle) */}
          {customButtons.map((btn, idx) => {
            const Icon = btn.icon;
            return (
              <Button
                key={idx}
                size="icon"
                variant="ghost"
                onClick={btn.onClick}
                title={btn.title}
              >
                <Icon className="w-4 h-4" />
              </Button>
            );
          })}
          
          {/* Add button - always show */}
          <Button
            size="icon"
            variant="ghost"
            onClick={onAdd}
            title="Add"
          >
            <Plus className="w-4 h-4" />
          </Button>
          
          {/* Settings button - optional */}
          {onSettings && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onSettings}
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content or Empty State */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Button
            size="icon"
            variant="outline"
            className="h-16 w-16 rounded-full"
            onClick={onAdd}
            title="Add first item"
          >
            <Plus className="w-8 h-8" />
          </Button>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        children
      )}
    </>
  );
}

