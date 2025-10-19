import { useState, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Plus, Settings } from "lucide-react";

interface EnhancedMinimizableCardProps {
  title: string;
  children: React.ReactNode;
  minimized?: boolean;
  onMinimizeChange?: (minimized: boolean) => void;
  className?: string;
  defaultMinimized?: boolean;
  
  // New props for standardized pattern
  isEmpty?: boolean; // Whether the container has no data
  onAdd?: () => void; // Handler for add button
  onSettings?: () => void; // Handler for settings button
  emptyStateComponent?: ReactNode; // Custom empty state (optional)
}

export default function EnhancedMinimizableCard({
  title,
  children,
  minimized = false,
  onMinimizeChange,
  className = "",
  defaultMinimized = false,
  isEmpty = false,
  onAdd,
  onSettings,
  emptyStateComponent,
}: EnhancedMinimizableCardProps) {
  const [internalMinimized, setInternalMinimized] = useState(defaultMinimized);
  
  const isMinimized = onMinimizeChange ? minimized : internalMinimized;
  
  const handleMinimizeToggle = () => {
    if (onMinimizeChange) {
      onMinimizeChange(!isMinimized);
    } else {
      setInternalMinimized(!internalMinimized);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className={`flex flex-row items-center space-y-0 pb-2 ${isMinimized ? 'justify-center' : 'justify-between'}`}>
        <CardTitle className="flex items-center">{title}</CardTitle>
        {!isMinimized && (
          <div className="flex gap-1">
            {/* Add button - only show when content exists */}
            {!isEmpty && onAdd && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onAdd}
                className="h-8 w-8 flex-shrink-0"
                title="Add"
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}
            
            {/* Settings button - only show if provided */}
            {onSettings && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onSettings}
                className="h-8 w-8 flex-shrink-0"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
            
            {/* Minimize button - always show */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMinimizeToggle}
              className="h-8 w-8 flex-shrink-0"
              title="Minimize"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          </div>
        )}
        {isMinimized && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMinimizeToggle}
            className="h-8 w-8 flex-shrink-0 ml-2"
            title="Expand"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>
      {!isMinimized && (
        <CardContent className="relative">
          {isEmpty ? (
            emptyStateComponent || (
              <div className="flex items-center justify-center py-12">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-16 w-16 rounded-full"
                  onClick={onAdd}
                  title="Add item"
                >
                  <Plus className="w-8 h-8" />
                </Button>
              </div>
            )
          ) : (
            children
          )}
        </CardContent>
      )}
    </Card>
  );
}

