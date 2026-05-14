import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for responsive media queries
 * Returns true if the media query matches
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is defined (for SSR)
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener
    const handler = (event) => setMatches(event.matches);

    // Add event listener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);

  return matches;
};

/**
 * Custom hook for common breakpoints
 * Returns object with boolean flags for different screen sizes
 */
export const useBreakpoint = () => {
  const isMobile = useMediaQuery('(max-width: 480px)');
  const isTablet = useMediaQuery('(min-width: 481px) and (max-width: 768px)');
  const isDesktop = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isLargeDesktop = useMediaQuery('(min-width: 1025px)');
  
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const isMediumScreen = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isLargeScreen = useMediaQuery('(min-width: 1025px)');

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    
    // Utility getters
    get currentBreakpoint() {
      if (isMobile) return 'mobile';
      if (isTablet) return 'tablet';
      if (isDesktop) return 'desktop';
      if (isLargeDesktop) return 'large-desktop';
      return 'unknown';
    },
    
    get screenSize() {
      if (isMobile) return 'sm';
      if (isTablet) return 'md';
      if (isDesktop) return 'lg';
      if (isLargeDesktop) return 'xl';
      return 'unknown';
    }
  };
};

/**
 * Custom hook for viewport dimensions
 * Returns current width and height of the viewport
 */
export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return viewport;
};

/**
 * Custom hook for window scroll position
 * Returns current scroll position with optional throttling
 */
export const useScrollPosition = (throttleMs = 100) => {
  const [scrollPosition, setScrollPosition] = useState({
    x: typeof window !== 'undefined' ? window.pageXOffset : 0,
    y: typeof window !== 'undefined' ? window.pageYOffset : 0
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId = null;

    const handleScroll = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        setScrollPosition({
          x: window.pageXOffset,
          y: window.pageYOffset
        });
      }, throttleMs);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, [throttleMs]);

  return scrollPosition;
};

/**
 * Custom hook for device orientation
 * Returns current device orientation
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState(
    typeof window !== 'undefined' && window.screen?.orientation?.type
      ? window.screen.orientation.type
      : 'unknown'
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.screen?.orientation) return;

    const handleOrientationChange = () => {
      setOrientation(window.screen.orientation.type);
    };

    window.screen.orientation.addEventListener('change', handleOrientationChange);

    return () => {
      window.screen.orientation.removeEventListener('change', handleOrientationChange);
    };
  }, []);

  return {
    type: orientation,
    isPortrait: orientation.includes('portrait'),
    isLandscape: orientation.includes('landscape')
  };
};

/**
 * Custom hook for hover support detection
 * Useful for conditional rendering based on device capabilities
 */
export const useHoverSupport = () => {
  const hasHover = useMediaQuery('(hover: hover) and (pointer: fine)');
  const hasCoarsePointer = useMediaQuery('(pointer: coarse)');

  return {
    hasHover,
    hasCoarsePointer,
    isTouchDevice: hasCoarsePointer,
    isMouseDevice: hasHover
  };
};

/**
 * Custom hook for prefers-reduced-motion detection
 * Returns true if user prefers reduced motion
 */
export const usePrefersReducedMotion = () => {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
};

/**
 * Custom hook for dark mode preference
 * Returns true if user prefers dark color scheme
 */
export const usePrefersDarkMode = () => {
  return useMediaQuery('(prefers-color-scheme: dark)');
};

/**
 * Custom hook for responsive values
 * Returns different values based on current breakpoint
 */
export const useResponsiveValue = (values) => {
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useBreakpoint();

  if (isMobile && values.mobile !== undefined) return values.mobile;
  if (isTablet && values.tablet !== undefined) return values.tablet;
  if (isDesktop && values.desktop !== undefined) return values.desktop;
  if (isLargeDesktop && values.largeDesktop !== undefined) return values.largeDesktop;

  // Fallback
  return values.default || values.desktop || values.tablet || values.mobile;
};

/**
 * Custom hook for element visibility
 * Returns true when element is visible in viewport
 */
export const useIntersectionObserver = (
  ref,
  options = { threshold: 0.1, root: null, rootMargin: '0px' }
) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    observer.observe(ref.current);

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options.threshold, options.root, options.rootMargin]);

  return isVisible;
};

/**
 * Custom hook for container query-like behavior
 * Returns width of a specific element
 */
export const useElementWidth = (ref) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  return width;
};

/**
 * Custom hook for responsive columns
 * Returns number of columns based on container width
 */
export const useResponsiveColumns = (ref, columnWidths = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
  large: 4
}) => {
  const width = useElementWidth(ref);

  if (width < 480) return columnWidths.mobile;
  if (width < 768) return columnWidths.tablet;
  if (width < 1024) return columnWidths.desktop;
  return columnWidths.large;
};

/**
 * Custom hook to detect if component is mounted
 * Useful for preventing memory leaks
 */
export const useIsMounted = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  return isMounted;
};

/**
 * Custom hook for window focus detection
 * Returns true if window is focused
 */
export const useWindowFocus = () => {
  const [isFocused, setIsFocused] = useState(
    typeof document !== 'undefined' ? document.hasFocus() : true
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return isFocused;
};

/**
 * Custom hook for online/offline status
 * Returns true if browser is online
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

export default useMediaQuery;