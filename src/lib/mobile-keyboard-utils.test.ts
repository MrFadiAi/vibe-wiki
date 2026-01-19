/**
 * Tests for mobile keyboard utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getInitialViewportHeight,
  getCurrentViewportHeight,
  isKeyboardVisible,
  getKeyboardHeight,
  getKeyboardState,
  scrollIntoViewWithKeyboard,
  adjustViewportForKeyboard,
  dismissKeyboard,
  showKeyboard,
  setInputMode,
  isElementInViewportWithKeyboard,
  validateKeyboardState,
  getSafeAreaWithKeyboard,
} from './mobile-keyboard-utils';

describe('mobile-keyboard-utils', () => {
  let originalInnerHeight: number;

  beforeEach(() => {
    vi.useFakeTimers();

    originalInnerHeight = window.innerHeight;

    // Reset initial viewport height
    vi.clearAllMocks();

    // Mock window.scrollTo
    window.scrollTo = vi.fn();

    // Mock requestAnimationFrame to execute immediately
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      return window.setTimeout(() => callback(performance.now()), 0);
    });

    // Mock cancelAnimationFrame
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      window.clearTimeout(id);
    });

    // Mock document methods
    Object.defineProperty(document.documentElement, 'style', {
      writable: true,
      configurable: true,
      value: {
        setProperty: vi.fn(),
        removeProperty: vi.fn(),
      },
    });

    // Mock getComputedStyle
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: vi.fn().mockReturnValue('0px'),
    } as CSSStyleDeclaration);
  });

  afterEach(() => {
    vi.useRealTimers();

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });
  });

  describe('getInitialViewportHeight', () => {
    it('returns the initial viewport height', () => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 812,
      });

      const height = getInitialViewportHeight();
      expect(height).toBe(812);
    });

    it('caches the initial height', () => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 812,
      });

      const firstCall = getInitialViewportHeight();

      // Change viewport height
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 500,
      });

      const secondCall = getInitialViewportHeight();

      expect(firstCall).toBe(812);
      expect(secondCall).toBe(812); // Should still be cached value
    });
  });

  describe('getCurrentViewportHeight', () => {
    it('returns current viewport height', () => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 600,
      });

      expect(getCurrentViewportHeight()).toBe(600);
    });
  });

  describe('isKeyboardVisible', () => {
    it('returns true when viewport shrunk significantly', () => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 500, // Initial was 812, so this is >150px difference
      });

      // Set initial height first
      getInitialViewportHeight();

      expect(isKeyboardVisible()).toBe(true);
    });

    it('returns false when viewport unchanged', () => {
      expect(isKeyboardVisible()).toBe(false);
    });

    it('returns false for small changes', () => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 750, // Only ~60px difference from 812
      });

      getInitialViewportHeight();

      expect(isKeyboardVisible()).toBe(false);
    });
  });

  describe('getKeyboardHeight', () => {
    it('returns height difference when keyboard visible', () => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 500,
      });

      getInitialViewportHeight();

      expect(getKeyboardHeight()).toBeGreaterThan(0);
    });

    it('returns 0 when keyboard not visible', () => {
      expect(getKeyboardHeight()).toBe(0);
    });
  });

  describe('getKeyboardState', () => {
    it('returns complete keyboard state', () => {
      const state = getKeyboardState();

      expect(state).toHaveProperty('isVisible');
      expect(state).toHaveProperty('height');
      expect(state).toHaveProperty('viewportHeight');
      expect(state).toHaveProperty('viewportHeightWithKeyboard');
    });

    it('detects visible keyboard', () => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 500,
      });

      getInitialViewportHeight();

      const state = getKeyboardState();
      expect(state.isVisible).toBe(true);
      expect(state.height).toBeGreaterThan(0);
    });
  });

  describe('scrollIntoViewWithKeyboard', () => {
    it('scrolls element into view when keyboard is visible', () => {
      // First set a normal height to establish the initial viewport
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 812,
      });
      getInitialViewportHeight();

      // Then simulate keyboard appearing by reducing viewport height
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 500,
      });

      const mockElement = {
        getBoundingClientRect: vi.fn().mockReturnValue({
          top: 600,
          bottom: 700,
          left: 0,
          right: 375,
        }),
      } as unknown as HTMLElement;

      scrollIntoViewWithKeyboard(mockElement);

      // Run timers to flush requestAnimationFrame callback
      vi.runAllTimers();

      expect(window.scrollTo).toHaveBeenCalledWith({
        top: expect.any(Number),
        behavior: 'smooth',
      });
    });

    it('does not scroll when keyboard not visible', () => {
      const mockElement = {
        getBoundingClientRect: vi.fn().mockReturnValue({
          top: 100,
          bottom: 200,
          left: 0,
          right: 375,
        }),
      } as unknown as HTMLElement;

      scrollIntoViewWithKeyboard(mockElement);

      expect(window.scrollTo).not.toHaveBeenCalled();
    });
  });

  describe('adjustViewportForKeyboard', () => {
    it('sets CSS variables when keyboard visible', () => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 500,
      });

      getInitialViewportHeight();

      const mockStyle = document.documentElement.style;

      adjustViewportForKeyboard();

      expect(mockStyle.setProperty).toHaveBeenCalledWith(
        '--keyboard-height',
        expect.stringContaining('px')
      );
    });

    it('removes CSS variables when keyboard hidden', () => {
      const mockStyle = document.documentElement.style;

      adjustViewportForKeyboard();

      expect(mockStyle.removeProperty).toHaveBeenCalledWith('--keyboard-height');
    });
  });

  describe('dismissKeyboard', () => {
    it('blurs active input element', () => {
      const mockElement = {
        tagName: 'INPUT',
        blur: vi.fn(),
      };

      Object.defineProperty(document, 'activeElement', {
        writable: true,
        configurable: true,
        value: mockElement,
      });

      dismissKeyboard();

      expect(mockElement.blur).toHaveBeenCalled();
    });

    it('does nothing when no active input', () => {
      Object.defineProperty(document, 'activeElement', {
        writable: true,
        configurable: true,
        value: null,
      });

      expect(() => dismissKeyboard()).not.toThrow();
    });
  });

  describe('showKeyboard', () => {
    it('focuses input element', () => {
      const mockElement = {
        focus: vi.fn(),
        getAttribute: vi.fn(),
        setAttribute: vi.fn(),
      };

      showKeyboard(mockElement as HTMLInputElement);

      expect(mockElement.focus).toHaveBeenCalled();
    });

    it('sets inputmode if not already set', () => {
      const mockElement = {
        focus: vi.fn(),
        getAttribute: vi.fn().mockReturnValue(null),
        setAttribute: vi.fn(),
      };

      showKeyboard(mockElement as HTMLInputElement);

      expect(mockElement.setAttribute).toHaveBeenCalledWith('inputmode', 'text');
    });

    it('does not override existing inputmode', () => {
      const mockElement = {
        focus: vi.fn(),
        getAttribute: vi.fn().mockReturnValue('numeric'),
        setAttribute: vi.fn(),
      };

      showKeyboard(mockElement as HTMLInputElement);

      expect(mockElement.setAttribute).not.toHaveBeenCalled();
    });
  });

  describe('setInputMode', () => {
    it('sets inputmode attribute', () => {
      const mockElement = {
        setAttribute: vi.fn(),
      };

      setInputMode(mockElement as HTMLInputElement, 'numeric');

      expect(mockElement.setAttribute).toHaveBeenCalledWith('inputmode', 'numeric');
    });

    it('supports all input modes', () => {
      const mockElement = {
        setAttribute: vi.fn(),
      };

      const modes = ['text', 'numeric', 'decimal', 'email', 'tel', 'search', 'url', 'none'] as const;

      for (const mode of modes) {
        setInputMode(mockElement as any, mode);
        expect(mockElement.setAttribute).toHaveBeenCalledWith('inputmode', mode);
      }
    });
  });

  describe('isElementInViewportWithKeyboard', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
    });

    it('returns true when element is fully visible', () => {
      // Set normal height first
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 812,
      });
      getInitialViewportHeight();

      // Then set to a smaller height (keyboard visible)
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 500,
      });

      const mockElement = {
        getBoundingClientRect: vi.fn().mockReturnValue({
          top: 100,
          left: 50,
          bottom: 180,
          right: 325,
        }),
      } as unknown as HTMLElement;

      expect(isElementInViewportWithKeyboard(mockElement)).toBe(true);
    });

    it('returns false when element is below keyboard', () => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 500,
      });
      getInitialViewportHeight();

      const mockElement = {
        getBoundingClientRect: vi.fn().mockReturnValue({
          top: 400,
          left: 50,
          bottom: 600,
          right: 325,
        }),
      } as unknown as HTMLElement;

      expect(isElementInViewportWithKeyboard(mockElement)).toBe(false);
    });

    it('returns false when element is outside viewport', () => {
      const mockElement = {
        getBoundingClientRect: vi.fn().mockReturnValue({
          top: -100,
          left: 50,
          bottom: 50,
          right: 325,
        }),
      } as unknown as HTMLElement;

      expect(isElementInViewportWithKeyboard(mockElement)).toBe(false);
    });
  });

  describe('validateKeyboardState', () => {
    it('validates correct keyboard state', () => {
      const state = {
        isVisible: true,
        height: 312,
        viewportHeight: 812,
        viewportHeightWithKeyboard: 500,
      };

      expect(validateKeyboardState(state)).toBe(true);
    });

    it('rejects invalid state', () => {
      const state = {
        isVisible: 'true',
        height: 312,
        viewportHeight: 812,
        viewportHeightWithKeyboard: 500,
      };

      expect(validateKeyboardState(state)).toBe(false);
    });

    it('rejects non-objects', () => {
      expect(validateKeyboardState(null)).toBe(false);
      expect(validateKeyboardState(undefined)).toBe(false);
    });
  });

  describe('getSafeAreaWithKeyboard', () => {
    it('returns zero safe area when keyboard hidden', () => {
      const safeArea = getSafeAreaWithKeyboard();

      expect(safeArea).toEqual({
        top: 0,
        bottom: 0,
      });
    });

    it('returns keyboard height as bottom safe area', () => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 500,
      });
      getInitialViewportHeight();

      const safeArea = getSafeAreaWithKeyboard();

      expect(safeArea.bottom).toBeGreaterThan(0);
    });
  });
});
