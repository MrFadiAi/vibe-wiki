/**
 * React hook for mobile device detection and responsive state management.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DeviceInfo, ViewportSize } from '@/lib/mobile-utils';
import {
  getDeviceInfo,
  isMobile,
  isTablet,
  isDesktop,
  hasTouchCapability,
  isStandaloneMode,
  getViewportSize,
  prefersReducedMotion,
  getPerformanceHints,
} from '@/lib/mobile-utils';

/**
 * Hook return value
 */
export interface UseMobileDetectionReturn {
  deviceInfo: DeviceInfo;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasTouch: boolean;
  isStandalone: boolean;
  viewportSize: ViewportSize;
  prefersReducedMotion: boolean;
  performanceHints: ReturnType<typeof getPerformanceHints>;
  refresh: () => void;
}

/**
 * React hook for mobile device detection
 *
 * @returns Mobile detection state and utilities
 *
 * @example
 * ```tsx
 * const { isMobile, deviceInfo, hasTouch } = useMobileDetection();
 *
 * if (isMobile) {
 *   // Render mobile-specific UI
 * }
 * ```
 */
export function useMobileDetection(): UseMobileDetectionReturn {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => getDeviceInfo());
  const [viewportSize, setViewportSize] = useState<ViewportSize>(() => getViewportSize());
  const [prefersReduced, setPrefersReduced] = useState<boolean>(() => prefersReducedMotion());
  const [performanceHints, setPerformanceHints] = useState<ReturnType<typeof getPerformanceHints>>(() =>
    getPerformanceHints()
  );

  // Update device info on resize or orientation change
  const refresh = useCallback(() => {
    setDeviceInfo(getDeviceInfo());
    setViewportSize(getViewportSize());
    setPrefersReduced(prefersReducedMotion());
    setPerformanceHints(getPerformanceHints());
  }, []);

  useEffect(() => {
    // Handle resize events with debounce
    let resizeTimeout: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        refresh();
      }, 150);
    };

    // Handle orientation changes
    const handleOrientationChange = () => {
      // Small delay for browser to adjust to new orientation
      setTimeout(() => {
        refresh();
      }, 100);
    };

    // Listen for media query changes (performance hints)
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reducedDataQuery = window.matchMedia('(prefers-reduced-data: reduce)');

    const handleMediaChange = () => {
      refresh();
    };

    // Add event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Add media query listeners (modern API)
    if (reducedMotionQuery.addEventListener) {
      reducedMotionQuery.addEventListener('change', handleMediaChange);
    } else {
      // Fallback for older browsers
      reducedMotionQuery.addListener(handleMediaChange);
    }

    if (reducedDataQuery.addEventListener) {
      reducedDataQuery.addEventListener('change', handleMediaChange);
    } else {
      reducedDataQuery.addListener(handleMediaChange);
    }

    // Listen for connection changes (network status)
    const connection = (navigator as unknown as {
      connection?: EventTarget;
      mozConnection?: EventTarget;
      webkitConnection?: EventTarget;
    }).connection ||
      (navigator as unknown as {
        connection?: EventTarget;
        mozConnection?: EventTarget;
        webkitConnection?: EventTarget;
      }).mozConnection ||
      (navigator as unknown as {
        connection?: EventTarget;
        mozConnection?: EventTarget;
        webkitConnection?: EventTarget;
      }).webkitConnection;
    let connectionChangeListener: (() => void) | null = null;

    if (connection) {
      connectionChangeListener = () => {
        refresh();
      };
      connection.addEventListener('change', connectionChangeListener);
    }

    // Cleanup
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);

      if (reducedMotionQuery.removeEventListener) {
        reducedMotionQuery.removeEventListener('change', handleMediaChange);
      } else {
        reducedMotionQuery.removeListener(handleMediaChange);
      }

      if (reducedDataQuery.removeEventListener) {
        reducedDataQuery.removeEventListener('change', handleMediaChange);
      } else {
        reducedDataQuery.removeListener(handleMediaChange);
      }

      if (connection && connectionChangeListener) {
        connection.removeEventListener('change', connectionChangeListener);
      }
    };
  }, [refresh]);

  return {
    deviceInfo,
    isMobile: isMobile(),
    isTablet: isTablet(),
    isDesktop: isDesktop(),
    hasTouch: hasTouchCapability(),
    isStandalone: isStandaloneMode(),
    viewportSize,
    prefersReducedMotion: prefersReduced,
    performanceHints,
    refresh,
  };
}
