/**
 * React hook for handling mobile keyboard state and interactions.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { KeyboardState, KeyboardEventData } from '@/lib/mobile-keyboard-utils';
import {
  getKeyboardState,
  createKeyboardListener,
  scrollIntoViewWithKeyboard,
  adjustViewportForKeyboard,
  dismissKeyboard,
  showKeyboard,
  setInputMode,
} from '@/lib/mobile-keyboard-utils';

/**
 * Hook return value
 */
export interface UseMobileKeyboardReturn {
  // Current keyboard state
  keyboardState: KeyboardState;
  // Whether keyboard is visible
  isVisible: boolean;
  // Current keyboard height in pixels
  height: number;
  // Programmatically dismiss keyboard
  dismiss: () => void;
  // Focus input and show keyboard
  show: (element: HTMLInputElement | HTMLTextAreaElement) => void;
  // Scroll element into view with keyboard
  scrollIntoView: (element: HTMLElement, offset?: number) => void;
}

/**
 * React hook for mobile keyboard state management
 *
 * @returns Keyboard state and control functions
 *
 * @example
 * ```tsx
 * const { isVisible, height, dismiss, show } = useMobileKeyboard();
 *
 * <div style={{ paddingBottom: isVisible ? height : 0 }}>
 *   <input onFocus={() => console.log('Keyboard shown')} />
 * </div>
 * ```
 */
export function useMobileKeyboard(): UseMobileKeyboardReturn {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>(() => getKeyboardState());

  // Track cleanup function for keyboard listener
  const cleanupRef = useRef<(() => void) | null>(null);

  // Update keyboard state on keyboard events
  useEffect(() => {
    const cleanup = createKeyboardListener((data: KeyboardEventData) => {
      setKeyboardState((prev) => ({
        ...prev,
        isVisible: data.state !== 'hidden',
        height: data.height,
        viewportHeightWithKeyboard: data.viewportHeight,
      }));

      // Adjust CSS variables for layout
      adjustViewportForKeyboard();
    });

    cleanupRef.current = cleanup;

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  // Programmatically dismiss keyboard
  const dismiss = useCallback(() => {
    dismissKeyboard();
  }, []);

  // Focus input and show keyboard
  const show = useCallback((element: HTMLInputElement | HTMLTextAreaElement) => {
    showKeyboard(element);
  }, []);

  // Scroll element into view with keyboard
  const scrollIntoView = useCallback((element: HTMLElement, offset = 20) => {
    scrollIntoViewWithKeyboard(element, offset);
  }, []);

  return {
    keyboardState,
    isVisible: keyboardState.isVisible,
    height: keyboardState.height,
    dismiss,
    show,
    scrollIntoView,
  };
}

/**
 * Hook for auto-scrolling input into view when keyboard is shown
 *
 * @param elementRef - Ref to the input element
 * @param offset - Optional offset from keyboard
 *
 * @example
 * ```tsx
 * const inputRef = useRef<HTMLInputElement>(null);
 * useAutoScrollWithKeyboard(inputRef);
 *
 * <input ref={inputRef} />
 * ```
 */
export function useAutoScrollWithKeyboard(
  elementRef: React.RefObject<HTMLElement>,
  offset = 20
): void {
  const { isVisible, height } = useMobileKeyboard();

  useEffect(() => {
    const element = elementRef.current;

    if (element && isVisible) {
      scrollIntoViewWithKeyboard(element, offset);
    }
  }, [isVisible, height, elementRef, offset]);
}

/**
 * Hook for setting input mode on mobile
 *
 * @param mode - Input mode for mobile keyboard
 *
 * @example
 * ```tsx
 * const inputRef = useRef<HTMLInputElement>(null);
 * useInputMode(inputRef, 'numeric');
 *
 * <input ref={inputRef} type="text" />
 * ```
 */
export function useInputMode(
  elementRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>,
  mode: 'text' | 'numeric' | 'decimal' | 'email' | 'tel' | 'search' | 'url' | 'none' = 'text'
): void {
  useEffect(() => {
    const element = elementRef.current;

    if (element) {
      setInputMode(element, mode);
    }
  }, [elementRef, mode]);
}
