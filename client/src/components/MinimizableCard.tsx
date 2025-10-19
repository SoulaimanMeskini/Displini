import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface MinimizableCardProps {
  title: string;
  children: React.ReactNode;
  minimized?: boolean;
  onMinimizeChange?: (minimized: boolean) => void;
  className?: string;
  defaultMinimized?: boolean;
}

export default function MinimizableCard({
  title,
  children,
  minimized = false,
  onMinimizeChange,
  className = "",
  defaultMinimized = false
}: MinimizableCardProps) {
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
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMinimizeToggle}
            className="h-8 w-8 flex-shrink-0"
            title="Minimize"
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
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
          {children}
        </CardContent>
      )}
    </Card>
  );
}
