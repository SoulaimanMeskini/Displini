import { Instagram, Youtube } from "lucide-react";

/**
 * Footer section with links and copyright
 * - Brand logo
 * - Social media links
 * - Journey, Support, and Legal links
 * - App store download buttons
 * - Copyright notice
 */
export function LandingFooter() {
  const scrollToApp = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="py-16" style={{ backgroundColor: '#1d1d1d' }}>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="h-12 mb-4">
              <img 
                src="/logos/Displini_Logo_text_white.svg" 
                alt="Displini" 
                width="200"
                height="48"
                className="h-full w-auto"
                loading="lazy"
              />
            </div>
            <div className="flex space-x-4">
              <a href="https://x.com/displini_" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Follow us on X">
                <svg className="w-6 h-6" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M12.6 0.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867 -5.07 -4.425 5.07H0.316l5.733 -6.57L0 0.75h5.063l3.495 4.633L12.601 0.75Zm-0.86 13.028h1.36L4.323 2.145H2.865z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/displini/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Follow us on Instagram">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="https://www.tiktok.com/@displini?lang=en" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Follow us on TikTok">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a href="https://www.youtube.com/@Displini" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Subscribe on YouTube">
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Journey */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Journey</h3>
            <ul className="space-y-2">
              <li><a href="/pricing" className="text-gray-400 hover:text-white hover:underline transition-colors">Pricing</a></li>
              <li><a href="/roadmap" className="text-gray-400 hover:text-white hover:underline transition-colors">Roadmap</a></li>
              <li><a href="#about" className="text-gray-400 hover:text-white hover:underline transition-colors">About</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Support</h3>
            <ul className="space-y-2">
              <li><a href="/contact" className="text-gray-400 hover:text-white hover:underline transition-colors">Contact</a></li>
              <li><a href="/feature-requests" className="text-gray-400 hover:text-white hover:underline transition-colors">Feature Requests</a></li>
              <li><a href="/collaboration" className="text-gray-400 hover:text-white hover:underline transition-colors">Collaborations</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Legal</h3>
            <ul className="space-y-2">
              <li><a href="/privacy" className="text-gray-400 hover:text-white hover:underline transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="text-gray-400 hover:text-white hover:underline transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Download Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center space-x-4">
            <button
              onClick={scrollToApp}
              className="bg-transparent hover:bg-white/10 rounded-xl transition-all p-2 focus:outline-none"
              aria-label="Download on the App Store"
            >
              <img
                src="/icons/Apple_icon.svg"
                alt="Download on the App Store"
                width="96"
                height="32"
                className="w-24 h-8 object-contain filter brightness-0 invert"
                loading="lazy"
              />
            </button>
            <button
              onClick={scrollToApp}
              className="bg-transparent hover:bg-white/10 rounded-xl transition-all p-2 focus:outline-none"
              aria-label="Download on Google Play"
            >
              <img
                src="/icons/Googleplay_icon.svg"
                alt="Get it on Google Play"
                width="96"
                height="32"
                className="w-24 h-8 object-contain filter brightness-0 invert"
                loading="lazy"
              />
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-8 border-t border-gray-700">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Displini. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

