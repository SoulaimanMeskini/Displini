import { ChevronDown } from "lucide-react";
import { colors } from "@/lib/designSystem";

/**
 * Hero section for landing page
 * - Full-screen hero with curved video
 * - App store icons
 * - Tagline and description
 * - Scroll indicator
 */
export function LandingHero() {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[calc(100vh-80px)] md:min-h-screen overflow-hidden dark:bg-gray-900" style={{ scrollSnapAlign: 'start' }}>
      {/* Video with Outward Curved Bottom */}
      <div className="relative w-full h-96 md:h-[500px] lg:h-[600px]">
        <video 
          className="w-full h-full object-cover"
          autoPlay 
          muted 
          loop 
          playsInline
          preload="metadata"
          width="1920"
          height="1080"
          aria-label="Displini app demonstration video showing productivity and health tracking features"
          style={{
            clipPath: 'ellipse(120% 100% at 50% 0%)',
            WebkitClipPath: 'ellipse(120% 100% at 50% 0%)',
            backgroundColor: colors.neutral.black
          }}
        >
          <source src="/placeholder.mp4" type="video/mp4" />
          <track kind="captions" srcLang="en" label="English captions" />
          {/* Fallback for screen readers and when video fails */}
          <div className="w-full h-full bg-gradient-to-br from-displini-600 to-displini-800 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-6xl font-bold mb-4">Displini</h1>
              <p className="text-xl">Productivity and Health Tracking App</p>
            </div>
          </div>
        </video>
        
        {/* Apple and Google Play Icons overlay at bottom of video */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center justify-center space-x-6 z-10">
          {/* Apple Icon - Left */}
          <div className="hover:opacity-80 transition-opacity cursor-pointer">
            <img 
              src="/icons/Apple_icon.svg" 
              alt="Download on App Store"
              width="24"
              height="24"
              className="w-6 h-6 filter brightness-0 invert object-contain"
              loading="lazy"
            />
          </div>
          {/* Google Play Icon - Right */}
          <div className="hover:opacity-80 transition-opacity cursor-pointer">
            <img 
              src="/icons/Googleplay_icon.svg" 
              alt="Get it on Google Play"
              width="24"
              height="24"
              className="w-6 h-6 filter brightness-0 invert object-contain"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Text Section Below Curved Video */}
      <div className="relative pt-16 pb-8 flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300" style={{ minHeight: '50vh' }}>
        <div className="text-center px-6 flex-1 flex flex-col justify-center">
          <div className="flex justify-center mb-6 animate-fade-in">
            <img 
              src="/logos/Displini_text_black.svg" 
              alt="Displini" 
              width="200"
              height="64"
              className="h-12 md:h-16 w-auto dark:brightness-0 dark:invert"
              loading="lazy"
            />
          </div>
          <p className="text-base md:text-lg mb-4 max-w-3xl mx-auto animate-fade-in text-gray-700 dark:text-gray-300" style={{animationDelay: '0.2s'}}>
            Displini is an application that helps you build structure, improve your health and routines.
          </p>
          <p className="text-xl md:text-2xl italic text-displini-600 mb-8 animate-fade-in" style={{animationDelay: '0.4s'}}>
            Stay focused. Stay Displini.
          </p>
        </div>
        
        {/* Scroll Down Indicator - At Bottom */}
        <div className="flex flex-col items-center gap-2 cursor-pointer animate-bounce mt-auto pb-4" onClick={scrollToFeatures}>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Scroll</span>
          <ChevronDown className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </div>
      </div>
    </section>
  );
}

