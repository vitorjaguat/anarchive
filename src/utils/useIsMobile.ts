import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 768; // px

function getIsMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(getIsMobile);

  useEffect(() => {
    function handleResize() {
      setIsMobile(getIsMobile());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}
