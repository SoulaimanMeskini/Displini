import { useEffect, useState } from 'react';

/**
 * Custom hook for dark mode management
 * - Persists preference in localStorage
 * - Applies dark class to document
 * - Returns current state and toggle function
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      return stored === 'true';
    }
    // Otherwise check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Apply dark mode class to document
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('darkMode', String(isDark));
  }, [isDark]);

  // Auto-update based on system preference on mobile (only if no manual setting)
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile && localStorage.getItem('darkMode') === null) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDark(e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const toggle = () => {
    setIsDark(prev => !prev);
    // Mark as manual setting
    localStorage.setItem('darkMode', String(!isDark));
  };

  return { isDark, toggle };
}

