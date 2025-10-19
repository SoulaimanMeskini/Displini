import { format, addDays, subDays, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface DateCarouselProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function DateCarousel({ selectedDate, onDateChange }: DateCarouselProps) {
  const [isSticky, setIsSticky] = useState(false);

  // Load sticky setting from localStorage
  useEffect(() => {
    const savedSticky = localStorage.getItem("stickyDateCarousel") === "true";
    setIsSticky(savedSticky);

    const handleSettingChange = () => {
      const newSticky = localStorage.getItem("stickyDateCarousel") === "true";
      setIsSticky(newSticky);
    };

    window.addEventListener('stickyCarouselSettingChanged', handleSettingChange);
    return () => window.removeEventListener('stickyCarouselSettingChanged', handleSettingChange);
  }, []);

  // Always generate dates with selected date in the middle (3 before, current, 3 after)
  const dates = [
    subDays(selectedDate, 3),
    subDays(selectedDate, 2),
    subDays(selectedDate, 1),
    selectedDate,
    addDays(selectedDate, 1),
    addDays(selectedDate, 2),
    addDays(selectedDate, 3),
  ];

  const handlePrevious = () => {
    onDateChange(subDays(selectedDate, 1));
  };

  const handleNext = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  const isToday = (date: Date) => isSameDay(date, new Date());

  return (
    <div className={`w-full mb-6 ${isSticky ? 'sticky top-16 z-30 bg-background/95 backdrop-blur-sm py-2 -mx-4 px-4' : ''}`}>
      <div className="flex items-center gap-2 sm:gap-3 justify-center">
        {/* Previous button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          className="flex-shrink-0 h-8 w-8 p-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Date container - flex with equal spacing, center item is selected */}
        <div className="flex gap-2 sm:gap-3 flex-1 justify-center items-center">
          {dates.map((date, index) => {
            const isSelected = isSameDay(date, selectedDate);
            const isTodayDate = isToday(date);
            const isCenterPosition = index === 3; // This should always be the selected date

            return (
              <div
                key={date.toISOString()}
                onClick={() => onDateChange(date)}
                className={`
                  w-16 h-16 rounded-2xl cursor-pointer
                  flex flex-col items-center justify-center
                  transition-all duration-300 ease-in-out flex-shrink-0
                  ${isSelected 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'bg-muted hover:bg-muted/80'
                  }
                `}
              >
                  <div className={`text-[9px] sm:text-[10px] font-medium ${isSelected ? 'opacity-80' : 'text-muted-foreground'}`}>
                    {format(date, 'MMM')}
                  </div>
                  <div className={`text-xs sm:text-sm font-semibold ${isSelected ? 'opacity-90' : 'text-muted-foreground'}`}>
                    {format(date, 'EEE')}
                  </div>
                  <div className={`text-xl sm:text-2xl font-bold ${isSelected ? '' : ''}`}>
                    {format(date, 'd')}
                  </div>
                {isTodayDate && !isSelected && (
                  <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
                )}
              </div>
            );
          })}
        </div>

        {/* Next button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          className="flex-shrink-0 h-8 w-8 p-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

