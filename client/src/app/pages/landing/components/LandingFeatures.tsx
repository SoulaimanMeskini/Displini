import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Bell, CheckSquare, Calendar, Sparkles, Plus, Circle, Clock } from "lucide-react";
import { colors } from "@/lib/designSystem";

/**
 * Interactive feature showcase with tab switching
 * - Shows Reminders, To-Do, Calendar, AI features
 * - Typewriter effect for descriptions
 * - iPhone mockup with glow effects
 * - Wheel event hijacking for smooth tab switching
 */
interface Task {
  id: string;
  title: string;
  time?: string;
  completed: boolean;
  emoji?: string;
}

export function LandingFeatures() {
  const [activeFeature, setActiveFeature] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const lastChangeRef = useRef<number>(0);
  
  // To-Do Demo State
  const [todoTasks, setTodoTasks] = useState<Task[]>([
    { id: '1', title: 'Morning coffee', time: '08:00', completed: false, emoji: '☕' },
    { id: '2', title: 'Team meeting', time: '10:00', completed: false, emoji: '👥' },
  ]);
  
  // Helper to format time for display
  const formatTimeDisplay = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };
  
  // Sort tasks by time and remove duplicates
  const sortedTasks = [...todoTasks]
    .filter((task, index, self) => 
      index === self.findIndex(t => t.title === task.title && t.time === task.time)
    )
    .sort((a, b) => {
      if (!a.time) return 1;
      if (!b.time) return -1;
      return a.time.localeCompare(b.time);
    });
  
  // Helper functions
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const minutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };
  
  // Get start and end times for timeline - always fixed wake-up and bedtime
  const getTimelineRange = () => {
    // Always use fixed wake-up (06:00) and bedtime (23:30) times
    return { start: '06:00', end: '23:30' };
  };
  
  // Calculate timeline positions (percentage from top)
  const getTaskPositionPercent = (time: string, startTime: string, endTime: string) => {
    if (!time) return 0;
    const taskMinutes = timeToMinutes(time);
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const position = ((taskMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
    return Math.max(0, Math.min(100, position));
  };
  
  // Calculate liquid fill percentage
  const calculateFillPercentage = () => {
    if (sortedTasks.length === 0) return 0;
    
    const timelineRange = getTimelineRange();
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = timeToMinutes(timelineRange.start);
    const endMinutes = timeToMinutes(timelineRange.end);
    
    // Calculate fill based on current time relative to timeline range
    if (currentMinutes < startMinutes) return 0;
    if (currentMinutes > endMinutes) return 100;
    
    const fill = ((currentMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
    return Math.max(0, Math.min(100, fill));
  };
  
  const [fillPercentage, setFillPercentage] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [promoWiggle, setPromoWiggle] = useState(false);
  
  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (activeFeature === 1) {
      const percentage = calculateFillPercentage();
      setFillPercentage(percentage);
      // Trigger animation after a short delay
      setTimeout(() => {
        setHasAnimated(true);
      }, 100);
    } else {
      setHasAnimated(false);
      setFillPercentage(0);
    }
  }, [activeFeature, sortedTasks.length, sortedTasks, currentTime]);
  
  const features = [
    {
      id: 'reminders',
      title: 'Reminders',
      description: `Have ideas, tasks, or notes that don't yet fit your schedule?

Write them down in Reminders, your flexible inbox for everything you want to remember.`,
      icon: Bell,
      color: colors.features.reminders
    },
    {
      id: 'todo',
      title: 'To-Do',
      description: `Keep track of tasks in an intuitive timeline that flows like your day.

Plan your time into focused blocks and mark each one complete as you go.`,
      icon: CheckSquare,
      color: colors.features.todo
    },
    {
      id: 'calendar',
      title: 'Calendar',
      description: `Easily manage appointments, meetings and events in one connected calendar.

Never forget a birthday or a call and let Displini's AI automatically add important tasks from your emails.`,
      icon: Calendar,
      color: colors.features.calendar
    },
    {
      id: 'ai',
      title: 'AI Assistant',
      description: `With Displini AI, you can plan, reschedule and structure your entire day in seconds.

The assistant helps you stay balanced from optimizing focus time to rearranging your timeline automatically.`,
      icon: Sparkles,
      color: colors.features.ai
    }
  ];

  const [displayedText, setDisplayedText] = useState(features[0].description);
  const [isTyping, setIsTyping] = useState(false);

  // Typewriter animation
  useEffect(() => {
    setIsTyping(true);
    setDisplayedText('');
    
    const fullText = features[activeFeature].description;
    let currentIndex = 0;
    
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 15);
    
    return () => clearInterval(typingInterval);
  }, [activeFeature]);

  // Improved snap detection with faster activation
  const [canChangeTab, setCanChangeTab] = useState(false);
  const snapCompleteRef = useRef(false);
  
  // Cache viewport height to avoid repeated queries
  const viewportHeightRef = useRef(window.innerHeight);
  
  useEffect(() => {
    // Update viewport height on resize
    const handleResize = () => {
      viewportHeightRef.current = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    
    // Detect when section is centered and stable
    const checkIfCentered = () => {
      if (!sectionRef.current || snapCompleteRef.current) return;
      
      // Batch DOM reads
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = viewportHeightRef.current;
      const isCentered = Math.abs(rect.top + rect.height / 2 - viewportHeight / 2) < 100;
      
      if (isCentered) {
        // Shorter delay for faster response
        setTimeout(() => {
          snapCompleteRef.current = true;
          setCanChangeTab(true);
        }, 500);
      }
    };
    
    // Check less frequently to reduce reflows
    const interval = setInterval(checkIfCentered, 100);
    
    // Fallback timeout - quicker activation
    const fallbackTimer = setTimeout(() => {
      snapCompleteRef.current = true;
      setCanChangeTab(true);
    }, 1500);
    
    return () => {
      clearInterval(interval);
      clearTimeout(fallbackTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Wheel event - change tabs on scroll, lock section in place
  useEffect(() => {
    if (!canChangeTab) return;
    
    const handleWheel = (e: WheelEvent) => {
      if (!sectionRef.current) return;
      
      // Batch DOM reads
      const rect = sectionRef.current.getBoundingClientRect();
      const now = Date.now();
      const viewportHeight = viewportHeightRef.current;
      
      // Strict centering check - section must be centered
      const sectionCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportHeight / 2;
      const isCentered = Math.abs(sectionCenter - viewportCenter) < 100;
      
      if (isCentered) {
        // Prevent rapid changes
        if (now - lastChangeRef.current < 800) {
          e.preventDefault();
          return;
        }
        
        // Require significant scroll
        const scrollThreshold = 40;
        if (Math.abs(e.deltaY) < scrollThreshold) {
          e.preventDefault();
          return;
        }
        
        if (e.deltaY > 0) {
          // Scrolling down
          if (activeFeature < features.length - 1) {
            // Not at last tab - prevent scroll and change tab
            e.preventDefault();
            e.stopPropagation();
            lastChangeRef.current = now;
            setActiveFeature((prev) => prev + 1);
          }
          // At last tab - allow normal scroll to next section
        } else if (e.deltaY < 0) {
          // Scrolling up
          if (activeFeature > 0) {
            // Not at first tab - prevent scroll and change tab
            e.preventDefault();
            e.stopPropagation();
            lastChangeRef.current = now;
            setActiveFeature((prev) => prev - 1);
          }
          // At first tab - allow normal scroll to previous section
        }
      }
    };
    
    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    return () => window.removeEventListener('wheel', handleWheel, { capture: true } as any);
  }, [activeFeature, canChangeTab]);

  return (
    <motion.section 
      ref={sectionRef}
      data-section="interactive-showcase"
      id="features"
      className="px-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300" 
      style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '2rem',
        paddingBottom: '2rem',
        scrollSnapAlign: 'center',
        scrollSnapStop: 'always'
      }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="container mx-auto max-w-7xl w-full">
        {/* Glassmorphic Container */}
        <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl p-8 md:p-12 border border-white/60 shadow-2xl overflow-hidden">
          {/* Gradient glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col lg:grid lg:grid-cols-[300px_1fr_300px] lg:gap-4 lg:items-center">
            {/* Description Text - Bottom on mobile (order-3), Left on desktop */}
            <div className="order-3 mt-6 lg:mt-0 lg:order-1">
              <div className="transition-all duration-300 ease-in-out text-justify">
                <p className="text-gray-600 text-sm md:text-base lg:text-lg leading-relaxed whitespace-pre-line max-w-xs mx-auto lg:mx-0 lg:max-w-none">
                  {displayedText}
                  {isTyping && <span className="animate-pulse">|</span>}
                </p>
              </div>
            </div>

            {/* Center Container - Phone and Buttons */}
            <div className="flex flex-col items-center mx-auto order-2 lg:order-2">
              {/* Feature Buttons - Above Phone on Mobile (order-1), Below on Desktop */}
              <div 
                className="order-1 lg:order-2 flex flex-row gap-2 md:gap-4 w-full max-w-md mb-4 lg:mb-0 lg:mt-8 overflow-x-auto scrollbar-hide pb-2 lg:pb-0 justify-center md:justify-start"
                style={{
                  WebkitOverflowScrolling: 'touch',
                  touchAction: 'pan-y pan-x'
                }}
              >
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  const isTodo = feature.id === 'todo';
                  return (
                    <motion.button
                      key={feature.id}
                      onClick={() => setActiveFeature(index)}
                      className="relative group flex-shrink-0 px-2 md:px-4 py-2 md:py-3 font-medium transition-all duration-300"
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <motion.div 
                        className="flex flex-col items-center gap-1 md:gap-2"
                        animate={{
                          scale: activeFeature === index ? 1.1 : 1,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <IconComponent 
                          className={`transition-all duration-300 ${activeFeature === index ? 'w-5 h-5 md:w-7 md:h-7' : 'w-4 h-4 md:w-6 md:h-6'}`}
                          style={{ color: activeFeature === index ? feature.color : colors.neutral.gray }}
                        />
                        <span 
                          className={`text-xs md:text-sm transition-all duration-300 whitespace-nowrap ${activeFeature === index ? 'font-bold' : 'font-normal'}`}
                          style={{ color: activeFeature === index ? feature.color : colors.text.secondary }}
                        >
                          {feature.title}
                        </span>
                      </motion.div>
                    </motion.button>
                  );
                })}
              </div>

              {/* iPhone Mockup - Center */}
              <div className="order-2 lg:order-1 relative">
                {/* Glow effect behind phone */}
                <div 
                  className="absolute inset-0 rounded-[3rem] blur-3xl opacity-50 transition-all duration-700"
                  style={{ backgroundColor: features[activeFeature].color }}
                ></div>
                
                {/* iPhone Frame */}
                <div className="relative bg-gray-900 rounded-[2.5rem] p-2.5 shadow-2xl mx-auto" style={{ width: '200px', height: '410px', maxWidth: '85vw' }}>
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-3xl z-20"></div>
                  
                  {/* Screen - Reflects dark/light mode */}
                  <div className="relative w-full h-full dark:bg-gray-900 bg-white rounded-[2.5rem] overflow-hidden flex flex-col">
                    {/* Noise texture overlay */}
                    <div 
                      className="absolute inset-0 opacity-[0.15] pointer-events-none z-0"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        backgroundSize: '200px 200px'
                      }}
                    />
                    
                    {/* To-Do Demo Content */}
                    {activeFeature === 1 ? (
                      <div className="relative z-10 flex flex-col h-full bg-gray-50 dark:bg-gray-900">
                        {/* Header */}
                        <div className="px-4 pt-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Today</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                        </div>
                        
                        {/* Timeline Container - Matching App Style */}
                        {(() => {
                          const timelineRange = getTimelineRange();
                          const timelineHeight = 280; // Fixed height to fit in view - further reduced for mobile
                          
                          return (
                            <div className="flex-1 relative overflow-hidden" style={{ paddingLeft: '3rem', paddingRight: '0.5rem', paddingTop: '1.5rem', paddingBottom: '2rem', height: `${timelineHeight}px` }}>
                              {/* Timeline Items Container */}
                              <div className="relative" style={{ height: `${timelineHeight}px` }}>
                                {/* Liquid Timeline Background */}
                                <div className="absolute" style={{ left: '16px', top: '0px', width: '8px', height: `${timelineHeight}px`, zIndex: 0 }}>
                                  {/* Background bar */}
                                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                  {/* Liquid Fill */}
                                  <div 
                                    className="absolute top-0 left-0 w-full bg-blue-500 transition-all duration-1000 ease-out rounded-full"
                                    style={{ 
                                      height: hasAnimated ? `${fillPercentage}%` : '0%',
                                    }}
                                  />
                                </div>
                                
                                {/* Wake-up dot - ON TOP of timeline bar */}
                                {(() => {
                                  const wakeUpPositionPercent = getTaskPositionPercent(timelineRange.start, timelineRange.start, timelineRange.end);
                                  const wakeUpPositionPx = (wakeUpPositionPercent / 100) * timelineHeight;
                                  
                                  return (
                                    <>
                                      {/* Time Label - LEFT of timeline bar */}
                                      <div
                                        className="absolute"
                                        style={{ 
                                          top: `${wakeUpPositionPx}px`,
                                          left: '-60px',
                                          transform: 'translateY(-50%)',
                                          width: '28px',
                                          textAlign: 'right'
                                        }}
                                      >
                                        <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                          {formatTimeDisplay(timelineRange.start)}
                                        </span>
                                      </div>
                                      
                                      {/* Sleep schedule dot - ON TOP of timeline bar (centered) */}
                                      <div
                                        className="absolute"
                                        style={{ 
                                          top: `${wakeUpPositionPx}px`,
                                          left: '16px', // Timeline bar left edge
                                          width: '8px', // Same as timeline bar width
                                          height: '40px', // Dot height
                                          transform: 'translateY(-50%)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          zIndex: 20
                                        }}
                                      >
                                        <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 shadow-lg bg-blue-500 border-blue-600">
                                          <span className="text-white text-xs font-bold">☀️</span>
                                        </div>
                                      </div>
                                    </>
                                  );
                                })()}
                                
                                {/* Bedtime dot - ON TOP of timeline bar */}
                                {(() => {
                                  const bedtimePositionPercent = getTaskPositionPercent(timelineRange.end, timelineRange.start, timelineRange.end);
                                  const bedtimePositionPx = (bedtimePositionPercent / 100) * timelineHeight;
                                  
                                  return (
                                    <>
                                      {/* Time Label - LEFT of timeline bar */}
                                      <div
                                        className="absolute"
                                        style={{ 
                                          top: `${bedtimePositionPx}px`,
                                          left: '-60px',
                                          transform: 'translateY(-50%)',
                                          width: '28px',
                                          textAlign: 'right'
                                        }}
                                      >
                                        <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                          {formatTimeDisplay(timelineRange.end)}
                                        </span>
                                      </div>
                                      
                                      {/* Sleep schedule dot - ON TOP of timeline bar (centered) */}
                                      <div
                                        className="absolute"
                                        style={{ 
                                          top: `${bedtimePositionPx}px`,
                                          left: '16px', // Timeline bar left edge
                                          width: '8px', // Same as timeline bar width
                                          height: '40px', // Dot height
                                          transform: 'translateY(-50%)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          zIndex: 20
                                        }}
                                      >
                                        <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 shadow-lg bg-blue-500 border-blue-600">
                                          <span className="text-white text-xs font-bold">🌙</span>
                                        </div>
                                      </div>
                                    </>
                                  );
                                })()}
                                
                                {/* Current Time Indicator */}
                                {(() => {
                                  const now = currentTime;
                                  const currentHours = now.getHours();
                                  const currentMinutes = now.getMinutes();
                                  const currentTimeStr = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;
                                  const currentPositionPercent = getTaskPositionPercent(currentTimeStr, timelineRange.start, timelineRange.end);
                                  const currentPositionPx = (currentPositionPercent / 100) * timelineHeight;
                                  
                                  // Only show if current time is within timeline range
                                  const startMinutes = timeToMinutes(timelineRange.start);
                                  const endMinutes = timeToMinutes(timelineRange.end);
                                  const currentTotalMinutes = currentHours * 60 + currentMinutes;
                                  
                                  if (currentTotalMinutes < startMinutes || currentTotalMinutes > endMinutes) {
                                    return null;
                                  }
                                  
                                  return (
                                    <>
                                      {/* Current Time Label - LEFT of timeline bar */}
                                      <div
                                        className="absolute"
                                        style={{ 
                                          top: `${currentPositionPx}px`,
                                          left: '-60px',
                                          transform: 'translateY(-50%)',
                                          width: '28px',
                                          textAlign: 'right'
                                        }}
                                      >
                                        <span className="text-[11px] font-mono font-bold text-blue-500 dark:text-blue-400 whitespace-nowrap">
                                          {formatTimeDisplay(currentTimeStr)}
                                        </span>
                                      </div>
                                      
                                      {/* Current Time Dot - ON TOP of timeline bar */}
                                      <div
                                        className="absolute"
                                        style={{ 
                                          top: `${currentPositionPx}px`,
                                          left: '16px', // Timeline bar left edge
                                          width: '8px', // Same as timeline bar width
                                          height: '20px', // Dot height
                                          transform: 'translateY(-50%)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          zIndex: 25
                                        }}
                                      >
                                        <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-gray-900 shadow-lg flex items-center justify-center flex-shrink-0"></div>
                                      </div>
                                    </>
                                  );
                                })()}
                                
                                {/* Tasks - Positioned ON the timeline */}
                                {sortedTasks.map((task, index) => {
                                  if (!task.time) return null;
                                  
                                  const positionPercent = getTaskPositionPercent(task.time, timelineRange.start, timelineRange.end);
                                  const positionPx = (positionPercent / 100) * timelineHeight;
                                  
                                  return (
                                    <div key={task.id}>
                                      {/* Time Label - LEFT of timeline bar (skip for promo task) */}
                                      {task.id !== 'promo-task' && (
                                        <div
                                          className="absolute"
                                          style={{ 
                                            top: `${positionPx}px`,
                                            left: '-40px',
                                            transform: 'translateY(-50%)',
                                            width: '28px',
                                            textAlign: 'right'
                                          }}
                                        >
                                          <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {formatTimeDisplay(task.time)}
                                          </span>
                                        </div>
                                      )}
                                      
                                      {/* Task Card - RIGHT of timeline bar */}
                                      <div
                                        className="absolute"
                                        style={{ 
                                          top: `${positionPx}px`,
                                          left: '32px', // Right of timeline bar: 16px + 8px + 8px spacing
                                          transform: 'translateY(-50%)',
                                          zIndex: task.id === 'promo-task' ? 35 : 30,
                                          pointerEvents: 'auto'
                                        }}
                                      >
                                        {task.id === 'promo-task' ? (
                                          <motion.div
                                            className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-3 border border-blue-400 dark:border-blue-500 shadow-lg"
                                            style={{ maxWidth: '160px' }}
                                            animate={promoWiggle ? {
                                              rotate: [0, -10, 10, -10, 10, 0],
                                              scale: [1, 1.05, 1, 1.05, 1],
                                            } : {}}
                                            transition={{
                                              duration: 0.6,
                                              ease: "easeInOut"
                                            }}
                                          >
                                            <div className="flex flex-col gap-1.5">
                                              <div className="flex items-center gap-1.5">
                                                <span className="text-sm flex-shrink-0">{task.emoji || '🚀'}</span>
                                                <span className="text-xs font-medium text-white">
                                                  {task.title}
                                                </span>
                                              </div>
                                              <a
                                                href="#"
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                                  // Scroll to top or trigger get started action
                                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                className="text-xs font-bold text-white bg-white/20 hover:bg-white/30 rounded px-2 py-1 text-center transition-all"
                                              >
                                                Get started!
                                              </a>
                                            </div>
                                          </motion.div>
                                        ) : (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setTodoTasks(tasks =>
                                                tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t)
                                              );
                                            }}
                                            className={`bg-white dark:bg-gray-800 rounded-lg p-2 border transition-all text-left cursor-pointer ${
                                              task.completed 
                                                ? 'border-gray-200 dark:border-gray-700 opacity-60' 
                                                : 'border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md'
                                            }`}
                                            style={{ maxWidth: '130px' }}
                                          >
                                            <div className="flex items-center gap-1.5">
                                              <span className="text-sm flex-shrink-0">{task.emoji || '📝'}</span>
                                              <span className={`text-xs font-medium truncate ${
                                                task.completed 
                                                  ? 'line-through text-gray-400 dark:text-gray-500' 
                                                  : 'text-gray-900 dark:text-white'
                                              }`}>
                                                {task.title}
                                              </span>
                                              {task.completed && (
                                                <span className="text-blue-500 text-xs flex-shrink-0">✓</span>
                                              )}
                                            </div>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}
                        
                        {/* Floating + Button - Bottom Right */}
                        <div className="absolute bottom-4 right-4 z-20">
                          <button
                            onClick={() => {
                              // Add a demo task
                              const demoTasks = [
                                { title: 'Lunch break', time: '12:00', emoji: '🍽️' },
                                { title: 'Workout', time: '15:00', emoji: '🏋️' },
                                { title: 'Evening reading', time: '20:00', emoji: '📚' },
                              ];
                              
                              // Check if evening reading has been added
                              const eveningReadingAdded = todoTasks.some(t => 
                                t.title === 'Evening reading' && t.time === '20:00'
                              );
                              
                              // Check if all demo tasks have been added
                              const allTasksAdded = demoTasks.every(demoTask =>
                                todoTasks.some(t => t.title === demoTask.title && t.time === demoTask.time)
                              );
                              
                              if (allTasksAdded && eveningReadingAdded) {
                                // Add promotional task after evening reading is shown
                                const promoTask: Task = {
                                  id: 'promo-task',
                                  title: 'Wanna add more tasks?',
                                  time: '19:30',
                                  completed: false,
                                  emoji: '🚀',
                                };
                                
                                // Check if promo task already exists
                                const promoExists = todoTasks.some(t => t.id === 'promo-task');
                                if (!promoExists) {
                                  setTodoTasks([...todoTasks, promoTask]);
                                } else {
                                  // Trigger wiggle animation if promo task already exists
                                  setPromoWiggle(true);
                                  setTimeout(() => setPromoWiggle(false), 600);
                                }
                              } else {
                                // Add tasks in order: lunch break first, then workout, then reading
                                const availableTasks = demoTasks.filter(demoTask =>
                                  !todoTasks.some(t => t.title === demoTask.title && t.time === demoTask.time)
                                );
                                
                                if (availableTasks.length > 0) {
                                  // Priority order: Lunch break -> Workout -> Evening reading
                                  const lunchBreak = availableTasks.find(t => t.title === 'Lunch break');
                                  const workout = availableTasks.find(t => t.title === 'Workout');
                                  const eveningReading = availableTasks.find(t => t.title === 'Evening reading');
                                  
                                  const taskToAdd = lunchBreak || workout || eveningReading || availableTasks[0];
                                  
                                  const newTask: Task = {
                                    id: Date.now().toString(),
                                    title: taskToAdd.title,
                                    time: taskToAdd.time,
                                    completed: false,
                                    emoji: taskToAdd.emoji,
                                  };
                                  setTodoTasks([...todoTasks, newTask]);
                                }
                              }
                            }}
                            className="w-10 h-10 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 hover:scale-110 transition-all flex items-center justify-center flex-shrink-0"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative z-10 flex items-center justify-center h-full">
                        <div className="text-center text-gray-400">
                          <p className="text-sm">Preview coming soon</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Empty third column for balance */}
            <div className="hidden lg:block lg:order-3"></div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

