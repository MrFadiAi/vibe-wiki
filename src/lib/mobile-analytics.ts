/**
 * Mobile-specific analytics tracking utilities.
 * Extends the core analytics system with mobile device tracking.
 */

import { getDeviceInfo } from './mobile-utils';
import type { DeviceInfo as MobileDeviceInfo } from './mobile-utils';

/**
 * Mobile device analytics data
 */
export interface MobileAnalyticsData {
  deviceInfo: MobileDeviceInfo;
  orientation: 'portrait' | 'landscape';
  hasTouch: boolean;
  pixelRatio: number;
  viewportWidth: number;
  viewportHeight: number;
  isStandalone: boolean;
  connectionType: string;
  effectiveConnectionType: string;
  saveData: boolean;
  safeAreaInsets: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

/**
 * Mobile touch event data
 */
export interface MobileTouchEvent {
  type: 'tap' | 'double_tap' | 'long_press' | 'swipe' | 'pinch' | 'scroll';
  target: string;
  x: number;
  y: number;
  timestamp: number;
  velocity?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

/**
 * Mobile performance metrics
 */
export interface MobilePerformanceMetrics {
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
  timeToInteractive?: number;
  totalBlockingTime?: number;
  memoryUsed?: number;
  jsHeapSize?: number;
}

/**
 * Mobile battery information
 */
export interface MobileBatteryInfo {
  level: number;
  charging: boolean;
  chargingTime?: number;
  dischargingTime?: number;
}

/**
 * Get mobile device analytics data
 */
export function getMobileAnalyticsData(): MobileAnalyticsData {
  const deviceInfo = getDeviceInfo();
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

  return {
    deviceInfo,
    orientation: deviceInfo.orientation,
    hasTouch: deviceInfo.hasTouch,
    pixelRatio: deviceInfo.pixelRatio,
    viewportWidth: deviceInfo.viewportWidth,
    viewportHeight: deviceInfo.viewportHeight,
    isStandalone: deviceInfo.isStandalone,
    connectionType: connection?.type || 'unknown',
    effectiveConnectionType: connection?.effectiveType || 'unknown',
    saveData: connection?.saveData || false,
    safeAreaInsets: getSafeAreaInsetsForAnalytics(),
  };
}

/**
 * Get safe area insets for analytics
 */
function getSafeAreaInsetsForAnalytics(): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const styles = window.getComputedStyle(document.documentElement);

  return {
    top: parseInt(styles.getPropertyValue('env(safe-area-inset-top)') || '0', 10),
    right: parseInt(styles.getPropertyValue('env(safe-area-inset-right)') || '0', 10),
    bottom: parseInt(styles.getPropertyValue('env(safe-area-inset-bottom)') || '0', 10),
    left: parseInt(styles.getPropertyValue('env(safe-area-inset-left)') || '0', 10),
  };
}

/**
 * Get mobile performance metrics using Performance API
 */
export function getMobilePerformanceMetrics(): MobilePerformanceMetrics | null {
  if (typeof window === 'undefined' || !window.performance) {
    return null;
  }

  const performance = window.performance as any;
  const navigationTiming = performance.timing || performance.getEntriesByType?.('navigation')?.[0];
  const paintEntries = performance.getEntriesByType?.('paint') || [];
  const lcpEntry = performance.getEntriesByType?.('largest-contentful-content')?.[0];

  const fcp = paintEntries.find((entry: any) => entry.name === 'first-contentful-paint')?.startTime;
  const lcp = lcpEntry?.startTime;

  // Calculate navigation timing metrics
  let timeToInteractive;
  if (navigationTiming) {
    const timing = navigationTiming as PerformanceNavigationTiming;
    timeToInteractive = timing.domInteractive - timing.navigationStart;
  }

  return {
    firstContentfulPaint: fcp,
    largestContentfulPaint: lcp,
    timeToInteractive,
  };
}

/**
 * Get battery information (if available)
 */
export function getBatteryInfo(): Promise<MobileBatteryInfo | null> {
  if (typeof navigator === 'undefined' || !(navigator as any).getBattery) {
    return Promise.resolve(null);
  }

  return (navigator as any)
    .getBattery()
    .then((battery: any) => ({
      level: battery.level,
      charging: battery.charging,
      chargingTime: battery.chargingTime,
      dischargingTime: battery.dischargingTime,
    }))
    .catch(() => null);
}

/**
 * Track mobile touch interaction
 */
export function trackMobileTouch(event: MobileTouchEvent): void {
  const ANALYTICS_KEY = 'vibe-wiki-mobile-touches';

  try {
    const existingData = localStorage.getItem(ANALYTICS_KEY);
    const touches: MobileTouchEvent[] = existingData ? JSON.parse(existingData) : [];

    // Keep only last 100 touch events
    touches.push(event);
    if (touches.length > 100) {
      touches.shift();
    }

    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(touches));
  } catch {
    // Silent fail for analytics errors
  }
}

/**
 * Get mobile touch analytics summary
 */
export function getMobileTouchSummary(): {
  totalTouches: number;
  touchesByType: Record<string, number>;
  averageTouchVelocity: number;
} {
  const ANALYTICS_KEY = 'vibe-wiki-mobile-touches';

  try {
    const data = localStorage.getItem(ANALYTICS_KEY);
    if (!data) {
      return {
        totalTouches: 0,
        touchesByType: {},
        averageTouchVelocity: 0,
      };
    }

    const touches: MobileTouchEvent[] = JSON.parse(data);

    const touchesByType: Record<string, number> = {};
    let totalVelocity = 0;
    let velocityCount = 0;

    for (const touch of touches) {
      touchesByType[touch.type] = (touchesByType[touch.type] || 0) + 1;
      if (touch.velocity !== undefined) {
        totalVelocity += touch.velocity;
        velocityCount++;
      }
    }

    return {
      totalTouches: touches.length,
      touchesByType,
      averageTouchVelocity: velocityCount > 0 ? totalVelocity / velocityCount : 0,
    };
  } catch {
    return {
      totalTouches: 0,
      touchesByType: {},
      averageTouchVelocity: 0,
    };
  }
}

/**
 * Check if device has notch (safe area insets)
 */
export function hasNotch(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const insets = getSafeAreaInsetsForAnalytics();
  return insets.top > 0 || insets.bottom > 0;
}

/**
 * Get mobile viewport category
 */
export function getViewportCategory(): 'small' | 'medium' | 'large' | 'xlarge' {
  if (typeof window === 'undefined') {
    return 'large';
  }

  const width = window.innerWidth;

  if (width < 375) return 'small';
  if (width < 768) return 'medium';
  if (width < 1024) return 'large';
  return 'xlarge';
}

/**
 * Track mobile-specific errors
 */
export interface MobileError {
  type: 'viewport_mismatch' | 'touch_issue' | 'orientation_issue' | 'performance_issue';
  message: string;
  timestamp: number;
  context: Record<string, unknown>;
}

export function trackMobileError(error: MobileError): void {
  const ANALYTICS_KEY = 'vibe-wiki-mobile-errors';

  try {
    const existingData = localStorage.getItem(ANALYTICS_KEY);
    const errors: MobileError[] = existingData ? JSON.parse(existingData) : [];

    // Keep only last 50 errors
    errors.push(error);
    if (errors.length > 50) {
      errors.shift();
    }

    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(errors));
  } catch {
    // Silent fail for analytics errors
  }
}

/**
 * Get mobile error summary
 */
export function getMobileErrorSummary(): {
  totalErrors: number;
  errorsByType: Record<string, number>;
  recentErrors: MobileError[];
} {
  const ANALYTICS_KEY = 'vibe-wiki-mobile-errors';

  try {
    const data = localStorage.getItem(ANALYTICS_KEY);
    if (!data) {
      return {
        totalErrors: 0,
        errorsByType: {},
        recentErrors: [],
      };
    }

    const errors: MobileError[] = JSON.parse(data);

    const errorsByType: Record<string, number> = {};
    for (const error of errors) {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
    }

    // Get last 10 errors
    const recentErrors = errors.slice(-10);

    return {
      totalErrors: errors.length,
      errorsByType,
      recentErrors,
    };
  } catch {
    return {
      totalErrors: 0,
      errorsByType: {},
      recentErrors: [],
    };
  }
}

/**
 * Clear mobile analytics data
 */
export function clearMobileAnalytics(): void {
  const keys = ['vibe-wiki-mobile-touches', 'vibe-wiki-mobile-errors'];

  for (const key of keys) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore errors
    }
  }
}

/**
 * Export mobile analytics data
 */
export function exportMobileAnalytics(): {
  device: MobileAnalyticsData;
  touches: MobileTouchEvent[];
  errors: MobileError[];
  touchSummary: ReturnType<typeof getMobileTouchSummary>;
  errorSummary: ReturnType<typeof getMobileErrorSummary>;
} {
  const TOUCHES_KEY = 'vibe-wiki-mobile-touches';
  const ERRORS_KEY = 'vibe-wiki-mobile-errors';

  let touches: MobileTouchEvent[] = [];
  let errors: MobileError[] = [];

  try {
    const touchesData = localStorage.getItem(TOUCHES_KEY);
    if (touchesData) {
      touches = JSON.parse(touchesData);
    }

    const errorsData = localStorage.getItem(ERRORS_KEY);
    if (errorsData) {
      errors = JSON.parse(errorsData);
    }
  } catch {
    // Ignore errors
  }

  return {
    device: getMobileAnalyticsData(),
    touches,
    errors,
    touchSummary: getMobileTouchSummary(),
    errorSummary: getMobileErrorSummary(),
  };
}
