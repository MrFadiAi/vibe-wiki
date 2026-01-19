/**
 * Tests for mobile analytics utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getMobileAnalyticsData,
  getMobilePerformanceMetrics,
  getBatteryInfo,
  trackMobileTouch,
  getMobileTouchSummary,
  hasNotch,
  getViewportCategory,
  trackMobileError,
  getMobileErrorSummary,
  clearMobileAnalytics,
  exportMobileAnalytics,
} from './mobile-analytics';

describe('mobile-analytics', () => {
  let originalLocalStorage: Storage;
  let localStorageMock: Record<string, string>;

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    originalLocalStorage = global.localStorage;

    global.localStorage = {
      getItem: vi.fn((key) => localStorageMock[key] || null),
      setItem: vi.fn((key, value) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      get length() {
        return Object.keys(localStorageMock).length;
      },
      key: vi.fn((index) => Object.keys(localStorageMock)[index] || null),
    };

    // Mock window and navigator
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 812,
    });
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      configurable: true,
      value: 2,
    });
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      configurable: true,
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    });
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 5,
    });

    // Mock window.getComputedStyle
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: vi.fn().mockReturnValue('0px'),
    } as CSSStyleDeclaration);

    // Mock matchMedia for standalone mode
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
  });

  afterEach(() => {
    global.localStorage = originalLocalStorage;
    localStorageMock = {};
    vi.clearAllMocks();
  });

  describe('getMobileAnalyticsData', () => {
    it('returns complete mobile analytics data', () => {
      const data = getMobileAnalyticsData();

      expect(data).toHaveProperty('deviceInfo');
      expect(data).toHaveProperty('orientation');
      expect(data).toHaveProperty('hasTouch');
      expect(data).toHaveProperty('pixelRatio');
      expect(data).toHaveProperty('viewportWidth');
      expect(data).toHaveProperty('viewportHeight');
      expect(data).toHaveProperty('isStandalone');
      expect(data).toHaveProperty('connectionType');
      expect(data).toHaveProperty('effectiveConnectionType');
      expect(data).toHaveProperty('saveData');
      expect(data).toHaveProperty('safeAreaInsets');
    });

    it('detects portrait orientation', () => {
      const data = getMobileAnalyticsData();
      expect(data.orientation).toBe('portrait');
    });

    it('detects touch capability', () => {
      const data = getMobileAnalyticsData();
      expect(data.hasTouch).toBe(true);
    });

    it('gets correct pixel ratio', () => {
      const data = getMobileAnalyticsData();
      expect(data.pixelRatio).toBe(2);
    });

    it('gets safe area insets', () => {
      const data = getMobileAnalyticsData();
      expect(data.safeAreaInsets).toEqual({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      });
    });
  });

  describe('getMobilePerformanceMetrics', () => {
    it('returns null when performance API not available', () => {
      const originalPerformance = window.performance;
      Object.defineProperty(window, 'performance', {
        writable: true,
        configurable: true,
        value: undefined,
      });

      expect(getMobilePerformanceMetrics()).toBeNull();

      // Restore
      Object.defineProperty(window, 'performance', {
        writable: true,
        configurable: true,
        value: originalPerformance,
      });
    });

    it('returns metrics when performance API available', () => {
      const metrics = getMobilePerformanceMetrics();

      expect(metrics).not.toBeNull();
      expect(metrics).toHaveProperty('firstContentfulPaint');
      expect(metrics).toHaveProperty('largestContentfulPaint');
      expect(metrics).toHaveProperty('timeToInteractive');
    });
  });

  describe('getBatteryInfo', () => {
    it('returns null when battery API not available', async () => {
      const batteryInfo = getBatteryInfo();
      // Most test environments don't have battery API
      await expect(batteryInfo).resolves.toBeNull();
    });

    it('returns battery info when available', async () => {
      // Mock navigator.getBattery
      const mockBattery = {
        level: 0.8,
        charging: true,
        chargingTime: 3600,
        dischargingTime: Infinity,
      };

      Object.defineProperty(navigator, 'getBattery', {
        writable: true,
        configurable: true,
        value: vi.fn().mockResolvedValue(mockBattery),
      });

      const batteryInfo = await getBatteryInfo();

      expect(batteryInfo).toEqual({
        level: 0.8,
        charging: true,
        chargingTime: 3600,
        dischargingTime: Infinity,
      });

      // Cleanup
      Object.defineProperty(navigator, 'getBattery', {
        writable: true,
        configurable: true,
        value: undefined,
      });
    });
  });

  describe('trackMobileTouch', () => {
    it('stores touch event in localStorage', () => {
      const touchEvent = {
        type: 'tap' as const,
        target: 'button-submit',
        x: 100,
        y: 200,
        timestamp: Date.now(),
        velocity: 1.5,
        direction: 'up' as const,
      };

      trackMobileTouch(touchEvent);

      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('limits stored touches to 100', () => {
      // Add 101 touches
      for (let i = 0; i < 101; i++) {
        trackMobileTouch({
          type: 'tap',
          target: `button-${i}`,
          x: i,
          y: i,
          timestamp: Date.now() + i,
        });
      }

      const data = localStorageMock['vibe-wiki-mobile-touches'];
      expect(data).toBeTruthy();

      const touches = JSON.parse(data);
      expect(touches.length).toBe(100);
    });

    it('handles localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      expect(() => {
        trackMobileTouch({
          type: 'tap',
          target: 'button',
          x: 100,
          y: 200,
          timestamp: Date.now(),
        });
      }).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('getMobileTouchSummary', () => {
    it('returns empty summary when no touches', () => {
      const summary = getMobileTouchSummary();

      expect(summary).toEqual({
        totalTouches: 0,
        touchesByType: {},
        averageTouchVelocity: 0,
      });
    });

    it('calculates touch summary from stored data', () => {
      localStorageMock['vibe-wiki-mobile-touches'] = JSON.stringify([
        { type: 'tap', target: 'button1', x: 100, y: 200, timestamp: Date.now(), velocity: 1.0 },
        { type: 'tap', target: 'button2', x: 150, y: 250, timestamp: Date.now(), velocity: 2.0 },
        { type: 'swipe', target: 'screen', x: 200, y: 300, timestamp: Date.now(), velocity: 3.0, direction: 'left' },
      ]);

      const summary = getMobileTouchSummary();

      expect(summary.totalTouches).toBe(3);
      expect(summary.touchesByType.tap).toBe(2);
      expect(summary.touchesByType.swipe).toBe(1);
      expect(summary.averageTouchVelocity).toBe(2.0);
    });

    it('handles malformed data gracefully', () => {
      localStorageMock['vibe-wiki-mobile-touches'] = 'invalid json';

      expect(() => getMobileTouchSummary()).not.toThrow();
    });
  });

  describe('hasNotch', () => {
    it('returns false when no safe area insets', () => {
      expect(hasNotch()).toBe(false);
    });

    it('returns true when safe area insets detected', () => {
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        getPropertyValue: vi.fn((prop) => {
          if (prop === 'env(safe-area-inset-top)') return '44px';
          return '0px';
        }),
      } as CSSStyleDeclaration);

      expect(hasNotch()).toBe(true);
    });
  });

  describe('getViewportCategory', () => {
    it('returns small for very small screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });

      expect(getViewportCategory()).toBe('small');
    });

    it('returns medium for small screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      expect(getViewportCategory()).toBe('medium');
    });

    it('returns large for medium screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800,
      });

      expect(getViewportCategory()).toBe('large');
    });

    it('returns xlarge for large screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      expect(getViewportCategory()).toBe('xlarge');
    });
  });

  describe('trackMobileError', () => {
    it('stores error in localStorage', () => {
      const error = {
        type: 'viewport_mismatch' as const,
        message: 'Viewport width mismatch detected',
        timestamp: Date.now(),
        context: { expected: 375, actual: 400 },
      };

      trackMobileError(error);

      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('limits stored errors to 50', () => {
      // Add 51 errors
      for (let i = 0; i < 51; i++) {
        trackMobileError({
          type: 'performance_issue',
          message: `Error ${i}`,
          timestamp: Date.now() + i,
          context: {},
        });
      }

      const data = localStorageMock['vibe-wiki-mobile-errors'];
      expect(data).toBeTruthy();

      const errors = JSON.parse(data);
      expect(errors.length).toBe(50);
    });
  });

  describe('getMobileErrorSummary', () => {
    it('returns empty summary when no errors', () => {
      const summary = getMobileErrorSummary();

      expect(summary).toEqual({
        totalErrors: 0,
        errorsByType: {},
        recentErrors: [],
      });
    });

    it('calculates error summary from stored data', () => {
      const errors = [
        { type: 'viewport_mismatch' as const, message: 'Error 1', timestamp: Date.now(), context: {} },
        { type: 'touch_issue' as const, message: 'Error 2', timestamp: Date.now(), context: {} },
        { type: 'viewport_mismatch' as const, message: 'Error 3', timestamp: Date.now(), context: {} },
      ];

      localStorageMock['vibe-wiki-mobile-errors'] = JSON.stringify(errors);

      const summary = getMobileErrorSummary();

      expect(summary.totalErrors).toBe(3);
      expect(summary.errorsByType.viewport_mismatch).toBe(2);
      expect(summary.errorsByType.touch_issue).toBe(1);
      expect(summary.recentErrors.length).toBe(3);
    });

    it('returns last 10 errors as recent', () => {
      const errors = Array.from({ length: 15 }, (_, i) => ({
        type: 'performance_issue' as const,
        message: `Error ${i}`,
        timestamp: Date.now() + i,
        context: {},
      }));

      localStorageMock['vibe-wiki-mobile-errors'] = JSON.stringify(errors);

      const summary = getMobileErrorSummary();

      expect(summary.recentErrors.length).toBe(10);
    });
  });

  describe('clearMobileAnalytics', () => {
    it('removes all mobile analytics keys', () => {
      localStorageMock['vibe-wiki-mobile-touches'] = '[]';
      localStorageMock['vibe-wiki-mobile-errors'] = '[]';
      localStorageMock['other-key'] = 'value';

      clearMobileAnalytics();

      expect(localStorageMock['vibe-wiki-mobile-touches']).toBeUndefined();
      expect(localStorageMock['vibe-wiki-mobile-errors']).toBeUndefined();
      expect(localStorageMock['other-key']).toBe('value');
    });
  });

  describe('exportMobileAnalytics', () => {
    it('exports complete analytics data', () => {
      localStorageMock['vibe-wiki-mobile-touches'] = JSON.stringify([
        { type: 'tap', target: 'button', x: 100, y: 200, timestamp: Date.now() },
      ]);
      localStorageMock['vibe-wiki-mobile-errors'] = JSON.stringify([
        { type: 'viewport_mismatch', message: 'Error', timestamp: Date.now(), context: {} },
      ]);

      const exported = exportMobileAnalytics();

      expect(exported).toHaveProperty('device');
      expect(exported).toHaveProperty('touches');
      expect(exported).toHaveProperty('errors');
      expect(exported).toHaveProperty('touchSummary');
      expect(exported).toHaveProperty('errorSummary');
    });

    it('calculates summaries in export', () => {
      const touches = [
        { type: 'tap' as const, target: 'button1', x: 100, y: 200, timestamp: Date.now() },
        { type: 'swipe' as const, target: 'screen', x: 200, y: 300, timestamp: Date.now(), direction: 'left' },
      ];
      const errors = [
        { type: 'viewport_mismatch' as const, message: 'Error', timestamp: Date.now(), context: {} },
      ];

      localStorageMock['vibe-wiki-mobile-touches'] = JSON.stringify(touches);
      localStorageMock['vibe-wiki-mobile-errors'] = JSON.stringify(errors);

      const exported = exportMobileAnalytics();

      expect(exported.touchSummary.totalTouches).toBe(2);
      expect(exported.errorSummary.totalErrors).toBe(1);
    });

    it('handles empty data gracefully', () => {
      const exported = exportMobileAnalytics();

      expect(exported.touches).toEqual([]);
      expect(exported.errors).toEqual([]);
      expect(exported.touchSummary.totalTouches).toBe(0);
      expect(exported.errorSummary.totalErrors).toBe(0);
    });
  });
});
