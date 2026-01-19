/**
 * Mobile keyboard handling utilities for better input field UX on mobile devices.
 */

/**
 * Keyboard state
 */
export interface KeyboardState {
  isVisible: boolean;
  height: number;
  viewportHeight: number;
  viewportHeightWithKeyboard: number;
}

/**
 * Keyboard event data
 */
export interface KeyboardEventData {
  state: 'visible' | 'hidden' | 'resizing';
  height: number;
  viewportHeight: number;
}

/**
 * Keyboard callback
 */
export type KeyboardCallback = (data: KeyboardEventData) => void;

/**
 * Viewport information for keyboard calculations
 */
export interface ViewportInfo {
  width: number;
  height: number;
  scrollHeight: number;
}

/**
 * Initial viewport height tracking
 */
let initialViewportHeight: number | null = null;

/**
 * Get the initial viewport height (before keyboard could be shown)
 */
export function getInitialViewportHeight(): number {
  if (typeof window === 'undefined') {
    return window.innerHeight;
  }

  if (initialViewportHeight === null) {
    initialViewportHeight = window.innerHeight;
  }

  return initialViewportHeight;
}

/**
 * Get the current viewport height
 */
export function getCurrentViewportHeight(): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  return window.innerHeight;
}

/**
 * Check if the virtual keyboard is visible on mobile
 */
export function isKeyboardVisible(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // Check if viewport has shrunk significantly (indicates keyboard)
  const currentHeight = window.innerHeight;
  const initialHeight = getInitialViewportHeight();
  const threshold = 150; // Minimum keyboard height in pixels

  return initialHeight - currentHeight > threshold;
}

/**
 * Estimate keyboard height
 */
export function getKeyboardHeight(): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  const initialHeight = getInitialViewportHeight();
  const currentHeight = window.innerHeight;

  if (initialHeight - currentHeight > 150) {
    return initialHeight - currentHeight;
  }

  return 0;
}

/**
 * Get the keyboard state
 */
export function getKeyboardState(): KeyboardState {
  if (typeof window === 'undefined') {
    return {
      isVisible: false,
      height: 0,
      viewportHeight: 0,
      viewportHeightWithKeyboard: 0,
    };
  }

  const viewportHeight = getInitialViewportHeight();
  const currentHeight = getCurrentViewportHeight();
  const keyboardHeight = getKeyboardHeight();

  return {
    isVisible: isKeyboardVisible(),
    height: keyboardHeight,
    viewportHeight,
    viewportHeightWithKeyboard: currentHeight,
  };
}

/**
 * Scroll element into view when keyboard is shown
 */
export function scrollIntoViewWithKeyboard(element: HTMLElement, offset: number = 20): void {
  if (typeof window === 'undefined') {
    return;
  }

  requestAnimationFrame(() => {
    const keyboardHeight = getKeyboardHeight();

    if (keyboardHeight > 0) {
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetPosition = rect.top + scrollTop - keyboardHeight - offset;

      window.scrollTo({
        top: targetPosition > 0 ? targetPosition : 0,
        behavior: 'smooth',
      });
    }
  });
}

/**
 * Adjust viewport height for keyboard
 */
export function adjustViewportForKeyboard(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const keyboardState = getKeyboardState();

  if (keyboardState.isVisible) {
    // Set CSS variable for keyboard height
    document.documentElement.style.setProperty('--keyboard-height', `${keyboardState.height}px`);
    document.documentElement.style.setProperty('--viewport-height-with-keyboard', `${keyboardState.viewportHeightWithKeyboard}px`);
  } else {
    document.documentElement.style.removeProperty('--keyboard-height');
    document.documentElement.style.removeProperty('--viewport-height-with-keyboard');
  }
}

/**
 * Create keyboard event listener
 */
export function createKeyboardListener(callback: KeyboardCallback): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  let lastHeight = getCurrentViewportHeight();

  const handleResize = () => {
    const currentHeight = getCurrentViewportHeight();
    const initialHeight = getInitialViewportHeight();
    const keyboardHeight = initialHeight - currentHeight;

    if (keyboardHeight > 150) {
      // Keyboard is visible
      callback({
        state: lastHeight !== currentHeight ? 'resizing' : 'visible',
        height: keyboardHeight,
        viewportHeight: currentHeight,
      });
    } else {
      // Keyboard is hidden
      callback({
        state: 'hidden',
        height: 0,
        viewportHeight: currentHeight,
      });
    }

    lastHeight = currentHeight;
  };

  // Use visual viewport API for more accurate keyboard detection
  const visualViewport = (window as unknown as { visualViewport?: { addEventListener: (event: string, handler: () => void) => void; removeEventListener: (event: string, handler: () => void) => void } }).visualViewport;
  if (visualViewport) {
    visualViewport.addEventListener('resize', handleResize);
  }

  // Fallback to window resize
  window.addEventListener('resize', handleResize);

  // Return cleanup function
  return () => {
    if (visualViewport) {
      visualViewport.removeEventListener('resize', handleResize);
    }
    window.removeEventListener('resize', handleResize);
  };
}

/**
 * Blur active input to dismiss keyboard
 */
export function dismissKeyboard(): void {
  if (typeof document === 'undefined') {
    return;
  }

  const activeElement = document.activeElement as HTMLElement;
  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
    activeElement.blur();
  }
}

/**
 * Focus input and show keyboard
 */
export function showKeyboard(element: HTMLInputElement | HTMLTextAreaElement): void {
  element.focus();

  // On iOS, sometimes need to explicitly set input type
  if (typeof element.setAttribute === 'function') {
    const originalType = element.getAttribute('inputmode');
    if (!originalType) {
      element.setAttribute('inputmode', 'text');
    }
  }
}

/**
 * Prevent zoom on input focus for iOS
 */
export function preventInputZoom(): void {
  if (typeof document === 'undefined') {
    return;
  }

  const style = document.createElement('style');
  style.textContent = `
    input[type="text"],
    input[type="email"],
    input[type="number"],
    input[type="tel"],
    input[type="url"],
    textarea {
      font-size: 16px !important;
    }
  `;

  document.head.appendChild(style);
}

/**
 * Set input mode for mobile keyboard
 */
export function setInputMode(element: HTMLInputElement | HTMLTextAreaElement, mode: 'text' | 'numeric' | 'decimal' | 'email' | 'tel' | 'search' | 'url' | 'none'): void {
  element.setAttribute('inputmode', mode);
}

/**
 * Check if element is in viewport when keyboard is visible
 */
export function isElementInViewportWithKeyboard(element: HTMLElement): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const rect = element.getBoundingClientRect();
  const keyboardHeight = getKeyboardHeight();
  const viewportHeight = getCurrentViewportHeight();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= viewportHeight - keyboardHeight &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Validate keyboard state object
 */
export function validateKeyboardState(state: unknown): state is KeyboardState {
  if (typeof state !== 'object' || state === null) {
    return false;
  }

  const s = state as Record<string, unknown>;

  return (
    typeof s.isVisible === 'boolean' &&
    typeof s.height === 'number' &&
    typeof s.viewportHeight === 'number' &&
    typeof s.viewportHeightWithKeyboard === 'number'
  );
}

/**
 * Get safe area for content with keyboard visible
 */
export function getSafeAreaWithKeyboard(): {
  top: number;
  bottom: number;
} {
  if (typeof window === 'undefined') {
    return { top: 0, bottom: 0 };
  }

  const keyboardHeight = getKeyboardHeight();

  return {
    top: 0,
    bottom: keyboardHeight,
  };
}
