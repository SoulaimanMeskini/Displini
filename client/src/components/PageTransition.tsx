import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";

interface PageTransitionProps {
  children: React.ReactNode;
}

const tabs = ["/health", "/food", "/todo", "/sport", "/calendar"];

export default function PageTransition({ children }: PageTransitionProps) {
  const [location] = useLocation();
  const prevLocationRef = useRef(location);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (location !== prevLocationRef.current) {
      const currentIndex = tabs.indexOf(location);
      const prevIndex = tabs.indexOf(prevLocationRef.current);
      
      if (currentIndex !== -1 && prevIndex !== -1) {
        // Calculate direction
        const direction = currentIndex > prevIndex ? 'right' : 'left';
        
        // Set animation class based on direction
        setAnimationClass(`slide-${direction}`);
        
        // Clear animation after it completes
        const timer = setTimeout(() => {
          setAnimationClass('');
          prevLocationRef.current = location;
        }, 500);
        
        return () => clearTimeout(timer);
      } else {
        prevLocationRef.current = location;
      }
    }
  }, [location]);

  return (
    <div className="relative w-full overflow-hidden">
      <div
        key={location}
        className={`w-full ${animationClass}`}
        style={{
          animation: animationClass ? `${animationClass === 'slide-right' ? 'slideInFromRight' : 'slideInFromLeft'} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)` : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}

