import { colors } from "@/lib/designSystem";
import { CircularQrOrbit } from "@/app/components/shared/CircularQrOrbit";

/**
 * QR Code download section
 * - Separate section for downloading the app
 * - Centered QR code with rotating text orbit
 */
export function LandingQR() {
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
          
          {/* Circular Orbit QR */}
          <div className="mb-12 text-gray-800 dark:text-gray-300">
            <CircularQrOrbit 
              qrSrc="/images/Qr_code.svg"
              size={320}
              speedSec={8}
              words={['Discipline', 'Improve', 'Benefit', 'Energy', 'Calm', 'Focus', 'Growth', 'Balance', 'Aware']}
            />
          </div>
          
          {/* App Store buttons */}
          <div className="flex gap-8 items-center">
            <a 
              href="#" 
              className="transition-all duration-300 hover:scale-110 hover:opacity-70"
              aria-label="Download on the App Store"
            >
              <img 
                src="/icons/Apple_icon.svg" 
                alt="Download on the App Store" 
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
                className="h-10 w-10 object-contain dark:invert"
                loading="lazy"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

