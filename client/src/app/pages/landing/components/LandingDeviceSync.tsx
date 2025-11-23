import { CheckSquare, RefreshCw } from "lucide-react";
import { colors } from "@/lib/designSystem";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Instagram, Youtube, CheckCircle2, Loader2 } from "lucide-react";

/**
 * Device sync section showing cross-device functionality
 * - MacBook, iPad, iPhone, and Smartwatch mockups
 * - Animated sync icon
 * - Responsive positioning
 * - CTA section integrated at bottom with devices behind it
 */
export function LandingDeviceSync() {
  const [isMobile, setIsMobile] = useState(false);
  const [email, setEmail] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [animatedPos, setAnimatedPos] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);
  const ctaRef = useRef<HTMLDivElement>(null);
  const mousePosRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef<number>();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Parallax scroll effect for CTA section
  useEffect(() => {
    const handleScroll = () => {
      if (ctaRef.current) {
        const rect = ctaRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        // Calculate scroll progress - more sensitive for better parallax effect
        const scrollProgress = Math.max(0, Math.min(1, (windowHeight - rect.top + 200) / (windowHeight + 400)));
        setScrollY(scrollProgress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (ctaRef.current) {
        const rect = ctaRef.current.getBoundingClientRect();
        // Calculate cursor position relative to the CTA section (0 to 1)
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        mousePosRef.current = { x, y };
      } else {
        // Fallback to window-based tracking if ctaRef is not available
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        mousePosRef.current = { x, y };
      }

      // Throttle updates using requestAnimationFrame
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          setMousePos({ ...mousePosRef.current });
          rafRef.current = undefined;
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isMobile]);

  // Animated loop for mobile
  useEffect(() => {
    if (!isMobile) {
      setAnimatedPos({ x: 0, y: 0 });
      return;
    }

    const animate = () => {
      timeRef.current += 0.015;
      const x = Math.sin(timeRef.current) * 0.8;
      const y = Math.cos(timeRef.current * 0.7) * 0.8;
      setAnimatedPos({ x, y });
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMobile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSuccess(false);
    
    setTimeout(() => {
      setIsSuccess(true);
      setEmail('');
      setIsLoading(false);
      
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    }, 800);
  };

  return (
    <section 
      id="keep-track"
      data-section="device-sync" 
      className="relative bg-gray-50 dark:bg-gray-900 transition-colors duration-300" 
      style={{ 
        scrollSnapAlign: 'none', 
        scrollSnapStop: 'normal',
        height: 'calc(100vh - 80px)',
        paddingBottom: 0,
        overflow: 'visible',
        marginBottom: 0,
        marginTop: '-200px',
        position: 'relative',
        display: 'block'
      }}
    >
      <style>{`
        @keyframes spin-smooth {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .spin-smooth-icon {
          animation: spin-smooth 4s linear infinite;
        }
        
        [data-device="smartwatch"] {
          right: calc(50% - 300px);
        }
        
        @media (max-width: 1024px) {
          [data-device="smartwatch"] {
            right: calc(50% - 250px) !important;
          }
        }
        
        @media (max-width: 768px) {
          [data-device="smartwatch"] {
            right: calc(50% - 220px) !important;
          }
        }
        
        @media (max-width: 640px) {
          [data-device="smartwatch"] {
            right: calc(50% - 200px) !important;
          }
        }
      `}</style>

      {/* Title and Sync - Centered in middle of section */}
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 z-40 w-full px-6" style={{ pointerEvents: 'none' }}>
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 pb-4 md:pb-6 text-gray-900 dark:text-white">
            Keep track where you left off on any device
          </h2>
          <div className="flex items-center justify-center gap-2 pb-4 md:pb-6">
            <RefreshCw 
              className="w-5 h-5 spin-smooth-icon"
              style={{ 
                color: colors.brand.primary
              }}
            />
            <p className="text-base font-semibold text-gray-900 dark:text-white">Sync</p>
          </div>
        </div>
      </div>

      {/* Device Screens - Positioned below title, halfway overlapped by CTA */}
      <div className="absolute top-[45%] left-0 right-0 w-full" style={{ height: '600px', overflow: 'visible', zIndex: 20 }}>
        {/* MacBook */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 transition-transform duration-500 hover:scale-105"
          style={{ top: '50px', width: '560px', maxWidth: '90vw', zIndex: 20 }}
        >
          <div className="flex flex-col items-center" style={{ width: '100%' }}>
            <div className="bg-gray-800 rounded-t-2xl shadow-2xl relative" style={{ width: '93%', aspectRatio: '520/320', padding: '8px 8px 0 8px' }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-gray-800 rounded-b-xl z-20"></div>
              <div className="w-full h-full bg-white rounded-t-xl overflow-hidden relative">
                <div className="w-full h-6 bg-gray-200/80 backdrop-blur-sm flex items-center justify-between px-3">
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-semibold text-gray-900">Displini</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gray-400 rounded-sm"></div>
                    <div className="w-3 h-3 bg-gray-400 rounded-sm"></div>
                    <div className="w-3 h-3 bg-gray-400 rounded-sm"></div>
                  </div>
                </div>
                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center -mt-6 pt-6">
                  <div className="flex flex-col items-center gap-2">
                    <CheckSquare className="w-16 h-16" style={{ color: colors.features.todo }} />
                    <div className="text-xs font-semibold text-gray-700">To-Do</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-b from-gray-300 to-gray-400 relative -mt-1" style={{ 
              width: '100%',
              height: '16px',
              clipPath: 'polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
            }}>
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-20 h-1 bg-gray-500 rounded-full opacity-40"></div>
            </div>
          </div>
        </div>

        {/* iPad */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 bg-gray-800 rounded-[2rem] shadow-2xl transition-transform duration-500 hover:scale-105"
          style={{ top: '100px', width: '288px', height: '384px', padding: '10px', maxWidth: '70vw', zIndex: 20 }}
        >
          <div className="w-full h-full bg-white rounded-[1.5rem] overflow-hidden relative">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rounded-full z-20"></div>
            <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center pt-3">
              <div className="flex flex-col items-center gap-2">
                <CheckSquare className="w-14 h-14" style={{ color: colors.features.todo }} />
                <div className="text-[10px] font-semibold text-gray-700">To-Do</div>
              </div>
            </div>
          </div>
        </div>

        {/* iPhone */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 bg-gray-900 rounded-[2.5rem] shadow-2xl transition-transform duration-500 hover:scale-105"
          style={{ top: '150px', width: '192px', height: '384px', padding: '8px', maxWidth: '50vw', zIndex: 20 }}
          data-device="iphone"
        >
          <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-full z-20 flex items-center justify-center gap-3 px-3">
              <div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
            </div>
            <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center pt-8">
              <div className="flex flex-col items-center gap-1">
                <CheckSquare className="w-10 h-10" style={{ color: colors.features.todo }} />
                <div className="text-[8px] font-semibold text-gray-700">To-Do</div>
              </div>
            </div>
          </div>
        </div>

        {/* Smartwatch */}
        <div 
          className="absolute transition-transform duration-500 hover:scale-105"
          style={{ 
            top: '200px',
            right: 'calc(50% - 300px)',
            zIndex: 20
          }}
          data-device="smartwatch"
        >
          <div 
            className="relative bg-gray-800 rounded-[1.5rem] shadow-2xl"
            style={{ width: '96px', height: '128px', padding: '8px' }}
          >
            <div className="absolute rounded-r-md bg-gray-800" style={{ right: '-6px', top: '19px', width: '10px', height: '20px', zIndex: 50 }}></div>
            <div className="bg-white rounded-[1.2rem] overflow-hidden relative" style={{ width: '80px', height: '112px' }}>
              <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100"></div>
            </div>
          </div>
          <div className="absolute rounded-t-lg bg-gray-800" style={{ top: '-16px', left: '50%', transform: 'translateX(-50%)', width: '48px', height: '16px' }}></div>
          <div className="absolute rounded-b-lg bg-gray-800" style={{ bottom: '-16px', left: '50%', transform: 'translateX(-50%)', width: '48px', height: '16px' }}></div>
        </div>
      </div>

      {/* CTA Section - At bottom, overlapping bottom half of screens */}
      <div 
        ref={ctaRef}
        id="keep-in-touch"
        className="absolute left-0 right-0 overflow-hidden z-50 flex items-center justify-center"
        style={{ 
          background: `linear-gradient(to bottom, rgb(139, 92, 246), rgb(59, 130, 246), rgb(34, 197, 94))`,
          boxShadow: 'inset 0 20px 40px rgba(0,0,0,0.5), inset 0 40px 80px rgba(0,0,0,0.4), inset 0 60px 120px rgba(0,0,0,0.3), inset 0 80px 160px rgba(0,0,0,0.2)',
          top: '70%',
          bottom: 0,
          paddingTop: '80px',
          paddingBottom: '60px',
          marginBottom: 0,
          transform: `translateY(${scrollY * -50}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        {/* Multiple Cursor Glow Effects - Follow mouse on desktop, circulate on mobile */}
        {/* Main white glow */}
        <div 
          className="absolute pointer-events-none z-0"
          style={{ 
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.15) 40%, transparent 70%)',
            filter: 'blur(60px)',
            left: '50%',
            top: '50%',
            transform: isMobile 
              ? `translate(${animatedPos.x * 200}px, ${animatedPos.y * 200}px) translate(-50%, -50%)`
              : `translate(${(mousePos.x - 0.5) * 100}%, ${(mousePos.y - 0.5) * 100}%) translate(-50%, -50%)`,
            willChange: 'transform'
          }}
        ></div>
        
        {/* Secondary purple glow */}
        <div 
          className="absolute pointer-events-none z-0"
          style={{ 
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, rgba(139, 92, 246, 0.2) 40%, transparent 70%)',
            filter: 'blur(50px)',
            left: '50%',
            top: '50%',
            transform: isMobile 
              ? `translate(${-animatedPos.x * 150}px, ${animatedPos.y * 150}px) translate(-50%, -50%)`
              : `translate(${-(mousePos.x - 0.5) * 75}%, ${(mousePos.y - 0.5) * 75}%) translate(-50%, -50%)`,
            willChange: 'transform'
          }}
        ></div>
        
        {/* Tertiary blue glow */}
        <div 
          className="absolute pointer-events-none z-0"
          style={{ 
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.15) 40%, transparent 70%)',
            filter: 'blur(45px)',
            left: '50%',
            top: '50%',
            transform: isMobile 
              ? `translate(${animatedPos.x * 120}px, ${-animatedPos.y * 120}px) translate(-50%, -50%)`
              : `translate(${(mousePos.x - 0.5) * 60}%, ${-(mousePos.y - 0.5) * 60}%) translate(-50%, -50%)`,
            willChange: 'transform'
          }}
        ></div>
        
        {/* Green glow */}
        <div 
          className="absolute pointer-events-none z-0"
          style={{ 
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, rgba(34, 197, 94, 0.15) 40%, transparent 70%)',
            filter: 'blur(50px)',
            left: '50%',
            top: '50%',
            transform: isMobile 
              ? `translate(${animatedPos.x * 130}px, ${animatedPos.y * 130}px) translate(-50%, -50%)`
              : `translate(${(mousePos.x - 0.5) * 65}%, ${(mousePos.y - 0.5) * 65}%) translate(-50%, -50%)`,
            willChange: 'transform'
          }}
        ></div>
        
        {/* Small accent glow */}
        <div 
          className="absolute pointer-events-none z-0"
          style={{ 
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 40%, transparent 70%)',
            filter: 'blur(40px)',
            left: '50%',
            top: '50%',
            transform: isMobile 
              ? `translate(${-animatedPos.x * 100}px, ${-animatedPos.y * 100}px) translate(-50%, -50%)`
              : `translate(${-(mousePos.x - 0.5) * 50}%, ${-(mousePos.y - 0.5) * 50}%) translate(-50%, -50%)`,
            willChange: 'transform'
          }}
        ></div>

        {/* Animated Background Blobs with Parallax */}
        <div 
          className={`absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full opacity-60 blur-3xl ${isMobile ? '' : 'transition-transform duration-1000 ease-out'}`}
          style={{ 
            transform: `translate(${(isMobile ? animatedPos.x : mousePos.x) * 50}px, ${(isMobile ? animatedPos.y : mousePos.y) * 50 + scrollY * 50}px)`,
          }}
        ></div>
        
        <div 
          className={`absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-500 to-green-700 rounded-full opacity-60 blur-3xl ${isMobile ? '' : 'transition-transform duration-1000 ease-out'}`}
          style={{ 
            transform: `translate(${-(isMobile ? animatedPos.x : mousePos.x) * 50}px, ${-(isMobile ? animatedPos.y : mousePos.y) * 50 - scrollY * 50}px)`,
          }}
        ></div>
        
        <div 
          className={`absolute top-1/2 left-1/4 w-60 h-60 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full opacity-40 blur-2xl ${isMobile ? '' : 'transition-transform duration-700 ease-out'}`}
          style={{ 
            transform: `translate(${(isMobile ? animatedPos.x : mousePos.x) * 30}px, ${(isMobile ? animatedPos.y : mousePos.y) * 30 + scrollY * 40}px)`,
          }}
        ></div>
        
        <div 
          className={`absolute top-1/3 right-1/4 w-60 h-60 bg-gradient-to-br from-green-400 to-green-600 rounded-full opacity-40 blur-2xl ${isMobile ? '' : 'transition-transform duration-700 ease-out'}`}
          style={{ 
            transform: `translate(${-(isMobile ? animatedPos.x : mousePos.x) * 30}px, ${-(isMobile ? animatedPos.y : mousePos.y) * 30 - scrollY * 40}px)`,
          }}
        ></div>
        
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black/20 to-green-900/30"></div>
        
        {/* Dark Overlay for depth */}
        <div className="absolute inset-0 bg-black/25"></div>
        
        {/* Content */}
        <div className="relative z-50 w-full max-w-4xl mx-auto flex flex-col items-center justify-center px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8" style={{ height: '100%', justifyContent: 'center' }}>
          <h2 className="text-3xl md:text-4xl lg:text-4xl xl:text-4xl font-bold mb-4 md:mb-4 lg:mb-5 text-white text-center">
            Keep in touch
          </h2>
          <p className="text-base md:text-lg lg:text-lg xl:text-lg mb-6 md:mb-6 lg:mb-7 max-w-2xl text-gray-100 text-center px-4">
            Get updates on new features and be the first to know when we launch.
          </p>
          
          {/* Email Form */}
          <form onSubmit={handleSubmit} className="w-full max-w-md lg:max-w-md xl:max-w-md mb-4 md:mb-5 lg:mb-6 relative mx-auto px-4">
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center justify-center gap-2 md:gap-3 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full px-4 md:px-5 lg:px-5 py-2 md:py-2.5 lg:py-2.5 text-sm md:text-sm lg:text-sm text-white"
                >
                  <CheckCircle2 className="w-4 h-4 md:w-4 md:h-4 lg:w-4 lg:h-4 text-green-400" />
                  <span className="font-medium">Successfully subscribed!</span>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center w-full"
                >
                  <Input
                    id="email-signup"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full sm:flex-1 px-3 md:px-3 lg:px-3 py-2 md:py-2.5 lg:py-2.5 text-sm md:text-sm lg:text-sm rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white/90 backdrop-blur-sm disabled:opacity-50"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 md:px-5 lg:px-5 py-2 md:py-2.5 lg:py-2.5 text-sm md:text-sm lg:text-sm rounded-full font-medium transition-all duration-300 border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto sm:min-w-[110px] h-[42px] md:h-[44px] lg:h-[44px] flex items-center justify-center"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Subscribing...</span>
                      </div>
                    ) : (
                      'Subscribe'
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
          
          {/* Social Media Links */}
          <div className="flex justify-center items-center space-x-4 md:space-x-5 lg:space-x-6 flex-wrap gap-3 md:gap-0">
            <a 
              href="https://x.com/displini_" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300" 
              aria-label="Follow us on X"
            >
              <svg className="w-6 h-6 md:w-6 md:h-6 lg:w-6 lg:h-6" viewBox="0 0 16 16" fill="currentColor">
                <path d="M12.6 0.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867 -5.07 -4.425 5.07H0.316l5.733 -6.57L0 0.75h5.063l3.495 4.633L12.601 0.75Zm-0.86 13.028h1.36L4.323 2.145H2.865z"/>
              </svg>
            </a>
            <a 
              href="https://www.instagram.com/displini/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300" 
              aria-label="Follow us on Instagram"
            >
              <Instagram className="w-6 h-6 md:w-6 md:h-6 lg:w-6 lg:h-6" />
            </a>
            <a 
              href="https://www.tiktok.com/@displini?lang=en" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300" 
              aria-label="Follow us on TikTok"
            >
              <svg className="w-6 h-6 md:w-6 md:h-6 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
            <a 
              href="https://www.youtube.com/@Displini" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300" 
              aria-label="Subscribe on YouTube"
            >
              <Youtube className="w-6 h-6 md:w-6 md:h-6 lg:w-6 lg:h-6" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
