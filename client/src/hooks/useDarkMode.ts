import { useEffect, useState } from 'react';

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Check for saved preference or system preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    // Update document class when darkMode changes
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  return { darkMode, setDarkMode, toggleDarkMode: () => setDarkMode(!darkMode) };
}

export default useDarkMode;
