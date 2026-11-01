/**
 * Memory-Safe Event Manager
 *
 * THE PROBLEM:
 * In a long-running content script, adding event listeners without
 * removing them causes memory leaks. The browser keeps references to
 * the event handlers, preventing garbage collection.
 *
 * THE SOLUTION:
 * A centralized manager that tracks ALL event listeners and provides
 * a single `cleanup()` call to remove ALL of them at once.
 *
 * USAGE:
 * const events = new EventManager();
 * events.add(document, 'click', handler);
 * events.add(window, 'scroll', scrollHandler);
 * // Later, during cleanup:
 * events.removeAll(); // Removes BOTH listeners
 */

type EventTarget = HTMLElement | Document | Window | Element | ShadowRoot;

interface RegisteredListener {
  target: EventTarget;
  type: string;
  handler: EventListenerOrEventListenerObject;
  options?: AddEventListenerOptions | boolean;
}

export class EventManager {
  /** All registered listeners — tracked for cleanup */
  private listeners: RegisteredListener[] = [];

  /** Whether this manager has been cleaned up */
  private isDestroyed = false;

  // ============================================
  // Public API
  // ============================================

  /**
   * Add an event listener and automatically track it.
   *
   * @param target - DOM element or window/document
   * @param type - Event type ('click', 'scroll', etc.)
   * @param handler - Event handler function
   * @param options - AddEventListenerOptions
   */
  add<K extends keyof HTMLElementEventMap>(
    target: HTMLElement,
    type: K,
    handler: (event: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions | boolean
  ): void;

  add<K extends keyof DocumentEventMap>(
    target: Document,
    type: K,
    handler: (event: DocumentEventMap[K]) => void,
    options?: AddEventListenerOptions | boolean
  ): void;

  add<K extends keyof WindowEventMap>(
    target: Window,
    type: K,
    handler: (event: WindowEventMap[K]) => void,
    options?: AddEventListenerOptions | boolean
  ): void;

  // Implementation signature
  add(
    target: EventTarget,
    type: string,
    handler: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions | boolean
  ): void {
    if (this.isDestroyed) {
      console.warn('[EventManager] Cannot add listener — manager is destroyed');
      return;
    }

    target.addEventListener(type, handler, options);

    this.listeners.push({ target, type, handler, options });
  }

  /**
   * Remove a specific event listener.
   */
  remove(
    target: EventTarget,
    type: string,
    handler: EventListenerOrEventListenerObject
  ): void {
    target.removeEventListener(type, handler);

    this.listeners = this.listeners.filter(
      (l) => !(l.target === target && l.type === type && l.handler === handler)
    );
  }

  /**
   * Remove ALL tracked event listeners.
   * Call this during content script cleanup or page navigation.
   */
  removeAll(): void {
    this.listeners.forEach(({ target, type, handler, options }) => {
      target.removeEventListener(type, handler, options);
    });

    this.listeners = [];
    this.isDestroyed = true;

    console.info('[EventManager] All event listeners removed');
  }

  /**
   * Get count of active listeners (useful for debugging).
   */
  get count(): number {
    return this.listeners.length;
  }
}

// Export a singleton for use across the content script
export const globalEventManager = new EventManager();