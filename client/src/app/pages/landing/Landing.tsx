import React, { memo, lazy, Suspense, useState, useEffect } from "react";
import { SEO } from "@/app/components/shared/SEO";
import { colors } from "@/lib/designSystem";
import { useLandingScroll } from "@/hooks/useLandingScroll";
import { Header, LandingHero, LandingFeatures } from "./components";
import { ErrorBoundary } from "@/app/components/shared/ErrorBoundary";

// Lazy load heavy sections for better initial load performance with error handling
const LandingCarousel = lazy(() => import("./components").then(m => ({ default: m.LandingCarousel })).catch(() => ({ default: () => <div /> })));
const LandingQR = lazy(() => import("./components").then(m => ({ default: m.LandingQR })).catch(() => ({ default: () => <div /> })));
const LandingAbout = lazy(() => import("./components").then(m => ({ default: m.LandingAbout })).catch(() => ({ default: () => <div /> })));
const LandingFAQ = lazy(() => import("./components").then(m => ({ default: m.LandingFAQ })).catch(() => ({ default: () => <div /> })));
const LandingDeviceSync = lazy(() => import("./components").then(m => ({ default: m.LandingDeviceSync })).catch(() => ({ default: () => <div /> })));
const LandingCTA = lazy(() => import("./components").then(m => ({ default: m.LandingCTA })).catch(() => ({ default: () => <div /> })));
const LandingFooter = lazy(() => import("./components").then(m => ({ default: m.LandingFooter })).catch(() => ({ default: () => <div /> })));

// Main Landing Component - Memoized for performance
function Landing() {
  // Track scroll position for restoration on reload
  useLandingScroll();
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300" style={{ scrollSnapType: 'y mandatory', height: '100vh', overflowY: 'scroll', paddingTop: '80px' }}>
      <SEO
        title="Stay Focused, Build Better Habits"
        description="Displini helps you build structure, improve your health and routines. Track water intake, sleep schedule, menstrual cycle, medication, workouts, and more."
        keywords="habit tracker, productivity app, health tracker, water intake, sleep schedule, todo list, calendar, menstrual cycle, medication reminder"
        url="https://displini.com"
      />
      <Header />
      
      {/* Main content wrapper for skip link */}
      <main id="main-content">
      <LandingHero />
      <LandingFeatures />
      
      {/* Lazy loaded sections with Suspense boundaries and error boundaries */}
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div></div>}>
        <ErrorBoundary>
          <LandingCarousel />
        </ErrorBoundary>
        <ErrorBoundary>
          <LandingQR />
        </ErrorBoundary>
        <ErrorBoundary>
          <LandingAbout />
        </ErrorBoundary>
        <ErrorBoundary>
          <LandingFAQ />
        </ErrorBoundary>
        <ErrorBoundary>
          <LandingDeviceSync />
        </ErrorBoundary>
        <ErrorBoundary>
          <LandingFooter />
        </ErrorBoundary>
      </Suspense>

      </main>
    </div>
  );
}

// Export memoized version
export default memo(Landing);
