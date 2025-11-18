import { CheckSquare, RefreshCw } from "lucide-react";
import { colors } from "@/lib/designSystem";

/**
 * Device sync section showing cross-device functionality
 * - MacBook, iPad, iPhone, and Smartwatch mockups
 * - Animated sync icon
 * - Responsive positioning
 */
export function LandingDeviceSync() {
  return (
    <section data-section="device-sync" className="relative pb-0 bg-gray-50 dark:bg-gray-900 transition-colors duration-300" style={{ scrollSnapAlign: 'start', minHeight: 'calc(100vh - 80px)', paddingTop: '200px' }}>
      <div className="container mx-auto max-w-7xl px-6 relative">
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

        {/* Device Screens with Title */}
        <div className="relative flex items-start justify-center overflow-visible" style={{ minWidth: '100%', height: '900px' }}>
          {/* Title and Sync - Positioned closer to screens */}
          <div className="absolute left-1/2 -translate-x-1/2 z-40 text-center w-full" style={{ top: '420px', paddingTop: '0' }}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-gray-900 dark:text-white">
              Keep track where you left off on any device
            </h2>

            {/* Sync Icon and Text */}
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

          {/* MacBook - BELOW TITLE */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 transition-transform duration-500 hover:scale-105 z-10"
            style={{ top: '500px', width: '560px', maxWidth: '90vw' }}
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

          {/* iPad - BELOW TITLE */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 bg-gray-800 rounded-[2rem] shadow-2xl z-20 transition-transform duration-500 hover:scale-105"
            style={{ top: '550px', width: '288px', height: '384px', padding: '10px', maxWidth: '70vw' }}
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

          {/* iPhone - BELOW TITLE */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 bg-gray-900 rounded-[2.5rem] shadow-2xl z-30 transition-transform duration-500 hover:scale-105"
            style={{ top: '640px', width: '192px', height: '384px', padding: '8px', maxWidth: '50vw' }}
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

          {/* Smartwatch - OVERLAPPING BEHIND GRADIENT TEXT */}
          <div 
            className="absolute transition-transform duration-500 hover:scale-105 z-20"
            style={{ 
              top: '660px'
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
      </div>
    </section>
  );
}

