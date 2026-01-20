/**
 * React hook for mobile optimizations
 *
 * Provides a convenient way to apply and manage mobile optimizations
 * in React components.
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type {
  MobileOptimizationOptions,
  ConnectionInfo,
  MobilePerformanceMetrics,
  PWAInstallPrompt,
} from '@/lib/mobile-optimization';

/**
 * Extended Navigator interface for connection API
 */
interface NavigatorWithConnection extends Navigator {
  connection?: ConnectionInfo;
  mozConnection?: ConnectionInfo;
  webkitConnection?: ConnectionInfo;
}
import {
  setupMobileOptimizations,
  needsMobileOptimization,
  getMobileOptimizationStatus,
  setupDynamicViewportHeight,
  setupNetworkListener,
  getCoreWebVitals,
  setupPWAInstallPrompt,
  showPWAInstallPrompt,
  setupSafeAreaInsets,
  isRunningAsPWA,
  isPWASupported,
} from '@/lib/mobile-optimization';

/**
 * Hook return value
 */
export interface UseMobileOptimizationReturn {
  // Status flags
  isMobile: boolean;
  isTouchDevice: boolean;
  isPWA: boolean;
  isPWASupported: boolean;
  isSlowConnection: boolean;
  prefersReducedMotion: boolean;

  // Network info
  connectionInfo: ConnectionInfo | null;

  // Performance metrics
  performanceMetrics: MobilePerformanceMetrics | null;

  // PWA
  pwaInstallPrompt: PWAInstallPrompt | null;
  showPWAInstall: () => Promise<{ outcome: 'accepted' | 'dismissed' }>;

  // Actions
  refresh: () => void;
}

/**
 * React hook for mobile optimizations
 *
 * @param options - Mobile optimization options
 * @returns Mobile optimization status and utilities
 *
 * @example
 * ```tsx
 * const { isMobile, isSlowConnection, showPWAInstall } = useMobileOptimization({
 *   enablePWA: true,
 *   enableTouchOptimization: true,
 * });
 *
 * if (isMobile && isSlowConnection) {
 *   // Show low bandwidth UI
 * }
 * ```
 */
export function useMobileOptimization(
  options: MobileOptimizationOptions = {}
): UseMobileOptimizationReturn {
  const [status, setStatus] = useState(() => getMobileOptimizationStatus());
  const [performanceMetrics, setPerformanceMetrics] = useState<MobilePerformanceMetrics | null>(null);
  const [pwaInstallPrompt, setPWAInstallPrompt] = useState<PWAInstallPrompt | null>(null);

  const optionsRef = useRef(options);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Refresh status
  const refresh = useCallback(() => {
    setStatus(getMobileOptimizationStatus());
  }, []);

  // Show PWA install prompt
  const showPWAInstall = useCallback(async () => {
    const result = await showPWAInstallPrompt();
    // Clear the prompt after showing
    setPWAInstallPrompt(null);
    return result;
  }, []);

  // Setup mobile optimizations on mount
  useEffect(() => {
    if (needsMobileOptimization()) {
      const cleanup = setupMobileOptimizations(options);

      return cleanup;
    }
  }, []);

  // Setup dynamic viewport height
  useEffect(() => {
    const cleanup = setupDynamicViewportHeight();

    return cleanup;
  }, []);

  // Setup safe area insets
  useEffect(() => {
    setupSafeAreaInsets();
  }, []);

  // Setup network listener
  useEffect(() => {
    const cleanup = setupNetworkListener((connection) => {
      setStatus((prev) => ({
        ...prev,
        connectionInfo: connection,
        isSlowConnection: connection.effectiveType === 'slow-2g' ||
                         connection.effectiveType === '2g' ||
                         connection.saveData,
      }));
    });

    return cleanup;
  }, []);

  // Setup PWA install prompt listener
  useEffect(() => {
    if (options.enablePWA !== false && isPWASupported()) {
      const cleanup = setupPWAInstallPrompt((prompt) => {
        setPWAInstallPrompt(prompt);
      });

      return cleanup;
    }
  }, [options.enablePWA]);

  // Collect performance metrics
  useEffect(() => {
    if (options.enablePerformanceOptimization !== false) {
      getCoreWebVitals().then((metrics) => {
        setPerformanceMetrics(metrics);
      });
    }
  }, [options.enablePerformanceOptimization]);

  return {
    isMobile: status.isMobile,
    isTouchDevice: status.hasTouch,
    isPWA: status.isPWA,
    isPWASupported: status.isPWASupported,
    isSlowConnection: status.isSlowConnection,
    prefersReducedMotion: status.prefersReducedMotion,
    connectionInfo: status.connectionInfo,
    performanceMetrics,
    pwaInstallPrompt,
    showPWAInstall,
    refresh,
  };
}

/**
 * Hook for pull-to-refresh functionality
 */
export function usePullToRefresh(
  enabled: boolean = true,
  onRefresh: () => void | Promise<void>,
  threshold: number = 80
) {
  const containerRef = useRef<HTMLElement | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    let startY = 0;
    let currentY = 0;
    let isDragging = false;

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
        setPullDistance(resistance);
        container.style.transform = `translateY(${resistance}px)`;
      }
    };

    const handleTouchEnd = async () => {
      if (!isDragging || isRefreshing) return;

      const diff = currentY - startY;

      if (diff > threshold) {
        setIsRefreshing(true);
        container.style.transition = 'transform 0.3s ease-out';
        container.style.transform = 'translateY(60px)';

        try {
          await onRefresh();
        } finally {
          container.style.transform = '';
          setIsRefreshing(false);
        }
      } else {
        container.style.transition = 'transform 0.2s ease-out';
        container.style.transform = '';
      }

      setPullDistance(0);
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
  }, [enabled, onRefresh, threshold, isRefreshing]);

  return {
    containerRef,
    isRefreshing,
    pullDistance,
  };
}

/**
 * Hook for safe area insets
 */
export function useSafeAreaInsets() {
  const [insets, setInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateInsets = () => {
      const styles = window.getComputedStyle(document.documentElement);

      const top = parseInt(styles.getPropertyValue('--safe-area-inset-top') || '0', 10);
      const right = parseInt(styles.getPropertyValue('--safe-area-inset-right') || '0', 10);
      const bottom = parseInt(styles.getPropertyValue('--safe-area-inset-bottom') || '0', 10);
      const left = parseInt(styles.getPropertyValue('--safe-area-inset-left') || '0', 10);

      setInsets({ top, right, bottom, left });
    };

    updateInsets();

    // Update on resize
    window.addEventListener('resize', updateInsets);
    window.addEventListener('orientationchange', updateInsets);

    return () => {
      window.removeEventListener('resize', updateInsets);
      window.removeEventListener('orientationchange', updateInsets);
    };
  }, []);

  return insets;
}

/**
 * Hook for haptic feedback
 */
export function useHapticFeedback() {
  const vibrate = useCallback((pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      return navigator.vibrate(pattern);
    }
    return false;
  }, []);

  const light = useCallback(() => vibrate(10), [vibrate]);
  const medium = useCallback(() => vibrate(20), [vibrate]);
  const heavy = useCallback(() => vibrate(30), [vibrate]);
  const success = useCallback(() => vibrate([10, 50, 10]), [vibrate]);
  const error = useCallback(() => vibrate([30, 50, 30, 50, 30]), [vibrate]);
  const warning = useCallback(() => vibrate([20, 50, 20]), [vibrate]);

  return {
    vibrate,
    light,
    medium,
    heavy,
    success,
    error,
    warning,
  };
}

/**
 * Hook for network-aware loading
 */
export function useNetworkAwareLoading() {
  const [strategy, setStrategy] = useState(() => {
    const navigatorWithConnection = navigator as NavigatorWithConnection;
    const connection = navigatorWithConnection.connection ||
                      navigatorWithConnection.mozConnection ||
                      navigatorWithConnection.webkitConnection;

    if (!connection) {
      return {
        lazyLoadImages: false,
        lazyLoadComponents: false,
        preloadCritical: true,
        useLowResImages: false,
        disableAnimations: false,
      };
    }

    const isSlow = connection.effectiveType === 'slow-2g' ||
                   connection.effectiveType === '2g' ||
                   connection.saveData;

    return {
      lazyLoadImages: isSlow,
      lazyLoadComponents: isSlow,
      preloadCritical: !isSlow,
      useLowResImages: isSlow,
      disableAnimations: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    };
  });

  useEffect(() => {
    const navigatorWithConnection = navigator as NavigatorWithConnection;
    const connection = navigatorWithConnection.connection ||
                      navigatorWithConnection.mozConnection ||
                      navigatorWithConnection.webkitConnection;

    if (!connection) return;

    const updateStrategy = () => {
      const isSlow = connection.effectiveType === 'slow-2g' ||
                     connection.effectiveType === '2g' ||
                     connection.saveData;

      setStrategy({
        lazyLoadImages: isSlow,
        lazyLoadComponents: isSlow,
        preloadCritical: !isSlow,
        useLowResImages: isSlow,
        disableAnimations: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      });
    };

    connection.addEventListener('change', updateStrategy);

    return () => {
      connection.removeEventListener('change', updateStrategy);
    };
  }, []);

  return strategy;
}

/**
 * Hook for mobile-optimized image loading
 */
export function useOptimizedImage(src: string, enabled: boolean = true) {
  const [optimizedSrc, setOptimizedSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setOptimizedSrc(src);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setIsLoading(false);
      return;
    }

    // Check if we should lazy load based on connection
    const navigatorWithConnection = navigator as NavigatorWithConnection;
    const connection = navigatorWithConnection.connection;
    const isSlow = connection?.effectiveType === 'slow-2g' ||
                   connection?.effectiveType === '2g' ||
                   connection?.saveData;

    if (isSlow) {
      // Use lower quality version for slow connections
      // This would typically involve a CDN URL transformation
      setOptimizedSrc(src);
    } else {
      setOptimizedSrc(src);
    }

    setIsLoading(false);
  }, [src, enabled]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setError('Failed to load image');
    setIsLoading(false);
  }, []);

  return {
    src: optimizedSrc,
    isLoading,
    error,
    imgRef,
    handleLoad,
    handleError,
  };
}

/**
 * Hook for PWA install prompt
 */
export function usePWAInstall() {
  const [prompt, setPrompt] = useState<PWAInstallPrompt | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if PWA is supported
    const supported = 'serviceWorker' in navigator && ('onbeforeinstallprompt' in window);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setIsSupported(supported);

    if (!supported) return;

    // Check if already installed
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setIsInstalled(isRunningAsPWA());

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as PWAInstallPrompt);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const show = useCallback(async () => {
    if (!prompt) return { outcome: 'dismissed' as const };

    try {
      const result = await prompt.prompt();
      setPrompt(null);
      return result;
    } catch (error) {
      console.error('Failed to show install prompt:', error);
      return { outcome: 'dismissed' as const };
    }
  }, [prompt]);

  const dismiss = useCallback(() => {
    setPrompt(null);
  }, []);

  return {
    isSupported,
    isInstalled,
    prompt,
    show,
    dismiss,
  };
}

/**
 * Hook for preventing zoom on input focus
 */
export function usePreventInputZoom() {
  useEffect(() => {
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

    return () => {
      document.head.removeChild(style);
    };
  }, []);
}
