/**
 * MutationObserver Manager
 *
 * Manages DOM observation for Single Page Applications (SPAs).
 *
 * WHY THIS EXISTS:
 * Modern websites like YouTube, Medium, and GitHub are SPAs —
 * they update the DOM without full page reloads.
 *
 * Our content script only runs once on initial page load.
 * If the page changes content dynamically (YouTube navigating
 * between videos), we need to react to those changes.
 *
 * MutationObserver watches the DOM for changes and fires a
 * callback whenever the DOM tree is modified.
 *
 * PERFORMANCE NOTE:
 * MutationObserver can fire VERY frequently on complex pages.
 * We debounce our handlers to avoid performance issues.
 */

import { debounce } from '../../shared/utils/debounce';

export interface ObserverConfig {
  /** Element to observe (defaults to document.body) */
  target?: Element;
  /** MutationObserverInit options */
  options?: MutationObserverInit;
  /** Callback to run when mutations occur */
  onMutation: (mutations: MutationRecord[]) => void;
  /** Debounce delay in ms (default: 300ms) */
  debounceMs?: number;
}

export class MutationManager {
  private observers: Map<string, MutationObserver> = new Map();

  // ============================================
  // Public API
  // ============================================

  /**
   * Start observing DOM mutations.
   *
   * @param id - Unique identifier for this observer (for cleanup)
   * @param config - Observer configuration
   */
  observe(id: string, config: ObserverConfig): void {
    // Disconnect existing observer with same ID
    this.disconnect(id);

    const {
      target = document.body,
      options = { childList: true, subtree: true, attributes: false },
      onMutation,
      debounceMs = 300,
    } = config;

    // Debounce the handler to prevent excessive firing
    const debouncedHandler = debounce(onMutation, debounceMs);

    const observer = new MutationObserver(debouncedHandler);
    observer.observe(target, options);

    this.observers.set(id, observer);

    console.info(`[MutationManager] Observer '${id}' started`);
  }

  /**
   * Observe URL changes in SPAs.
   * SPAs change window.history without triggering navigation events.
   * We watch for URL changes using a polling-based approach
   * combined with pushState/popState interception.
   *
   * @param onChange - Callback when URL changes
   */
  observeURLChanges(onChange: (newUrl: string, oldUrl: string) => void): () => void {
    let currentUrl = window.location.href;

    // Method 1: popstate event (back/forward navigation)
    const handlePopState = () => {
      const newUrl = window.location.href;
      if (newUrl !== currentUrl) {
        onChange(newUrl, currentUrl);
        currentUrl = newUrl;
      }
    };
    window.addEventListener('popstate', handlePopState);

    // Method 2: Intercept pushState (programmatic navigation)
    // SPAs use history.pushState() to navigate without page reload
    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);

    window.history.pushState = (...args) => {
      originalPushState(...args);
      const newUrl = window.location.href;
      if (newUrl !== currentUrl) {
        // Small delay to let the page update its DOM
        setTimeout(() => {
          onChange(newUrl, currentUrl);
          currentUrl = newUrl;
        }, 100);
      }
    };

    window.history.replaceState = (...args) => {
      originalReplaceState(...args);
      const newUrl = window.location.href;
      if (newUrl !== currentUrl) {
        setTimeout(() => {
          onChange(newUrl, currentUrl);
          currentUrl = newUrl;
        }, 100);
      }
    };

    // Return cleanup function
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }

  /**
   * Disconnect a specific observer.
   */
  disconnect(id: string): void {
    const observer = this.observers.get(id);
    if (observer) {
      observer.disconnect();
      this.observers.delete(id);
    }
  }

  /**
   * Disconnect ALL observers. Call during cleanup.
   */
  disconnectAll(): void {
    this.observers.forEach((observer, id) => {
      observer.disconnect();
      console.info(`[MutationManager] Observer '${id}' disconnected`);
    });
    this.observers.clear();
  }

  get activeCount(): number {
    return this.observers.size;
  }
}

// Singleton instance for use across the content script
export const globalMutationManager = new MutationManager();