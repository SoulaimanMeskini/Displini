interface TimelineDotProps {
  isWakeUp?: boolean;
  isBedTime?: boolean;
  isCompleted?: boolean;
  hasReminder?: boolean;
  onClick?: () => void;
}

export function TimelineDot({ 
  isWakeUp, 
  isBedTime, 
  isCompleted, 
  hasReminder, 
  onClick 
}: TimelineDotProps) {
  const dotSize = isWakeUp || isBedTime ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-3 h-3';
  const bgColor = isCompleted 
    ? 'bg-green-500' 
    : (isWakeUp || isBedTime) 
      ? 'bg-primary' 
      : hasReminder 
        ? 'bg-yellow-500' 
        : 'bg-muted-foreground';
  
  return (
    <button
      className={`${dotSize} rounded-full ${bgColor} border-2 border-background shadow-md transition-all hover:scale-110 flex-shrink-0`}
      onClick={onClick}
      style={{ transform: 'translateX(-50%)' }}
    />
  );
}

