import { designTokens } from "@/lib/designTokens";

interface TimeLabelProps {
  time: string;
  position: number | string;
  isBold?: boolean;
  withGlow?: boolean;
  zIndex?: number;
  leftOffset?: string;
}

export function TimeLabel({ 
  time, 
  position, 
  isBold = false, 
  withGlow = false,
  zIndex = 40,
  leftOffset = designTokens.timeline.timeLabel.position
}: TimeLabelProps) {
  const positionStyle: any = {};
  
  if (typeof position === 'string') {
    if (position.includes('-')) {
      positionStyle.top = position;
    } else {
      positionStyle.bottom = position;
    }
  } else {
    positionStyle.top = `${position}%`;
  }
  
  return (
    <div 
      className={`absolute z-${zIndex}`}
      style={{ 
        ...positionStyle,
        left: leftOffset,
        transform: 'translateY(-50%)',
      }}
    >
      <div 
        className={`${designTokens.timeline.timeLabel.fontSize} ${designTokens.timeline.timeLabel.fontFamily} ${
          isBold ? 'font-bold text-foreground' : 'text-muted-foreground'
        } whitespace-nowrap ${designTokens.timeline.timeLabel.textAlign} ${designTokens.timeline.timeLabel.width}`}
        style={withGlow ? {
          textShadow: designTokens.shadows.timeLabel.textShadow,
          filter: designTokens.shadows.timeLabel.filter,
        } : undefined}
      >
        {time}
      </div>
    </div>
  );
}

