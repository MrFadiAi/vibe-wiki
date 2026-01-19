/**
 * Mobile utilities for detecting device capabilities and optimizing mobile experience.
 */

/**
 * Device type classification
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Touch capability type
 */
export type TouchCapability = 'none' | 'touch' | 'pen';

/**
 * Orientation type
 */
export type OrientationType = 'portrait' | 'landscape';

/**
 * Device information
 */
export interface DeviceInfo {
  type: DeviceType;
  hasTouch: boolean;
  touchCapability: TouchCapability;
  orientation: OrientationType;
  viewportWidth: number;
  viewportHeight: number;
  pixelRatio: number;
  isIOS: boolean;
  isAndroid: boolean;
  isStandalone: boolean;
}

/**
 * Breakpoint configuration
 */
export interface Breakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
}

/**
 * Default breakpoints matching Tailwind CSS
 */
export const DEFAULT_BREAKPOINTS: Breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
};

/**
 * Viewport size category
 */
export type ViewportSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Mobile performance hints
 */
export interface PerformanceHints {
  reducedMotion: boolean;
  lowDataMode: boolean;
  saveData: boolean;
  effectiveConnectionType: string;
}

/**
 * Touch gesture state
 */
export interface TouchGestureState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  startTime: number;
  isTracking: boolean;
}

/**
 * Swipe direction
 */
export type SwipeDirection = 'left' | 'right' | 'up' | 'down' | 'none';

/**
 * Swipe event data
 */
export interface SwipeEventData {
  direction: SwipeDirection;
  velocity: number;
  distance: number;
  duration: number;
}

/**
 * Swipe callback
 */
export type SwipeCallback = (data: SwipeEventData) => void;

/**
 * Swipe options
 */
export interface SwipeOptions {
  threshold?: number;
  restraint?: number;
  allowedTime?: number;
  onSwipe?: SwipeCallback;
  onSwipeLeft?: SwipeCallback;
  onSwipeRight?: SwipeCallback;
  onSwipeUp?: SwipeCallback;
  onSwipeDown?: SwipeCallback;
}

/**
 * Get the current device type based on viewport width
 */
export function getDeviceType(breakpoints: Breakpoints = DEFAULT_BREAKPOINTS): DeviceType {
  if (typeof window === 'undefined') {
    return 'desktop';
  }

  const width = window.innerWidth;

  if (width < breakpoints.tablet) {
    return 'mobile';
  } else if (width < breakpoints.desktop) {
    return 'tablet';
  }
  return 'desktop';
}

/**
 * Get comprehensive device information
 */
export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      type: 'desktop',
      hasTouch: false,
      touchCapability: 'none',
      orientation: 'landscape',
      viewportWidth: 1920,
      viewportHeight: 1080,
      pixelRatio: 1,
      isIOS: false,
      isAndroid: false,
      isStandalone: false,
    };
  }

  const userAgent = navigator.userAgent || '';
  const touchPoints = navigator.maxTouchPoints || 0;

  return {
    type: getDeviceType(),
    hasTouch: touchPoints > 0 || 'ontouchstart' in window,
    touchCapability: touchPoints > 0 ? (touchPoints > 1 ? 'touch' : 'pen') : 'none',
    orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1,
    isIOS: /iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && touchPoints > 1),
    isAndroid: /Android/.test(userAgent),
    isStandalone: window.matchMedia?.('(display-mode: standalone)').matches || false,
  };
}

/**
 * Get viewport size category
 */
export function getViewportSize(): ViewportSize {
  if (typeof window === 'undefined') {
    return 'lg';
  }

  const width = window.innerWidth;

  if (width < 640) return 'xs';
  if (width < 768) return 'sm';
  if (width < 1024) return 'md';
  if (width < 1280) return 'lg';
  return 'xl';
}

/**
 * Check if the device is a mobile device
 */
export function isMobile(): boolean {
  return getDeviceType() === 'mobile';
}

/**
 * Check if the device is a tablet
 */
export function isTablet(): boolean {
  return getDeviceType() === 'tablet';
}

/**
 * Check if the device is a desktop
 */
export function isDesktop(): boolean {
  return getDeviceType() === 'desktop';
}

/**
 * Check if the device has touch capability
 */
export function hasTouchCapability(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
}

/**
 * Check if running as a PWA (standalone mode)
 */
export function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia?.('(display-mode: standalone)').matches || false;
}

/**
 * Get performance hints for the current device
 */
export function getPerformanceHints(): PerformanceHints {
  if (typeof window === 'undefined') {
    return {
      reducedMotion: false,
      lowDataMode: false,
      saveData: false,
      effectiveConnectionType: '4g',
    };
  }

  const connection = (navigator as unknown as {
    connection?: { saveData?: boolean; effectiveType?: string };
    mozConnection?: { saveData?: boolean; effectiveType?: string };
    webkitConnection?: { saveData?: boolean; effectiveType?: string };
  }).connection ||
    (navigator as unknown as {
      connection?: { saveData?: boolean; effectiveType?: string };
      mozConnection?: { saveData?: boolean; effectiveType?: string };
      webkitConnection?: { saveData?: boolean; effectiveType?: string };
    }).mozConnection ||
    (navigator as unknown as {
      connection?: { saveData?: boolean; effectiveType?: string };
      mozConnection?: { saveData?: boolean; effectiveType?: string };
      webkitConnection?: { saveData?: boolean; effectiveType?: string };
    }).webkitConnection;

  return {
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    lowDataMode: window.matchMedia('(prefers-reduced-data: reduce)').matches,
    saveData: connection?.saveData || false,
    effectiveConnectionType: connection?.effectiveType || '4g',
  };
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if device is in portrait orientation
 */
export function isPortrait(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.innerHeight > window.innerWidth;
}

/**
 * Check if device is in landscape orientation
 */
export function isLandscape(): boolean {
  return !isPortrait();
}

/**
 * Get safe area insets for devices with notches
 */
export function getSafeAreaInsets(): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const styles = window.getComputedStyle(document.documentElement);

  const top = parseInt(styles.getPropertyValue('env(safe-area-inset-top)') || '0', 10);
  const right = parseInt(styles.getPropertyValue('env(safe-area-inset-right)') || '0', 10);
  const bottom = parseInt(styles.getPropertyValue('env(safe-area-inset-bottom)') || '0', 10);
  const left = parseInt(styles.getPropertyValue('env(safe-area-inset-left)') || '0', 10);

  return { top, right, bottom, left };
}

/**
 * Calculate optimal font size for mobile device
 */
export function getOptimalFontSize(baseSize: number, scaleFactor: number = 1): number {
  const deviceInfo = getDeviceInfo();

  // Adjust for viewport width
  let adjustedSize = baseSize;
  if (deviceInfo.viewportWidth < 375) {
    adjustedSize = baseSize * 0.9;
  } else if (deviceInfo.viewportWidth < 768) {
    adjustedSize = baseSize * scaleFactor;
  }

  return Math.round(adjustedSize * 10) / 10;
}

/**
 * Calculate optimal touch target size (minimum 44x44 for iOS)
 */
export function getTouchTargetSize(size: number = 44): number {
  // iOS recommends minimum 44x44 points for touch targets
  return Math.max(size, 44);
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Request animation frame throttle for smooth animations
 */
export function rafThrottle<T extends (...args: unknown[]) => unknown>(callback: T): (...args: Parameters<T>) => void {
  let rafId: number | null = null;

  return function executedFunction(...args: Parameters<T>) {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(() => {
      callback(...args);
      rafId = null;
    });
  };
}

/**
 * Create a touch gesture state tracker
 */
export function createTouchGestureState(): TouchGestureState {
  return {
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    startTime: 0,
    isTracking: false,
  };
}

/**
 * Update touch gesture state with touch move
 */
export function updateTouchGestureState(
  state: TouchGestureState,
  clientX: number,
  clientY: number
): TouchGestureState {
  const deltaX = clientX - state.startX;
  const deltaY = clientY - state.startY;

  return {
    ...state,
    currentX: clientX,
    currentY: clientY,
    deltaX,
    deltaY,
  };
}

/**
 * Start tracking a touch gesture
 */
export function startTouchGesture(clientX: number, clientY: number): TouchGestureState {
  return {
    startX: clientX,
    startY: clientY,
    currentX: clientX,
    currentY: clientY,
    deltaX: 0,
    deltaY: 0,
    startTime: Date.now(),
    isTracking: true,
  };
}

/**
 * Determine swipe direction from delta values
 */
export function getSwipeDirection(deltaX: number, deltaY: number): SwipeDirection {
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0 ? 'right' : 'left';
  } else {
    return deltaY > 0 ? 'down' : 'up';
  }
}

/**
 * Calculate swipe data for callbacks
 */
export function calculateSwipeData(
  state: TouchGestureState,
  endTime: number = Date.now()
): SwipeEventData {
  const distance = Math.sqrt(state.deltaX ** 2 + state.deltaY ** 2);
  const duration = endTime - state.startTime;
  const velocity = duration > 0 ? distance / duration : 0;

  return {
    direction: getSwipeDirection(state.deltaX, state.deltaY),
    velocity,
    distance,
    duration,
  };
}

/**
 * Check if swipe meets threshold criteria
 */
export function meetsSwipeThreshold(
  state: TouchGestureState,
  threshold: number = 50,
  restraint: number = 100,
  allowedTime: number = 500
): boolean {
  const duration = Date.now() - state.startTime;
  const direction = getSwipeDirection(state.deltaX, state.deltaY);

  const isHorizontalSwipe = direction === 'left' || direction === 'right';

  const validDistance = isHorizontalSwipe
    ? Math.abs(state.deltaX) > threshold && Math.abs(state.deltaY) < restraint
    : Math.abs(state.deltaY) > threshold && Math.abs(state.deltaX) < restraint;

  return validDistance && duration < allowedTime;
}

/**
 * Validate device info object
 */
export function validateDeviceInfo(info: unknown): info is DeviceInfo {
  if (typeof info !== 'object' || info === null) {
    return false;
  }

  const i = info as Record<string, unknown>;

  return (
    typeof i.type === 'string' &&
    ['mobile', 'tablet', 'desktop'].includes(i.type) &&
    typeof i.hasTouch === 'boolean' &&
    typeof i.touchCapability === 'string' &&
    ['none', 'touch', 'pen'].includes(i.touchCapability) &&
    typeof i.orientation === 'string' &&
    ['portrait', 'landscape'].includes(i.orientation) &&
    typeof i.viewportWidth === 'number' &&
    typeof i.viewportHeight === 'number' &&
    typeof i.pixelRatio === 'number' &&
    typeof i.isIOS === 'boolean' &&
    typeof i.isAndroid === 'boolean' &&
    typeof i.isStandalone === 'boolean'
  );
}

/**
 * Get mobile-optimized animation duration
 */
export function getAnimationDuration(defaultDuration: number): number {
  if (prefersReducedMotion()) {
    return 0;
  }

  const deviceType = getDeviceType();

  // Slightly faster animations on mobile for better perceived performance
  if (deviceType === 'mobile') {
    return defaultDuration * 0.8;
  }

  return defaultDuration;
}

/**
 * Check if we should lazy load an element based on device
 */
export function shouldLazyLoad(): boolean {
  // Always lazy load on mobile unless in low data mode
  if (isMobile()) {
    const hints = getPerformanceHints();
    return !hints.lowDataMode;
  }

  return false;
}

/**
 * Get optimal image size for device
 */
export function getOptimalImageSize(baseWidth: number, baseHeight: number): {
  width: number;
  height: number;
} {
  const deviceInfo = getDeviceInfo();
  const scaleFactor = deviceInfo.pixelRatio;

  // For high DPI displays, serve larger images
  const scaledWidth = Math.round(baseWidth * scaleFactor);
  const scaledHeight = Math.round(baseHeight * scaleFactor);

  // Cap at reasonable maximum for mobile
  const maxWidth = isMobile() ? 1920 : 2560;
  const maxHeight = isMobile() ? 1080 : 1440;

  return {
    width: Math.min(scaledWidth, maxWidth),
    height: Math.min(scaledHeight, maxHeight),
  };
}
