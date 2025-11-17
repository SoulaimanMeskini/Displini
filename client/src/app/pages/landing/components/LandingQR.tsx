import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CircularQrOrbit } from "@/app/components/shared/CircularQrOrbit";

/**
 * QR Code download section with animated stats
 * - Separate section for downloading the app
 * - Centered QR code with rotating text orbit
 * - Animated counters on scroll
 */

// Animated counter hook
function useCountUp(end: number, duration: number = 2000, start: number = 0) {
  const [count, setCount] = useState(start);
  const countRef = useRef(start);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      countRef.current = Math.floor(start + (end - start) * easeOut);
      setCount(countRef.current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, end, duration, start]);

  return { count, ref };
}

export function LandingQR() {
  // Animated counters
  const tasksCount = useCountUp(10000000); // 10M+
  const usersCount = useCountUp(500000); // 500K+
  const satisfactionCount = useCountUp(98); // 98%

  return (
    <section 
      className="relative px-6 py-32 bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        scrollSnapAlign: 'start',
      }}
      data-section="qr-code"
    >
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            Download Displini
          </h2>
          <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mb-12 text-center">
            Scan the QR code to download Displini on your phone
          </p>
          
          {/* QR Code */}
          <div className="mb-12 text-gray-800 dark:text-gray-300">
            <CircularQrOrbit 
              qrSrc="/images/Qr_code.svg"
              size={320}
              speedSec={8}
              words={['Discipline', 'Improve', 'Benefit', 'Energy', 'Calm', 'Focus', 'Growth', 'Balance', 'Aware']}
            />
          </div>
          
          {/* App Store buttons */}
          <div className="flex gap-8 items-center mb-16">
            <a 
              href="#" 
              className="transition-all duration-300 hover:scale-110 hover:opacity-70"
              aria-label="Download on the App Store"
            >
              <img 
                src="/icons/Apple_icon.svg" 
                alt="Download on the App Store" 
                width="40"
                height="40"
                className="h-10 w-10 object-contain dark:invert"
                loading="lazy"
              />
            </a>
            <a 
              href="#" 
              className="transition-all duration-300 hover:scale-110 hover:opacity-70"
              aria-label="Get it on Google Play"
            >
              <img 
                src="/icons/Googleplay_icon.svg" 
                alt="Get it on Google Play" 
                width="40"
                height="40"
                className="h-10 w-10 object-contain dark:invert"
                loading="lazy"
              />
            </a>
          </div>

          {/* Stats Section - Below QR Code */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 lg:gap-16 w-full max-w-4xl px-4"
          >
            <div className="text-center px-2">
              <div ref={tasksCount.ref} className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 whitespace-nowrap">
                {tasksCount.count.toLocaleString()}+
              </div>
              <div className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">Tasks Completed</div>
            </div>
            <div className="text-center px-2">
              <div ref={usersCount.ref} className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 whitespace-nowrap">
                {usersCount.count.toLocaleString()}+
              </div>
              <div className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">Active Users</div>
            </div>
            <div className="text-center px-2">
              <div ref={satisfactionCount.ref} className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 whitespace-nowrap">
                {satisfactionCount.count}%
              </div>
              <div className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">Satisfaction Rate</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

