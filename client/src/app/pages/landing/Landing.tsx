import { memo, lazy, Suspense } from "react";
import { MessageSquare } from "lucide-react";
import { SEO } from "@/app/components/shared/SEO";
import { colors } from "@/lib/designSystem";
import { useLandingScroll } from "@/hooks/useLandingScroll";
import { Header, LandingHero, LandingFeatures } from "./components";
import { ErrorBoundary } from "@/app/components/shared/ErrorBoundary";

// Lazy load heavy sections for better initial load performance with error handling
const LandingCarousel = lazy(() => import("./components").then(m => ({ default: m.LandingCarousel })).catch(() => ({ default: () => null })));
const LandingQR = lazy(() => import("./components").then(m => ({ default: m.LandingQR })).catch(() => ({ default: () => null })));
const LandingAbout = lazy(() => import("./components").then(m => ({ default: m.LandingAbout })).catch(() => ({ default: () => null })));
const LandingFAQ = lazy(() => import("./components").then(m => ({ default: m.LandingFAQ })).catch(() => ({ default: () => null })));
const LandingDeviceSync = lazy(() => import("./components").then(m => ({ default: m.LandingDeviceSync })).catch(() => ({ default: () => null })));
const LandingCTA = lazy(() => import("./components").then(m => ({ default: m.LandingCTA })).catch(() => ({ default: () => null })));
const LandingFooter = lazy(() => import("./components").then(m => ({ default: m.LandingFooter })).catch(() => ({ default: () => null })));

// Main Landing Component - Memoized for performance
function Landing() {
  // Track scroll position for restoration on reload
  useLandingScroll();
  
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
          <LandingCTA />
        </ErrorBoundary>
        <ErrorBoundary>
          <LandingFooter />
        </ErrorBoundary>
      </Suspense>

      {/* Sticky Chat Button - BOTTOM LEFT CORNER */}
      <button 
        className="fixed bg-white hover:bg-gray-50 text-gray-900 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 z-50"
        style={{ 
          bottom: '24px',
          left: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)'
        }}
        onClick={() => {
          alert('Chat feature coming soon!');
        }}
        aria-label="Open chat"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
      
      </main>
    </div>
  );
}

// Export memoized version
export default memo(Landing);
