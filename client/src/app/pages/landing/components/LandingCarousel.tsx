import { useState, useEffect, useRef, useCallback, memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CarouselScrollIndicator } from "@/app/components/shared/CarouselScrollIndicator";
import { CAROUSEL_FEATURES, CAROUSEL } from "../constants";
import { useThrottle } from "../hooks";
import type { CarouselFeature } from "../constants";

/**
 * Dynamic carousel showcasing additional features
 * - Infinite scroll on desktop and mobile
 * - Custom cursor with directional arrows
 * - QR code section below carousel
 * - Drag support on desktop
 */
function LandingCarousel() {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [scrollIndex, setScrollIndex] = useState((CAROUSEL.TOTAL_COPIES / 2) * CAROUSEL_FEATURES.length + 1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const mobileCarouselRef = useRef<HTMLDivElement>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0, show: false });
  const [cursorDirection, setCursorDirection] = useState<'left' | 'right'>('right');
  const cursorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mobileScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseMove = useThrottle((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const direction = x < rect.width / 2 ? 'left' : 'right';
    
    if (direction !== cursorDirection) {
      if (cursorTimeoutRef.current) {
        clearTimeout(cursorTimeoutRef.current);
      }
      cursorTimeoutRef.current = setTimeout(() => {
        setCursorDirection(direction);
      }, 50);
    }
    
    setCursorPosition({ x: e.clientX, y: e.clientY, show: true });
  }, 16); // ~60fps

  const handleMouseLeave = useCallback(() => {
    setCursorPosition((prev) => ({ ...prev, show: false }));
  }, []);

  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cache container width to avoid repeated queries
  const containerWidthRef = useRef<number>(0);
  
  useEffect(() => {
    if (carouselRef.current) {
      containerWidthRef.current = carouselRef.current.offsetWidth;
    }
    const handleResize = () => {
      if (carouselRef.current) {
        containerWidthRef.current = carouselRef.current.offsetWidth;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    if (x < rect.width / 2) {
      setScrollIndex(prev => prev - 1);
      setCurrentIndex((prev) => (prev - 1 + CAROUSEL_FEATURES.length) % CAROUSEL_FEATURES.length);
    } else {
      setScrollIndex(prev => prev + 1);
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_FEATURES.length);
    }
  }, []);

  // Auto-scroll when scrollIndex changes
  useEffect(() => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      const cardWidth = 400 + 24;
      const containerWidth = containerWidthRef.current || container.offsetWidth;
      if (!containerWidthRef.current) containerWidthRef.current = containerWidth;
      const scrollPosition = (scrollIndex * cardWidth) - (containerWidth / 2) + (cardWidth / 2);
      
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
      
      const totalCards = CAROUSEL.TOTAL_COPIES * CAROUSEL_FEATURES.length;
      const safeZoneStart = 5;
      const safeZoneEnd = totalCards - 5;
      
      if (scrollIndex < safeZoneStart || scrollIndex > safeZoneEnd) {
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        
        scrollTimeoutRef.current = setTimeout(() => {
          const middlePosition = (CAROUSEL.TOTAL_COPIES / 2) * CAROUSEL_FEATURES.length + currentIndex;
          setScrollIndex(middlePosition);
          const newScrollPosition = (middlePosition * cardWidth) - (containerWidth / 2) + (cardWidth / 2);
          container.scrollTo({
            left: newScrollPosition,
            behavior: 'auto'
          });
        }, 600);
      }
    }
    
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [scrollIndex, currentIndex]);
  
  // Initialize desktop carousel
  useEffect(() => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      const cardWidth = 400 + 24;
      const containerWidth = containerWidthRef.current || container.offsetWidth;
      if (!containerWidthRef.current) containerWidthRef.current = containerWidth;
      const scrollPosition = (scrollIndex * cardWidth) - (containerWidth / 2) + (cardWidth / 2);
      
      container.scrollTo({
        left: scrollPosition,
        behavior: 'auto'
      });
    }
  }, []);

  // Handle window resize to recalculate carousel position
  useEffect(() => {
    const handleResize = () => {
      if (carouselRef.current) {
        const container = carouselRef.current;
        const cardWidth = CAROUSEL.CARD_WIDTH_DESKTOP + CAROUSEL.CARD_GAP;
        const containerWidth = container.offsetWidth;
        const scrollPosition = (scrollIndex * cardWidth) - (containerWidth / 2) + (cardWidth / 2);
        
        container.scrollTo({
          left: scrollPosition,
          behavior: 'auto'
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [scrollIndex]);

  // Initialize mobile carousel
  useEffect(() => {
    if (!mobileCarouselRef.current) return;

    const container = mobileCarouselRef.current;
    const cardWidth = CAROUSEL.CARD_WIDTH_MOBILE + CAROUSEL.CARD_GAP;
    const totalCards = 10 * CAROUSEL_FEATURES.length;
    const middlePosition = (totalCards / 2) * cardWidth;

    container.scrollLeft = middlePosition;

    // Cache dimensions to avoid repeated queries
    let cachedScrollWidth = container.scrollWidth;
    let cachedClientWidth = container.clientWidth;
    
    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      // Update cache periodically, not on every scroll
      if (mobileScrollTimeoutRef.current === null) {
        cachedScrollWidth = container.scrollWidth;
        cachedClientWidth = container.clientWidth;
      }
      const maxScroll = cachedScrollWidth - cachedClientWidth;

      if (mobileScrollTimeoutRef.current) {
        clearTimeout(mobileScrollTimeoutRef.current);
      }

      mobileScrollTimeoutRef.current = setTimeout(() => {
        if (scrollLeft < cardWidth * 5) {
          container.scrollLeft = middlePosition;
        } else if (scrollLeft > maxScroll - cardWidth * 5) {
          container.scrollLeft = middlePosition;
        }
      }, 150);
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (mobileScrollTimeoutRef.current) {
        clearTimeout(mobileScrollTimeoutRef.current);
      }
    };
  }, []);

  // Handle mobile carousel resize
  useEffect(() => {
    const handleResize = () => {
      if (mobileCarouselRef.current) {
        const container = mobileCarouselRef.current;
        const cardWidth = CAROUSEL.CARD_WIDTH_MOBILE + CAROUSEL.CARD_GAP;
        const totalCards = 10 * CAROUSEL_FEATURES.length;
        const middlePosition = (totalCards / 2) * cardWidth;
        container.scrollLeft = middlePosition;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDragStart = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setScrollLeft(carouselRef.current?.scrollLeft || 0);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDragMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.clientX;
    const walk = (startX - x) * 1.5;
    carouselRef.current.scrollLeft = scrollLeft + walk;
  }, [isDragging, startX, scrollLeft]);

  return (
    <section 
      data-section="carousel" 
      className="flex items-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300 px-6 section-viewport" 
      style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
    >
      <div className="w-full">
        {/* Title */}
        <div className="text-center mb-12 px-6 w-full flex justify-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Not just a generic Timeline!
          </h2>
        </div>

        {/* Desktop Carousel */}
        <div 
          className="relative cursor-none hidden md:block overflow-hidden w-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          style={{ pointerEvents: 'auto' }}
          onWheel={(e) => {
            // Disable sideways scrolling on wide screens (only allow on smaller screens)
            const isWideScreen = window.innerWidth >= 1024; // lg breakpoint
            if (isWideScreen) {
              return; // Don't prevent default or handle wheel on wide screens
            }
            
            // Capture scroll anywhere in carousel area (only on smaller screens)
            if (carouselRef.current) {
              e.preventDefault();
              e.stopPropagation();
              
              // Throttle scroll updates for better performance using requestAnimationFrame
              if (carouselRef.current.dataset.scrolling === 'true') return;
              carouselRef.current.dataset.scrolling = 'true';
              
              const scrollContainer = carouselRef.current;
              const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
              // Reduce sensitivity for smoother scrolling
              const scrollAmount = delta * 0.3;
              
              requestAnimationFrame(() => {
                if (scrollContainer) {
                  scrollContainer.scrollBy({
                    left: scrollAmount,
                    behavior: 'auto' // Use auto for instant scrolling, smoother performance
                  });
                  scrollContainer.dataset.scrolling = 'false';
                }
              });
            }
          }}
        >
          {/* Custom Cursor */}
          {cursorPosition.show && (
            <div 
              className="fixed w-12 h-12 rounded-full pointer-events-none z-50 flex items-center justify-center transition-opacity duration-200"
              style={{ 
                left: cursorPosition.x - 24, 
                top: cursorPosition.y - 24,
                backgroundColor: colors.neutral.charcoal,
                transition: 'opacity 0.2s ease'
              }}
            >
              <div className="transition-transform duration-300 ease-out">
                {cursorDirection === 'left' ? (
                  <ChevronLeft className="w-6 h-6 text-white transition-all duration-300" />
                ) : (
                  <ChevronRight className="w-6 h-6 text-white transition-all duration-300" />
                )}
              </div>
            </div>
          )}

          {/* Carousel Container */}
          <div 
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-8 pt-4"
            style={{ 
              scrollBehavior: 'auto',
              paddingLeft: 'calc(50vw - 200px)',
              paddingRight: 'calc(50vw - 200px)',
              overflowY: 'visible',
              willChange: 'scroll-position'
            }}
            onMouseDown={handleDragStart}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onMouseMove={handleDragMove}
          >
            {Array.from({ length: CAROUSEL.TOTAL_COPIES }).flatMap(() => CAROUSEL_FEATURES).map((feature, idx) => {
              const IconComponent = feature.icon;
              
              return (
                <div
                  key={`${feature.title}-${idx}`}
                  className="flex-shrink-0 w-[400px] bg-white/60 backdrop-blur-xl rounded-3xl p-10 border border-white/80 transition-all duration-500 shadow-xl select-none"
                >
                  <div 
                    className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500"
                    style={{ backgroundColor: `${feature.color}20` }}
                  >
                    <IconComponent className="w-12 h-12" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4 select-none">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-base leading-relaxed select-none">
                    {feature.description}
                  </p>
                  <div 
                    className="mt-6 h-1 rounded-full"
                    style={{ background: `linear-gradient(90deg, ${feature.color}, transparent)` }}
                  ></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative">
          <div 
            ref={mobileCarouselRef}
            className="overflow-x-auto scrollbar-hide w-full"
            style={{ 
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-x',
              overscrollBehaviorX: 'contain',
              overscrollBehaviorY: 'auto',
              scrollBehavior: 'auto',
              willChange: 'scroll-position'
            }}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              const startX = touch.clientX;
              const startY = touch.clientY;
              
              const handleTouchMove = (moveEvent: TouchEvent) => {
                const moveTouch = moveEvent.touches[0];
                const deltaX = Math.abs(moveTouch.clientX - startX);
                const deltaY = Math.abs(moveTouch.clientY - startY);
                
                // If horizontal movement is greater, prevent vertical scroll
                if (deltaX > deltaY && deltaX > 10) {
                  moveEvent.preventDefault();
                }
              };
              
              const handleTouchEnd = () => {
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);
              };
              
              document.addEventListener('touchmove', handleTouchMove, { passive: false });
              document.addEventListener('touchend', handleTouchEnd);
            }}
          >
            <div className="flex gap-6 pb-6" style={{ 
              paddingLeft: 'calc(50vw - 140px)',
              paddingRight: 'calc(50vw - 140px)'
            }}>
              {Array.from({ length: 10 }).flatMap(() => CAROUSEL_FEATURES).map((feature, idx) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={`${feature.title}-mobile-${idx}`}
                    className="flex-shrink-0 w-[280px] bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/80 shadow-lg select-none"
                  >
                    <div 
                      className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                      style={{ backgroundColor: `${feature.color}20` }}
                    >
                      <IconComponent className="w-10 h-10" style={{ color: feature.color }} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 select-none">{feature.title}</h3>
                    <p className="text-gray-600 text-base leading-relaxed select-none">{feature.description}</p>
                    <div 
                      className="mt-6 h-1 rounded-full"
                      style={{ background: `linear-gradient(90deg, ${feature.color}, transparent)` }}
                    ></div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Horizontal Scroll Indicator */}
          <CarouselScrollIndicator />
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}      </style>
    </section>
  );
}

// Memoize component for performance
export const LandingCarouselMemo = memo(LandingCarousel);
export { LandingCarouselMemo as LandingCarousel };

