import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Bell, CheckSquare, Calendar, Sparkles } from "lucide-react";
import { colors } from "@/lib/designSystem";

/**
 * Interactive feature showcase with tab switching
 * - Shows Reminders, To-Do, Calendar, AI features
 * - Typewriter effect for descriptions
 * - iPhone mockup with glow effects
 * - Wheel event hijacking for smooth tab switching
 */
export function LandingFeatures() {
  const [activeFeature, setActiveFeature] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const lastChangeRef = useRef<number>(0);
  
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
  
  useEffect(() => {
    // Detect when section is centered and stable
    const checkIfCentered = () => {
      if (!sectionRef.current || snapCompleteRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const isCentered = Math.abs(rect.top + rect.height / 2 - viewportHeight / 2) < 100;
      
      if (isCentered) {
        // Shorter delay for faster response
        setTimeout(() => {
          snapCompleteRef.current = true;
          setCanChangeTab(true);
        }, 500);
      }
    };
    
    // Check more frequently
    const interval = setInterval(checkIfCentered, 50);
    
    // Fallback timeout - quicker activation
    const fallbackTimer = setTimeout(() => {
      snapCompleteRef.current = true;
      setCanChangeTab(true);
    }, 1500);
    
    return () => {
      clearInterval(interval);
      clearTimeout(fallbackTimer);
    };
  }, []);

  // Wheel event - change tabs on scroll, lock section in place
  useEffect(() => {
    if (!canChangeTab) return;
    
    const handleWheel = (e: WheelEvent) => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const now = Date.now();
      const viewportHeight = window.innerHeight;
      
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
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '8rem',
        paddingBottom: '8rem',
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
                className="order-1 lg:order-2 flex flex-row gap-4 w-full max-w-md mb-6 lg:mb-0 lg:mt-8 overflow-x-auto scrollbar-hide pb-2 lg:pb-0"
                style={{
                  WebkitOverflowScrolling: 'touch',
                  touchAction: 'pan-y pan-x'
                }}
              >
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <button
                      key={feature.id}
                      onClick={() => setActiveFeature(index)}
                      className="relative group flex-shrink-0 px-4 py-3 font-medium transition-all duration-300"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <IconComponent 
                          className={`transition-all duration-300 ${activeFeature === index ? 'w-7 h-7' : 'w-6 h-6'}`}
                          style={{ color: activeFeature === index ? feature.color : colors.neutral.gray }}
                        />
                        <span 
                          className={`text-sm transition-all duration-300 whitespace-nowrap ${activeFeature === index ? 'font-bold' : 'font-normal'}`}
                          style={{ color: activeFeature === index ? feature.color : colors.text.secondary }}
                        >
                          {feature.title}
                        </span>
                      </div>
                    </button>
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
                <div className="relative bg-gray-900 rounded-[2.5rem] p-2.5 shadow-2xl" style={{ width: '280px', height: '570px' }}>
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-3xl z-20"></div>
                  
                  {/* Screen */}
                  <div className="relative w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                    {/* Noise texture overlay */}
                    <div 
                      className="absolute inset-0 opacity-[0.15] pointer-events-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        backgroundSize: '200px 200px'
                      }}
                    />
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

