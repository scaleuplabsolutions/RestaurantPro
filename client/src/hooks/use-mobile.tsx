import { useState, useEffect } from 'react';

// Define breakpoint for mobile screens (in pixels)
const MOBILE_BREAKPOINT = 768;

export function useMobile() {
  // Initialize with a default value based on window width
  // Using undefined initially to avoid hydration mismatch
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    // Set the initial value based on window width
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Create handler to update state when the window is resized
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Add event listener to window resize
    window.addEventListener('resize', handleResize);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
}

export default useMobile;
