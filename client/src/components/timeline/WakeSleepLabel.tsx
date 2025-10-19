import { designTokens } from "@/lib/designTokens";

interface WakeSleepLabelProps {
  text: string;
  position: number;
  isAbove: boolean;
}

export function WakeSleepLabel({ text, position, isAbove }: WakeSleepLabelProps) {
  const offset = isAbove 
    ? designTokens.timeline.wakeSleep.offsetAbove 
    : designTokens.timeline.wakeSleep.offsetBelow;
    
  return (
    <div 
      className="absolute z-40"
      style={{ 
        top: `${position}%`,
        left: '0',
        transform: `translate(-50%, ${offset})`,
      }}
    >
      <span className={`${designTokens.timeline.wakeSleep.fontSize} ${designTokens.timeline.wakeSleep.fontWeight} text-muted-foreground whitespace-nowrap`}>
        {text}
      </span>
    </div>
  );
}

