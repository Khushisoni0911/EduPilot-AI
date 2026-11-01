/**
 * Performance Utility Functions
 *
 * DOM events fire at extremely high rates:
 * - mousemove: up to 1000/second
 * - scroll: 60/second
 * - selectionchange: dozens/second
 *
 * Without debouncing/throttling, we'd be doing expensive DOM work
 * far more often than needed. These utilities fix that.
 */

// ============================================
// Debounce
// ============================================

/**
 * DEBOUNCE: Delays execution until after a quiet period.
 * "Only run after the user STOPS doing something."
 *
 * EXAMPLE: User selects text
 * - Without debounce: runs 50 times during drag
 * - With debounce (200ms): runs ONCE, 200ms after drag ends
 *
 * @param fn - Function to debounce
 * @param delay - Milliseconds to wait after last call
 * @returns Debounced function with cancel method
 */
export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delay: number
): ((...args: TArgs) => void) & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: TArgs): void => {
    // Cancel previous scheduled call
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    // Schedule new call
    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn(...args);
    }, delay);
  };

  // Allow external cancellation (important for cleanup)
  debounced.cancel = (): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

// ============================================
// Throttle
// ============================================

/**
 * THROTTLE: Limits execution to once per time window.
 * "Run at most once every X milliseconds."
 *
 * EXAMPLE: Scroll event updating FAB position
 * - Without throttle: 60 updates/second
 * - With throttle (16ms ≈ 60fps): max 60 updates/second but no more
 *
 * @param fn - Function to throttle
 * @param limit - Minimum milliseconds between calls
 */
export function throttle<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  limit: number
): (...args: TArgs) => void {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: TArgs): void => {
    const now = Date.now();
    const remaining = limit - (now - lastCall);

    if (remaining <= 0) {
      // Enough time has passed — call immediately
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCall = now;
      fn(...args);
    } else if (timeoutId === null) {
      // Schedule a trailing call
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn(...args);
      }, remaining);
    }
  };
}

// ============================================
// Deferred Promise
// ============================================

/**
 * Creates a Promise that can be resolved/rejected from outside.
 * Useful for converting callback-based APIs to Promise-based.
 */
export interface DeferredPromise<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: Error) => void;
}

export function createDeferred<T>(): DeferredPromise<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

// ============================================
// RAF-based Scheduler
// ============================================

/**
 * Schedule a function to run on the next animation frame.
 * Use for any DOM position updates to avoid layout thrashing.
 *
 * Layout thrashing: reading layout → writing layout → reading layout → ...
 * Browser has to recalculate layout every time you interleave reads/writes.
 * Batching writes in RAF prevents this.
 */
export function scheduleUpdate(fn: () => void): () => void {
  const rafId = requestAnimationFrame(fn);
  return () => cancelAnimationFrame(rafId);
}