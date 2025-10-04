import { Card } from "@/components/ui/card";

interface MacroProgressProps {
  current: number;
  target: number;
  label: string;
  unit: string;
}

export default function MacroProgress({ current, target, label, unit }: MacroProgressProps) {
  const remaining = target - current;
  const percentage = (current / target) * 100;
  
  let statusColor = "text-foreground";
  let statusText = `${Math.abs(remaining)}${unit} remaining`;
  
  if (percentage >= 95 && percentage <= 105) {
    statusColor = "text-success";
    statusText = "On target!";
  } else if (percentage > 105 && percentage <= 115) {
    statusColor = "text-warning";
    statusText = `${Math.abs(remaining)}${unit} over`;
  } else if (percentage > 115) {
    statusColor = "text-destructive";
    statusText = `${Math.abs(remaining)}${unit} over`;
  } else if (percentage >= 85 && percentage < 95) {
    statusColor = "text-success";
    statusText = `${Math.abs(remaining)}${unit} to go`;
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="text-right">
          <span className="text-lg font-bold font-mono" data-testid={`text-current-${label.toLowerCase()}`}>
            {current}
          </span>
          <span className="text-sm text-muted-foreground">/{target}{unit}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              percentage >= 95 && percentage <= 105
                ? "bg-success"
                : percentage > 105 && percentage <= 115
                ? "bg-warning"
                : percentage > 115
                ? "bg-destructive"
                : "bg-primary"
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${statusColor} min-w-24 text-right`} data-testid={`text-status-${label.toLowerCase()}`}>
          {statusText}
        </span>
      </div>
    </div>
  );
}
