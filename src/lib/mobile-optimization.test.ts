/**
 * Tests for mobile optimization utilities
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isPWASupported,
  isRunningAsPWA,
  getConnectionInfo,
  isSlowConnection,
  getOptimalViewportConfig,
  getTouchTargetConfig,
  getLoadingStrategy,
  getOptimalImageSettings,
  getOptimizedImageUrl,
  getMobileOptimizationStatus,
  needsMobileOptimization,
  setupMobileOptimizations,
  setupDynamicViewportHeight,
  setupSafeAreaInsets,
  preventInputZoom,
  preventScrollBounce,
  enhanceTouchTarget,
  applyTouchAction,
  preventDoubleTapZoom,
  vibrate,
  addHapticFeedback,
} from './mobile-optimization';
import { generateMobileCSSBundle, injectMobileCSS } from './mobile-css-utils';

// Mock window, navigator, and document
const mockWindow = {
  innerWidth: 375,
  innerHeight: 667,
  matchMedia: vi.fn((query: string) => ({
    matches: query === '(display-mode: standalone)' ? false : false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })),
  scrollTo: vi.fn(),
  navigator: {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    serviceWorker: {
      register: vi.fn(() => Promise.resolve({})),
    },
    connection: {
      effectiveType: '4g',
      downlink: 10,
      rtt: 100,
      saveData: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
    vibrate: vi.fn(() => true),
  },
  screen: {
    width: 375,
    height: 667,
  },
  devicePixelRatio: 2,
  getComputedStyle: vi.fn(() => ({
    getPropertyValue: vi.fn(() => '0px'),
  })),
  requestAnimationFrame: vi.fn((cb) => setTimeout(cb, 0)),
  cancelAnimationFrame: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

const mockDocument = {
  head: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
  querySelector: vi.fn(() => null),
  createElement: vi.fn(() => ({
    name: '',
    content: '',
    textContent: '',
    style: {},
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
  documentElement: {
    style: {
      setProperty: vi.fn(),
      removeProperty: vi.fn(),
    },
  },
  body: {
    style: {},
  },
};

describe('mobile-optimization', () => {
  beforeEach(() => {
    // Setup mocks
    global.window = mockWindow as any;
    global.navigator = mockWindow.navigator as any;
    global.document = mockDocument as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('PWA Support', () => {
    it('should check if PWA is supported', () => {
      expect(isPWASupported()).toBe(true);
    });

    it('should check if running as PWA', () => {
      expect(isRunningAsPWA()).toBe(false);
    });

    it('should return false when service worker is not available', () => {
      global.window = { ...mockWindow, navigator: { ...mockWindow.navigator, serviceWorker: undefined } } as any;
      expect(isPWASupported()).toBe(false);
    });

    it('should return true when running in standalone mode', () => {
      mockWindow.matchMedia = vi.fn((query: string) => ({
        matches: query === '(display-mode: standalone)' ? true : false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      }));
      expect(isRunningAsPWA()).toBe(true);
    });
  });

  describe('Network Awareness', () => {
    it('should get connection info', () => {
      const info = getConnectionInfo();
      expect(info).toEqual({
        effectiveType: '4g',
        downlink: 10,
        rtt: 100,
        saveData: false,
      });
    });

    it('should return null when connection API is not available', () => {
      global.window = { ...mockWindow, navigator: { ...mockWindow.navigator, connection: undefined } } as any;
      expect(getConnectionInfo()).toBeNull();
    });

    it('should detect slow connection', () => {
      global.window = {
        ...mockWindow,
        navigator: {
          ...mockWindow.navigator,
          connection: {
            effectiveType: '2g',
            downlink: 0.5,
            rtt: 300,
            saveData: false,
          },
        },
      } as any;
      expect(isSlowConnection()).toBe(true);
    });

    it('should detect slow connection when saveData is true', () => {
      global.window = {
        ...mockWindow,
        navigator: {
          ...mockWindow.navigator,
          connection: {
            effectiveType: '4g',
            downlink: 10,
            rtt: 100,
            saveData: true,
          },
        },
      } as any;
      expect(isSlowConnection()).toBe(true);
    });

    it('should return false for fast connections', () => {
      expect(isSlowConnection()).toBe(false);
    });
  });

  describe('Viewport Configuration', () => {
    it('should get optimal viewport config with defaults', () => {
      const config = getOptimalViewportConfig();
      expect(config).toEqual({
        width: 375,
        height: 667,
        scale: 1,
        minScale: 1,
        maxScale: 5,
        userScalable: true,
      });
    });

    it('should accept custom viewport config', () => {
      const config = getOptimalViewportConfig({
        maxScale: 3,
        userScalable: false,
      });
      expect(config.maxScale).toBe(3);
      expect(config.userScalable).toBe(false);
    });

    it('should use device-width and device-height for viewport', () => {
      global.window = {
        ...mockWindow,
        innerWidth: mockWindow.innerWidth,
        innerHeight: mockWindow.innerHeight,
      } as any;
      const config = getOptimalViewportConfig();
      expect(config.width).toBe(375);
      expect(config.height).toBe(667);
    });
  });

  describe('Touch Target Configuration', () => {
    it('should get default touch target config', () => {
      const config = getTouchTargetConfig();
      expect(config).toEqual({
        minSize: 44,
        minSpacing: 8,
        hitboxPadding: 10,
      });
    });

    it('should accept custom touch target config', () => {
      const config = getTouchTargetConfig({
        minSize: 48,
        hitboxPadding: 12,
      });
      expect(config.minSize).toBe(48);
      expect(config.minSpacing).toBe(8);
      expect(config.hitboxPadding).toBe(12);
    });
  });

  describe('Loading Strategy', () => {
    it('should get loading strategy for fast connection', () => {
      const strategy = getLoadingStrategy();
      expect(strategy).toEqual({
        lazyLoadImages: false,
        lazyLoadComponents: false,
        preloadCritical: true,
        useLowResImages: false,
        disableAnimations: false,
      });
    });

    it('should get loading strategy for slow connection', () => {
      global.window = {
        ...mockWindow,
        navigator: {
          ...mockWindow.navigator,
          connection: {
            effectiveType: '2g',
            downlink: 0.5,
            rtt: 300,
            saveData: false,
          },
        },
      } as any;
      const strategy = getLoadingStrategy();
      expect(strategy).toEqual({
        lazyLoadImages: true,
        lazyLoadComponents: true,
        preloadCritical: false,
        useLowResImages: true,
        disableAnimations: false,
      });
    });

    it('should get loading strategy with saveData enabled', () => {
      global.window = {
        ...mockWindow,
        navigator: {
          ...mockWindow.navigator,
          connection: {
            effectiveType: '4g',
            downlink: 10,
            rtt: 100,
            saveData: true,
          },
        },
      } as any;
      const strategy = getLoadingStrategy();
      expect(strategy.lazyLoadImages).toBe(true);
      expect(strategy.useLowResImages).toBe(true);
    });
  });

  describe('Image Optimization', () => {
    it('should get default image settings', () => {
      const settings = getOptimalImageSettings();
      expect(settings.quality).toBe(85);
      expect(settings.format).toBe('auto');
      expect(settings.lazy).toBe(false);
    });

    it('should adjust image settings for slow connection', () => {
      global.window = {
        ...mockWindow,
        navigator: {
          ...mockWindow.navigator,
          connection: {
            effectiveType: '2g',
            downlink: 0.5,
            rtt: 300,
            saveData: false,
          },
        },
      } as any;
      const settings = getOptimalImageSettings();
      expect(settings.quality).toBe(70);
      expect(settings.lazy).toBe(true);
    });

    it('should adjust image dimensions for device pixel ratio', () => {
      const settings = getOptimalImageSettings();
      expect(settings.maxWidth).toBe(1920 * 2);
      expect(settings.maxHeight).toBe(1080 * 2);
    });

    it('should accept custom image settings', () => {
      const settings = getOptimalImageSettings({
        quality: 90,
        maxWidth: 1000,
        format: 'webp',
      });
      expect(settings.quality).toBe(90);
      expect(settings.maxWidth).toBe(1000 * 2); // Still adjusted for pixel ratio
      expect(settings.format).toBe('webp');
    });

    it('should return optimized image URL', () => {
      const url = getOptimizedImageUrl('/image.jpg', 800, 600, 85);
      expect(url).toBe('/image.jpg');
    });
  });

  describe('Mobile Optimization Status', () => {
    it('should get mobile optimization status', () => {
      const status = getMobileOptimizationStatus();
      expect(status).toHaveProperty('isMobile');
      expect(status).toHaveProperty('hasTouch');
      expect(status).toHaveProperty('isPWA');
      expect(status).toHaveProperty('isPWASupported');
      expect(status).toHaveProperty('connectionInfo');
      expect(status).toHaveProperty('isSlowConnection');
      expect(status).toHaveProperty('prefersReducedMotion');
    });

    it('should check if device needs mobile optimization', () => {
      const result = needsMobileOptimization();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Touch Optimization', () => {
    it('should enhance touch target', () => {
      const element = {
        style: {
          minHeight: '',
          minWidth: '',
          padding: '',
        },
      };
      enhanceTouchTarget(element as any);
      expect(element.style.minHeight).toBe('44px');
      expect(element.style.minWidth).toBe('44px');
      expect(element.style.padding).toBe('10px');
    });

    it('should apply touch action', () => {
      const element = {
        style: {
          touchAction: '',
        },
      };
      applyTouchAction(element as any, 'manipulation');
      expect(element.style.touchAction).toBe('manipulation');
    });

    it('should prevent double tap zoom', () => {
      const element = {
        style: {
          touchAction: '',
        },
      };
      preventDoubleTapZoom(element as any);
      expect(element.style.touchAction).toBe('manipulation');
    });

    it('should vibrate device', () => {
      const result = vibrate(100);
      expect(result).toBe(true);
      expect(mockWindow.navigator.vibrate).toHaveBeenCalledWith(100);
    });

    it('should add haptic feedback for light', () => {
      addHapticFeedback('light');
      expect(mockWindow.navigator.vibrate).toHaveBeenCalledWith(10);
    });

    it('should add haptic feedback for medium', () => {
      addHapticFeedback('medium');
      expect(mockWindow.navigator.vibrate).toHaveBeenCalledWith(20);
    });

    it('should add haptic feedback for heavy', () => {
      addHapticFeedback('heavy');
      expect(mockWindow.navigator.vibrate).toHaveBeenCalledWith(30);
    });

    it('should add haptic feedback for success', () => {
      addHapticFeedback('success');
      expect(mockWindow.navigator.vibrate).toHaveBeenCalledWith([10, 50, 10]);
    });

    it('should add haptic feedback for error', () => {
      addHapticFeedback('error');
      expect(mockWindow.navigator.vibrate).toHaveBeenCalledWith([30, 50, 30, 50, 30]);
    });

    it('should add haptic feedback for warning', () => {
      addHapticFeedback('warning');
      expect(mockWindow.navigator.vibrate).toHaveBeenCalledWith([20, 50, 20]);
    });

    it('should return false when vibrate is not supported', () => {
      global.window = { ...mockWindow, navigator: { ...mockWindow.navigator, vibrate: undefined } } as any;
      const result = vibrate(100);
      expect(result).toBe(false);
    });
  });

  describe('Setup Functions', () => {
    it('should setup dynamic viewport height', () => {
      const cleanup = setupDynamicViewportHeight();
      expect(global.window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(global.window.addEventListener).toHaveBeenCalledWith('orientationchange', expect.any(Function));

      cleanup();
      expect(global.window.removeEventListener).toHaveBeenCalled();
    });

    it('should setup safe area insets', () => {
      setupSafeAreaInsets();
      expect(mockDocument.head.appendChild).toHaveBeenCalled();
    });

    it('should prevent input zoom', () => {
      preventInputZoom();
      expect(mockDocument.head.appendChild).toHaveBeenCalled();
      const style = mockDocument.createElement();
      expect(style.textContent).toContain('font-size: 16px !important');
    });

    it('should prevent scroll bounce', () => {
      preventScrollBounce();
      expect(mockDocument.head.appendChild).toHaveBeenCalled();
      const style = mockDocument.createElement();
      expect(style.textContent).toContain('overscroll-behavior: none');
    });

    it('should setup mobile optimizations', () => {
      const cleanup = setupMobileOptimizations({
        enablePWA: true,
        enableTouchOptimization: true,
        enablePerformanceOptimization: true,
      });

      expect(cleanup).toBeTypeOf('function');
    });
  });
});

describe('mobile-css-utils', () => {
  beforeEach(() => {
    global.window = mockWindow as any;
    global.document = mockDocument as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('CSS Generation', () => {
    it('should generate safe area CSS', () => {
      const css = generateMobileCSSBundle({ safeArea: true });
      expect(css).toContain('--safe-area-inset-top');
      expect(css).toContain('.safe-top');
      expect(css).toContain('.safe-bottom');
      expect(css).toContain('.safe-left');
      expect(css).toContain('.safe-right');
      expect(css).toContain('.safe-all');
    });

    it('should generate touch target CSS', () => {
      const css = generateMobileCSSBundle({ touchTargets: true });
      expect(css).toContain('.touch-target');
      expect(css).toContain('min-width: 44px');
      expect(css).toContain('min-height: 44px');
      expect(css).toContain('touch-action: manipulation');
    });

    it('should generate viewport CSS', () => {
      const css = generateMobileCSSBundle({ viewport: true });
      expect(css).toContain('--vh: 1vh');
      expect(css).toContain('.h-screen');
      expect(css).toContain('.min-h-screen');
    });

    it('should generate typography CSS', () => {
      const css = generateMobileCSSBundle({ typography: true });
      expect(css).toContain('.text-responsive');
      expect(css).toContain('clamp(');
      expect(css).toContain('.text-mobile-base');
    });

    it('should generate spacing CSS', () => {
      const css = generateMobileCSSBundle({ spacing: true });
      expect(css).toContain('.mobile-container');
      expect(css).toContain('.mobile-gap');
      expect(css).toContain('.mobile-grid');
    });

    it('should generate performance CSS', () => {
      const css = generateMobileCSSBundle({ performance: true });
      expect(css).toContain('.gpu-accelerated');
      expect(css).toContain('.smooth-scroll');
      expect(css).toContain('.no-bounce');
      expect(css).toContain('prefers-reduced-motion');
    });

    it('should generate interaction CSS', () => {
      const css = generateMobileCSSBundle({ interaction: true });
      expect(css).toContain('-webkit-tap-highlight-color');
      expect(css).toContain('.active-scale');
      expect(css).toContain('.active-opacity');
      expect(css).toContain('.no-select');
    });

    it('should generate forms CSS', () => {
      const css = generateMobileCSSBundle({ forms: true });
      expect(css).toContain('font-size: 16px !important');
      expect(css).toContain('.input-mobile');
      expect(css).toContain('.checkbox-mobile');
    });

    it('should generate layout CSS', () => {
      const css = generateMobileCSSBundle({ layout: true });
      expect(css).toContain('.flex-mobile');
      expect(css).toContain('.stack-mobile');
      expect(css).toContain('.sidebar-mobile');
      expect(css).toContain('.bottom-sheet');
    });

    it('should generate complete CSS bundle with all options', () => {
      const css = generateMobileCSSBundle();
      expect(css).toContain('--safe-area-inset');
      expect(css).toContain('.touch-target');
      expect(css).toContain('--vh');
      expect(css).toContain('.text-responsive');
      expect(css).toContain('.mobile-container');
      expect(css).toContain('.gpu-accelerated');
      expect(css).toContain('-webkit-tap-highlight-color');
      expect(css).toContain('font-size: 16px');
      expect(css).toContain('.flex-mobile');
    });

    it('should generate CSS with only selected options', () => {
      const css = generateMobileCSSBundle({
        safeArea: true,
        touchTargets: true,
        viewport: false,
        typography: false,
        spacing: false,
        performance: false,
        interaction: false,
        forms: false,
        layout: false,
      });
      expect(css).toContain('--safe-area-inset');
      expect(css).toContain('.touch-target');
      expect(css).not.toContain('--vh');
      expect(css).not.toContain('.text-responsive');
    });
  });

  describe('CSS Injection', () => {
    it('should inject mobile CSS into document', () => {
      const cleanup = injectMobileCSS();
      expect(mockDocument.head.appendChild).toHaveBeenCalled();
      expect(mockDocument.createElement).toHaveBeenCalled();

      cleanup();
      expect(mockDocument.head.removeChild).toHaveBeenCalled();
    });

    it('should inject CSS with custom options', () => {
      const cleanup = injectMobileCSS({
        safeArea: true,
        touchTargets: false,
      });
      expect(mockDocument.head.appendChild).toHaveBeenCalled();

      cleanup();
    });
  });
});
