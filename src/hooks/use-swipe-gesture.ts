/**
 * React hook for handling touch swipe gestures on mobile devices.
 */

'use client';

import { useRef, useCallback, useEffect } from 'react';
import type { TouchGestureState, SwipeEventData, SwipeOptions } from '@/lib/mobile-utils';
import {
  createTouchGestureState,
  startTouchGesture,
  updateTouchGestureState,
  meetsSwipeThreshold,
  calculateSwipeData,
} from '@/lib/mobile-utils';

/**
 * Hook return value
 */
export interface UseSwipeGestureReturn {
  // Ref to attach to element
  ref: (node: HTMLElement | null) => void;
  // Current swipe state
  isSwiping: boolean;
}

/**
 * Default swipe options
 */
const DEFAULT_SWIPE_OPTIONS: Required<Omit<SwipeOptions, 'onSwipe' | 'onSwipeLeft' | 'onSwipeRight' | 'onSwipeUp' | 'onSwipeDown'>> = {
  threshold: 50,
  restraint: 100,
  allowedTime: 500,
};

/**
 * React hook for handling touch swipe gestures
 *
 * @param options - Swipe configuration options
 * @returns Swipe gesture handler and state
 *
 * @example
 * ```tsx
 * const { ref, isSwiping } = useSwipeGesture({
 *   onSwipeLeft: () => console.log('Swiped left'),
 *   onSwipeRight: () => console.log('Swiped right'),
 *   threshold: 75,
 * });
 *
 * <div ref={ref}>Swipe me</div>
 * ```
 */
export function useSwipeGesture(options: SwipeOptions = {}): UseSwipeGestureReturn {
  const mergedOptions = { ...DEFAULT_SWIPE_OPTIONS, ...options };

  const nodeRef = useRef<HTMLElement | null>(null);
  const gestureStateRef = useRef<TouchGestureState>(createTouchGestureState());
  const isSwipingRef = useRef(false);

  // Set up event listeners
  const setRef = useCallback(
    (node: HTMLElement | null) => {
      nodeRef.current = node;
    },
    []
  );

  // Handle touch start
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!nodeRef.current) return;

    const touch = event.touches[0];
    gestureStateRef.current = startTouchGesture(touch.clientX, touch.clientY);
    isSwipingRef.current = false;
  }, []);

  // Handle touch move
  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!nodeRef.current) return;

    const touch = event.touches[0];
    gestureStateRef.current = updateTouchGestureState(
      gestureStateRef.current,
      touch.clientX,
      touch.clientY
    );
    isSwipingRef.current = true;
  }, []);

  // Handle touch end
  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      if (!nodeRef.current) return;

      // Check if swipe meets threshold criteria
      if (meetsSwipeThreshold(gestureStateRef.current, mergedOptions.threshold, mergedOptions.restraint, mergedOptions.allowedTime)) {
        const swipeData = calculateSwipeData(gestureStateRef.current);

        // Call general callback
        if (mergedOptions.onSwipe) {
          mergedOptions.onSwipe(swipeData);
        }

        // Call direction-specific callbacks
        switch (swipeData.direction) {
          case 'left':
            if (mergedOptions.onSwipeLeft) {
              mergedOptions.onSwipeLeft(swipeData);
            }
            break;
          case 'right':
            if (mergedOptions.onSwipeRight) {
              mergedOptions.onSwipeRight(swipeData);
            }
            break;
          case 'up':
            if (mergedOptions.onSwipeUp) {
              mergedOptions.onSwipeUp(swipeData);
            }
            break;
          case 'down':
            if (mergedOptions.onSwipeDown) {
              mergedOptions.onSwipeDown(swipeData);
            }
            break;
        }
      }

      // Reset gesture state
      gestureStateRef.current = createTouchGestureState();
      isSwipingRef.current = false;
    },
    [mergedOptions]
  );

  // Set up event listeners on the element
  useEffect(() => {
    const node = nodeRef.current;

    if (!node) {
      return;
    }

    // Add touch event listeners
    node.addEventListener('touchstart', handleTouchStart, { passive: true });
    node.addEventListener('touchmove', handleTouchMove, { passive: true });
    node.addEventListener('touchend', handleTouchEnd, { passive: true });
    node.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    // Cleanup
    return () => {
      node.removeEventListener('touchstart', handleTouchStart);
      node.removeEventListener('touchmove', handleTouchMove);
      node.removeEventListener('touchend', handleTouchEnd);
      node.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    ref: setRef,
    isSwiping: isSwipingRef.current,
  };
}
