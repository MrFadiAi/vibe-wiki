/**
 * Advanced Mobile Optimization Utilities
 *
 * Comprehensive mobile optimizations including:
 * - PWA (Progressive Web App) support
 * - Viewport and touch optimization
 * - Performance enhancements
 * - Network awareness
 * - Mobile-specific UI helpers
 */

import { getDeviceInfo, isMobile, hasTouchCapability, prefersReducedMotion, getPerformanceHints } from './mobile-utils';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Network quality level
 */
export type NetworkQuality = 'slow-2g' | '2g' | '3g' | '4g';

/**
 * Connection type information
 */
export interface ConnectionInfo {
  effectiveType: NetworkQuality;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

/**
 * Viewport configuration
 */
export interface ViewportConfig {
  width: number;
  height: number;
  scale: number;
  minScale: number;
  maxScale: number;
  userScalable: boolean;
}

/**
 * Touch target configuration
 */
export interface TouchTargetConfig {
  minSize: number;
  minSpacing: number;
  hitboxPadding: number;
}

/**
 * Mobile optimization options
 */
export interface MobileOptimizationOptions {
  enablePWA?: boolean;
  enableTouchOptimization?: boolean;
  enablePerformanceOptimization?: boolean;
  enableNetworkAwareness?: boolean;
  customViewportConfig?: Partial<ViewportConfig>;
  customTouchTargetConfig?: Partial<TouchTargetConfig>;
}

/**
 * PWA install prompt result
 */
export interface PWAInstallPrompt {
  prompt: () => Promise<{ outcome: 'accepted' | 'dismissed' }>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Performance metrics for mobile
 */
export interface MobilePerformanceMetrics {
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
  timeToInteractive?: number;
}

/**
 * Image optimization settings
 */
export interface ImageOptimizationSettings {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: 'webp' | 'jpeg' | 'png' | 'auto';
  lazy: boolean;
}

/**
 * Lazy load configuration
 */
export interface LazyLoadConfig {
  rootMargin: string;
  threshold: number;
  useNativeLazy: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default viewport configuration for mobile
 */
export const DEFAULT_VIEWPORT_CONFIG: ViewportConfig = {
  width: window.innerWidth,
  height: window.innerHeight,
  scale: 1,
  minScale: 1,
  maxScale: 5,
  userScalable: true,
};

/**
 * Default touch target configuration
 * Following WCAG 2.1 AAA guidelines (44x44px minimum)
 */
export const DEFAULT_TOUCH_TARGET_CONFIG: TouchTargetConfig = {
  minSize: 44,
  minSpacing: 8,
  hitboxPadding: 10,
};

/**
 * Default lazy load configuration
 */
export const DEFAULT_LAZY_LOAD_CONFIG: LazyLoadConfig = {
  rootMargin: '50px',
  threshold: 0.01,
  useNativeLazy: true,
};

/**
 * Default image optimization settings for mobile
 */
export const DEFAULT_IMAGE_OPTIMIZATION: ImageOptimizationSettings = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 85,
  format: 'auto',
  lazy: true,
};

// ============================================================================
// PWA SUPPORT
// ============================================================================

/**
 * Check if PWA is supported
 */
export function isPWASupported(): boolean {
  if (typeof window === 'undefined') return false;

  return 'serviceWorker' in navigator &&
    'manifest' in document.documentElement ||
    ('onbeforeinstallprompt' in window);
}

/**
 * Check if running as PWA (standalone mode)
 */
export function isRunningAsPWA(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for standalone display mode
  const isStandalone = (window.matchMedia('(display-mode: standalone)').matches);

  // Check iOS standalone mode
  const isIOSStandalone = ('standalone' in window.navigator) && (window.navigator as any).standalone;

  return isStandalone || isIOSStandalone;
}

/**
 * Get PWA install prompt (if available)
 */
export function getPWAInstallPrompt(): PWAInstallPrompt | null {
  if (typeof window === 'undefined') return null;

  return (window as any).deferredPrompt || null;
}

/**
 * Register service worker for PWA
 */
export async function registerServiceWorker(scriptUrl: string = '/sw.js'): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register(scriptUrl);
    console.log('Service Worker registered:', registration);
    return true;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return false;
  }
}

/**
 * Setup PWA install prompt listener
 */
export function setupPWAInstallPrompt(callback: (prompt: PWAInstallPrompt) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: Event) => {
    e.preventDefault();
    (window as any).deferredPrompt = e;
    callback(e as PWAInstallPrompt);
  };

  window.addEventListener('beforeinstallprompt', handler);

  return () => window.removeEventListener('beforeinstallprompt', handler);
}

/**
 * Show PWA install prompt
 */
export async function showPWAInstallPrompt(): Promise<{ outcome: 'accepted' | 'dismissed' }> {
  const prompt = getPWAInstallPrompt();

  if (!prompt) {
    return { outcome: 'dismissed' };
  }

  try {
    const result = await prompt.prompt();
    // Clear the deferred prompt after showing
    (window as any).deferredPrompt = null;
    return result;
  } catch (error) {
    console.error('Failed to show install prompt:', error);
    return { outcome: 'dismissed' };
  }
}

// ============================================================================
// VIEWPORT OPTIMIZATION
// ============================================================================

/**
 * Get optimal viewport configuration for current device
 */
export function getOptimalViewportConfig(customConfig?: Partial<ViewportConfig>): ViewportConfig {
  const deviceInfo = getDeviceInfo();
  const config = { ...DEFAULT_VIEWPORT_CONFIG, ...customConfig };

  // Adjust for mobile devices
  if (deviceInfo.type === 'mobile') {
    // Prevent zoom on input focus for iOS
    config.maxScale = 5;
    config.userScalable = true;
  }

  return config;
}

/**
 * Apply viewport meta tag configuration
 */
export function applyViewportConfig(config: ViewportConfig): void {
  if (typeof document === 'undefined') return;

  let viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;

  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.name = 'viewport';
    document.head.appendChild(viewport);
  }

  const content = [
    `width=${config.width === window.innerWidth ? 'device-width' : config.width}`,
    `height=${config.height === window.innerHeight ? 'device-height' : config.height}`,
    `initial-scale=${config.scale}`,
    `minimum-scale=${config.minScale}`,
    `maximum-scale=${config.maxScale}`,
    `user-scalable=${config.userScalable ? 'yes' : 'no'}`,
    `viewport-fit=cover`,
  ].join(', ');

  viewport.content = content;
}

/**
 * Setup dynamic viewport height for mobile browsers (address bar handling)
 */
export function setupDynamicViewportHeight(): () => void {
  if (typeof window === 'undefined') return () => {};

  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', () => {
    setTimeout(setVH, 100);
  });

  return () => {
    window.removeEventListener('resize', setVH);
    window.removeEventListener('orientationchange', setVH);
  };
}

/**
 * Prevent zoom on input focus for iOS
 */
export function preventInputZoom(): void {
  if (typeof document === 'undefined') return;

  const style = document.createElement('style');
  style.textContent = `
    input[type="text"],
    input[type="email"],
    input[type="number"],
    input[type="tel"],
    input[type="url"],
    input[type="password"],
    input[type="search"],
    textarea,
    select {
      font-size: 16px !important;
    }
  `;
  document.head.appendChild(style);
}

// ============================================================================
// TOUCH OPTIMIZATION
// ============================================================================

/**
 * Get optimal touch target configuration
 */
export function getTouchTargetConfig(customConfig?: Partial<TouchTargetConfig>): TouchTargetConfig {
  return { ...DEFAULT_TOUCH_TARGET_CONFIG, ...customConfig };
}

/**
 * Apply touch-action CSS property to element
 */
export function applyTouchAction(element: HTMLElement, action: 'auto' | 'none' | 'pan-x' | 'pan-y' | 'manipulation'): void {
  element.style.touchAction = action;
}

/**
 * Prevent double-tap zoom on specific element
 */
export function preventDoubleTapZoom(element: HTMLElement): void {
  applyTouchAction(element, 'manipulation');
}

/**
 * Enhance touch targets by adding hitbox padding
 */
export function enhanceTouchTarget(element: HTMLElement, padding: number = DEFAULT_TOUCH_TARGET_CONFIG.hitboxPadding): void {
  const style = element.style;
  const currentMinHeight = parseInt(style.minHeight) || 0;
  const currentMinWidth = parseInt(style.minWidth) || 0;

  const targetSize = DEFAULT_TOUCH_TARGET_CONFIG.minSize;

  style.minHeight = `${Math.max(currentMinHeight, targetSize)}px`;
  style.minWidth = `${Math.max(currentMinWidth, targetSize)}px`;

  // Add padding for larger hitbox
  style.padding = `${padding}px`;
}

/**
 * Setup touch optimization for all interactive elements
 */
export function setupTouchOptimization(): void {
  if (typeof document === 'undefined') return;

  // Apply to all buttons, links, and inputs
  const interactiveElements = document.querySelectorAll(
    'button, a, input[type="button"], input[type="submit"], [role="button"]'
  );

  interactiveElements.forEach((element) => {
    if (element instanceof HTMLElement) {
      enhanceTouchTarget(element);
      preventDoubleTapZoom(element);
    }
  });
}

/**
 * Add haptic feedback (if supported)
 */
export function vibrate(pattern: number | number[]): boolean {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) {
    return false;
  }

  return navigator.vibrate(pattern);
}

/**
 * Add subtle vibration feedback for touch interactions
 */
export function addHapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning'): void {
  let pattern: number | number[];

  switch (type) {
    case 'light':
      pattern = 10;
      break;
    case 'medium':
      pattern = 20;
      break;
    case 'heavy':
      pattern = 30;
      break;
    case 'success':
      pattern = [10, 50, 10];
      break;
    case 'error':
      pattern = [30, 50, 30, 50, 30];
      break;
    case 'warning':
      pattern = [20, 50, 20];
      break;
    default:
      pattern = 10;
  }

  vibrate(pattern);
}

// ============================================================================
// NETWORK AWARENESS
// ============================================================================

/**
 * Get network connection information
 */
export function getConnectionInfo(): ConnectionInfo | null {
  if (typeof navigator === 'undefined') return null;

  const connection = (navigator as any).connection ||
                    (navigator as any).mozConnection ||
                    (navigator as any).webkitConnection;

  if (!connection) return null;

  return {
    effectiveType: connection.effectiveType || '4g',
    downlink: connection.downlink || 10,
    rtt: connection.rtt || 100,
    saveData: connection.saveData || false,
  };
}

/**
 * Check if connection is slow (2g or slow-2g)
 */
export function isSlowConnection(): boolean {
  const connection = getConnectionInfo();
  if (!connection) return false;

  return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g' || connection.saveData;
}

/**
 * Setup network change listener
 */
export function setupNetworkListener(
  callback: (connection: ConnectionInfo) => void
): () => void {
  const connection = getConnectionInfo();

  if (!connection) return () => {};

  const handler = () => {
    callback(getConnectionInfo()!);
  };

  connection.addEventListener?.('change', handler) ||
  connection.addListener?.(handler);

  return () => {
    connection.removeEventListener?.('change', handler) ||
    connection.removeListener?.(handler);
  };
}

/**
 * Get appropriate resource loading strategy based on connection
 */
export function getLoadingStrategy(): {
  lazyLoadImages: boolean;
  lazyLoadComponents: boolean;
  preloadCritical: boolean;
  useLowResImages: boolean;
  disableAnimations: boolean;
} {
  const connection = getConnectionInfo();
  const hints = getPerformanceHints();

  const isSlow = isSlowConnection() || hints.saveData || hints.lowDataMode;

  return {
    lazyLoadImages: isSlow,
    lazyLoadComponents: isSlow,
    preloadCritical: !isSlow,
    useLowResImages: isSlow,
    disableAnimations: hints.reducedMotion,
  };
}

// ============================================================================
// IMAGE OPTIMIZATION
// ============================================================================

/**
 * Get optimal image settings for current device
 */
export function getOptimalImageSettings(customSettings?: Partial<ImageOptimizationSettings>): ImageOptimizationSettings {
  const deviceInfo = getDeviceInfo();
  const strategy = getLoadingStrategy();
  const settings = { ...DEFAULT_IMAGE_OPTIMIZATION, ...customSettings };

  // Adjust for device pixel ratio
  const pixelRatio = deviceInfo.pixelRatio || 1;
  settings.maxWidth = Math.round(settings.maxWidth * pixelRatio);
  settings.maxHeight = Math.round(settings.maxHeight * pixelRatio);

  // Use lower quality for slow connections
  if (strategy.useLowResImages) {
    settings.quality = 70;
    settings.maxWidth = Math.round(settings.maxWidth * 0.7);
    settings.maxHeight = Math.round(settings.maxHeight * 0.7);
  }

  settings.lazy = strategy.lazyLoadImages;

  return settings;
}

/**
 * Generate optimized image URL
 */
export function getOptimizedImageUrl(
  baseUrl: string,
  width: number,
  height: number,
  quality: number = 85
): string {
  // If using an image CDN (like Cloudinary, imgix, etc.)
  // This would append the appropriate query parameters
  // For now, return the base URL
  return baseUrl;
}

/**
 * Setup lazy loading for images
 */
export function setupLazyImages(config: LazyLoadConfig = DEFAULT_LAZY_LOAD_CONFIG): void {
  if (typeof document === 'undefined') return;

  // Check if native lazy loading is supported
  const supportsNativeLazy = 'loading' in HTMLImageElement.prototype;

  if (supportsNativeLazy && config.useNativeLazy) {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach((img) => {
      if (img instanceof HTMLImageElement) {
        img.loading = 'lazy';
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
      }
    });
    return;
  }

  // Fallback to Intersection Observer
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            imageObserver.unobserve(img);
          }
        });
      },
      {
        rootMargin: config.rootMargin,
        threshold: config.threshold,
      }
    );

    const images = document.querySelectorAll('img[data-src]');
    images.forEach((img) => imageObserver.observe(img));
  }
}

// ============================================================================
// PERFORMANCE OPTIMIZATION
// ============================================================================

/**
 * Get Core Web Vitals metrics
 */
export function getCoreWebVitals(): Promise<MobilePerformanceMetrics> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve({});
      return;
    }

    const metrics: MobilePerformanceMetrics = {};

    // Check if Performance Observer is available
    if (!('PerformanceObserver' in window)) {
      resolve(metrics);
      return;
    }

    // First Contentful Paint
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcp = entries[0] as any;
        metrics.firstContentfulPaint = fcp?.startTime;
        fcpObserver.disconnect();
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
    } catch (e) {
      // Ignore
    }

    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcp = entries[entries.length - 1] as any;
        metrics.largestContentfulPaint = lcp?.startTime;
        lcpObserver.disconnect();
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Ignore
    }

    // First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fid = entries[0] as any;
        metrics.firstInputDelay = fid?.processingStart - fid?.startTime;
        fidObserver.disconnect();
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // Ignore
    }

    // Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        metrics.cumulativeLayoutShift = clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // Ignore
    }

    // Resolve after a short delay to allow metrics to be collected
    setTimeout(() => resolve(metrics), 3000);
  });
}

/**
 * Optimize font loading for mobile
 */
export function optimizeFontLoading(): void {
  if (typeof document === 'undefined') return;

  // Add font-display: swap to prevent FOUT
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources(resources: string[]): void {
  if (typeof document === 'undefined') return;

  resources.forEach((href) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;

    // Determine type based on extension
    if (href.endsWith('.css')) {
      link.as = 'style';
    } else if (href.endsWith('.js')) {
      link.as = 'script';
    } else if (/\.(jpg|jpeg|png|webp|svg|gif)$/i.test(href)) {
      link.as = 'image';
    } else if (/\.(woff|woff2|ttf|otf)$/i.test(href)) {
      link.as = 'font';
      link.crossOrigin = 'anonymous';
    }

    document.head.appendChild(link);
  });
}

/**
 * Setup render-blocking resource hints
 */
export function setupResourceHints(): void {
  if (typeof document === 'undefined') return;

  // DNS prefetch for external domains
  const domains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ];

  domains.forEach((domain) => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });

  // Preconnect to critical origins
  const preconnectOrigins = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ];

  preconnectOrigins.forEach((origin) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    document.head.appendChild(link);
  });
}

// ============================================================================
// MOBILE-SPECIFIC UI HELPERS
// ============================================================================

/**
 * Hide address bar on mobile browsers (iOS Safari)
 */
export function hideAddressBar(): void {
  if (typeof window === 'undefined') return;

  // Scroll to top to hide address bar
  window.scrollTo(0, 1);

  // Set body height to viewport height
  document.body.style.height = `${window.innerHeight}px`;
}

/**
 * Enable pull-to-refresh behavior
 */
export function enablePullToRefresh(
  container: HTMLElement,
  onRefresh: () => void | Promise<void>,
  threshold: number = 80
): () => void {
  let startY = 0;
  let currentY = 0;
  let isDragging = false;
  let isRefreshing = false;

  const handleTouchStart = (e: TouchEvent) => {
    if (container.scrollTop === 0 && !isRefreshing) {
      startY = e.touches[0].clientY;
      isDragging = true;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || isRefreshing) return;

    currentY = e.touches[0].clientY;
    const diff = currentY - startY;

    if (diff > 0 && container.scrollTop === 0) {
      e.preventDefault();
      const resistance = Math.min(diff * 0.5, threshold);
      container.style.transform = `translateY(${resistance}px)`;
    }
  };

  const handleTouchEnd = async () => {
    if (!isDragging || isRefreshing) return;

    const diff = currentY - startY;

    if (diff > threshold) {
      isRefreshing = true;
      container.style.transition = 'transform 0.3s ease-out';
      container.style.transform = 'translateY(60px)';

      try {
        await onRefresh();
      } finally {
        container.style.transform = '';
        isRefreshing = false;
      }
    } else {
      container.style.transition = 'transform 0.2s ease-out';
      container.style.transform = '';
    }

    isDragging = false;
    startY = 0;
    currentY = 0;
  };

  container.addEventListener('touchstart', handleTouchStart, { passive: true });
  container.addEventListener('touchmove', handleTouchMove, { passive: false });
  container.addEventListener('touchend', handleTouchEnd);

  return () => {
    container.removeEventListener('touchstart', handleTouchStart);
    container.removeEventListener('touchmove', handleTouchMove);
    container.removeEventListener('touchend', handleTouchEnd);
  };
}

/**
 * Setup safe area insets for notched devices
 */
export function setupSafeAreaInsets(): void {
  if (typeof document === 'undefined') return;

  // Add CSS variables for safe areas
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --safe-area-inset-top: env(safe-area-inset-top, 0px);
      --safe-area-inset-right: env(safe-area-inset-right, 0px);
      --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
      --safe-area-inset-left: env(safe-area-inset-left, 0px);
    }

    .safe-top {
      padding-top: max(1rem, var(--safe-area-inset-top));
    }

    .safe-bottom {
      padding-bottom: max(1rem, var(--safe-area-inset-bottom));
    }

    .safe-left {
      padding-left: max(1rem, var(--safe-area-inset-left));
    }

    .safe-right {
      padding-right: max(1rem, var(--safe-area-inset-right));
    }

    .safe-all {
      padding: max(1rem, var(--safe-area-inset-top))
                  max(1rem, var(--safe-area-inset-right))
                  max(1rem, var(--safe-area-inset-bottom))
                  max(1rem, var(--safe-area-inset-left));
    }
  `;
  document.head.appendChild(style);
}

/**
 * Prevent scroll bounce on iOS
 */
export function preventScrollBounce(): void {
  if (typeof document === 'undefined') return;

  const style = document.createElement('style');
  style.textContent = `
    body {
      overscroll-behavior: none;
      -webkit-overflow-scrolling: touch;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Setup mobile-specific optimizations
 */
export function setupMobileOptimizations(options: MobileOptimizationOptions = {}): void {
  const {
    enablePWA = true,
    enableTouchOptimization = true,
    enablePerformanceOptimization = true,
    enableNetworkAwareness = true,
    customViewportConfig,
    customTouchTargetConfig,
  } = options;

  // Apply viewport configuration
  const viewportConfig = getOptimalViewportConfig(customViewportConfig);
  applyViewportConfig(viewportConfig);

  // Setup dynamic viewport height
  setupDynamicViewportHeight();

  // Prevent input zoom on iOS
  preventInputZoom();

  // Setup safe area insets
  setupSafeAreaInsets();

  // Prevent scroll bounce
  preventScrollBounce();

  // Touch optimization
  if (enableTouchOptimization) {
    setupTouchOptimization();
  }

  // Performance optimization
  if (enablePerformanceOptimization) {
    optimizeFontLoading();
    setupResourceHints();
    setupLazyImages();
  }

  // PWA support
  if (enablePWA && isPWASupported()) {
    // Service worker registration should be called separately
    // registerServiceWorker();
  }

  // Network awareness
  if (enableNetworkAwareness) {
    // Setup network listener if needed
    // setupNetworkListener(callback);
  }
}

/**
 * Check if device needs mobile optimizations
 */
export function needsMobileOptimization(): boolean {
  return isMobile() || hasTouchCapability();
}

/**
 * Get mobile optimization status
 */
export function getMobileOptimizationStatus(): {
  isMobile: boolean;
  hasTouch: boolean;
  isPWA: boolean;
  isPWASupported: boolean;
  connectionInfo: ConnectionInfo | null;
  isSlowConnection: boolean;
  prefersReducedMotion: boolean;
} {
  return {
    isMobile: isMobile(),
    hasTouch: hasTouchCapability(),
    isPWA: isRunningAsPWA(),
    isPWASupported: isPWASupported(),
    connectionInfo: getConnectionInfo(),
    isSlowConnection: isSlowConnection(),
    prefersReducedMotion: prefersReducedMotion(),
  };
}
