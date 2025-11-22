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
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isMobile) return;
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
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
      data-section="device-sync" 
      className="relative bg-gray-50 dark:bg-gray-900 transition-colors duration-300" 
      style={{ 
        scrollSnapAlign: 'center', 
        scrollSnapStop: 'always',
        minHeight: 'calc(100vh - 80px)',
        height: 'calc(100vh - 80px + 600px)',
        paddingBottom: 0,
        overflow: 'visible'
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-full px-6" style={{ pointerEvents: 'none' }}>
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-gray-900 dark:text-white">
            Keep track where you left off on any device
          </h2>
          <div className="flex items-center justify-center gap-2">
            <RefreshCw 
              className="w-5 h-5"
              style={{ 
                color: colors.brand.primary,
                animation: 'spin-smooth 4s linear infinite'
              }}
            />
            <p className="text-base font-semibold text-gray-900 dark:text-white">Sync</p>
          </div>
        </div>
      </div>

      {/* Device Screens - Positioned below title */}
      <div className="absolute top-1/2 left-0 right-0 w-full" style={{ height: '600px', overflow: 'hidden', marginTop: '120px', zIndex: 10 }}>
        {/* MacBook */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 transition-transform duration-500 hover:scale-105 z-10"
          style={{ top: '100px', width: '560px', maxWidth: '90vw' }}
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
          className="absolute left-1/2 -translate-x-1/2 bg-gray-800 rounded-[2rem] shadow-2xl z-20 transition-transform duration-500 hover:scale-105"
          style={{ top: '150px', width: '288px', height: '384px', padding: '10px', maxWidth: '70vw' }}
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
          className="absolute left-1/2 -translate-x-1/2 bg-gray-900 rounded-[2.5rem] shadow-2xl z-30 transition-transform duration-500 hover:scale-105"
          style={{ top: '240px', width: '192px', height: '384px', padding: '8px', maxWidth: '50vw' }}
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
          className="absolute transition-transform duration-500 hover:scale-105 z-20"
          style={{ 
            top: '260px',
            right: 'calc(50% - 300px)'
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

      {/* CTA Section - At bottom with gradient background, overlaying bottom of screens */}
      <div 
        className="absolute left-0 right-0 overflow-hidden z-20 flex items-center justify-center"
        style={{ 
          background: 'linear-gradient(to bottom, rgb(139, 92, 246), rgb(59, 130, 246), rgb(34, 197, 94))',
          boxShadow: 'inset 0 20px 40px rgba(0,0,0,0.3), inset 0 40px 80px rgba(0,0,0,0.2), inset 0 60px 120px rgba(0,0,0,0.1), inset 0 80px 160px rgba(0,0,0,0.05)',
          bottom: 0,
          height: 'calc((100vh - 80px) / 2)',
          paddingTop: '100px',
          paddingBottom: '100px'
        }}
      >
        {/* Animated Background Blobs */}
        <div 
          className={`absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full opacity-60 blur-3xl ${isMobile ? '' : 'transition-transform duration-1000 ease-out'}`}
          style={{ 
            transform: `translate(${(isMobile ? animatedPos.x : mousePos.x) * 50}px, ${(isMobile ? animatedPos.y : mousePos.y) * 50}px)`,
          }}
        ></div>
        
        <div 
          className={`absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-500 to-green-700 rounded-full opacity-60 blur-3xl ${isMobile ? '' : 'transition-transform duration-1000 ease-out'}`}
          style={{ 
            transform: `translate(${-(isMobile ? animatedPos.x : mousePos.x) * 50}px, ${-(isMobile ? animatedPos.y : mousePos.y) * 50}px)`,
          }}
        ></div>
        
        <div 
          className={`absolute top-1/2 left-1/4 w-60 h-60 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full opacity-40 blur-2xl ${isMobile ? '' : 'transition-transform duration-700 ease-out'}`}
          style={{ 
            transform: `translate(${(isMobile ? animatedPos.x : mousePos.x) * 30}px, ${(isMobile ? animatedPos.y : mousePos.y) * 30}px)`,
          }}
        ></div>
        
        <div 
          className={`absolute top-1/3 right-1/4 w-60 h-60 bg-gradient-to-br from-green-400 to-green-600 rounded-full opacity-40 blur-2xl ${isMobile ? '' : 'transition-transform duration-700 ease-out'}`}
          style={{ 
            transform: `translate(${-(isMobile ? animatedPos.x : mousePos.x) * 30}px, ${-(isMobile ? animatedPos.y : mousePos.y) * 30}px)`,
          }}
        ></div>
        
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-green-900/20"></div>
        
        {/* Content */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white text-center">
            Keep in touch
          </h2>
          <p className="text-xl mb-8 max-w-2xl text-gray-100 text-center">
            Get updates on new features and be the first to know when we launch.
          </p>
          
          {/* Email Form */}
          <form onSubmit={handleSubmit} className="w-full max-w-md mb-12 relative">
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center justify-center gap-3 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full px-6 py-3 text-white"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="font-medium">Successfully subscribed!</span>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-4 justify-center"
                >
                  <Input
                    id="email-signup"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white/90 backdrop-blur-sm disabled:opacity-50"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-full font-medium transition-all duration-300 border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
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
          <div className="flex justify-center space-x-6">
            <a 
              href="https://x.com/displini_" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300" 
              aria-label="Follow us on X"
            >
              <svg className="w-8 h-8" viewBox="0 0 16 16" fill="currentColor">
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
              <Instagram className="w-8 h-8" />
            </a>
            <a 
              href="https://www.tiktok.com/@displini?lang=en" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300" 
              aria-label="Follow us on TikTok"
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
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
              <Youtube className="w-8 h-8" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
