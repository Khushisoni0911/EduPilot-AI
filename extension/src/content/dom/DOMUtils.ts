/**
 * DOM Utility Library
 *
 * A collection of pure, reusable DOM utility functions.
 * All functions are:
 * - Pure (no side effects — just compute and return)
 * - Null-safe (won't crash on missing elements)
 * - TypeScript typed
 *
 * DESIGN PRINCIPLE: Utility functions should do ONE thing well.
 * No function here has side effects. They only read or compute.
 */

// ============================================
// Element Queries (Null-Safe)
// ============================================

/**
 * Safe querySelector — returns null instead of throwing.
 * With type narrowing for TypeScript.
 */
export function qs<T extends Element = Element>(
  selector: string,
  parent: Document | Element = document
): T | null {
  try {
    return parent.querySelector<T>(selector);
  } catch {
    return null;
  }
}

/**
 * Safe querySelectorAll — returns empty array instead of throwing.
 */
export function qsa<T extends Element = Element>(
  selector: string,
  parent: Document | Element = document
): T[] {
  try {
    return Array.from(parent.querySelectorAll<T>(selector));
  } catch {
    return [];
  }
}

/**
 * Check if an element is visible in the viewport.
 */
export function isInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Check if an element is part of our extension (not the host page).
 * Used to avoid processing extension UI elements as page content.
 */
export function isExtensionElement(element: Element | null): boolean {
  if (!element) return false;
  return (
    element.id.startsWith('edupilot-ai') ||
    element.closest('[data-extension="edupilot-ai"]') !== null
  );
}

// ============================================
// Element Creation
// ============================================

/**
 * Create an element with properties in one call.
 *
 * @example
 * const div = createElement('div', {
 *   id: 'my-div',
 *   className: 'flex items-center',
 *   dataset: { action: 'close' }
 * });
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: {
    id?: string;
    className?: string;
    innerHTML?: string;
    textContent?: string;
    style?: Partial<CSSStyleDeclaration>;
    dataset?: Record<string, string>;
    attributes?: Record<string, string>;
    children?: HTMLElement[];
  } = {}
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);

  if (options.id) el.id = options.id;
  if (options.className) el.className = options.className;
  if (options.innerHTML) el.innerHTML = options.innerHTML;
  if (options.textContent) el.textContent = options.textContent;

  if (options.style) {
    Object.assign(el.style, options.style);
  }

  if (options.dataset) {
    Object.entries(options.dataset).forEach(([key, value]) => {
      el.dataset[key] = value;
    });
  }

  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      el.setAttribute(key, value);
    });
  }

  if (options.children) {
    options.children.forEach((child) => el.appendChild(child));
  }

  return el;
}

// ============================================
// Text & Content Utilities
// ============================================

/**
 * Get the word count of a string.
 */
export function getWordCount(text: string): number {
  return text.trim().split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Check if a string is meaningful text worth processing.
 * Filters out whitespace-only, single characters, etc.
 */
export function isMeaningfulText(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.length >= 3 && getWordCount(trimmed) >= 1;
}

/**
 * Truncate text to a maximum length with ellipsis.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Get the visible text content of an element
 * (excludes hidden elements and script/style content).
 */
export function getVisibleText(element: HTMLElement): string {
  // Clone to avoid modifying the actual DOM
  const clone = element.cloneNode(true) as HTMLElement;

  // Remove script and style tags
  clone.querySelectorAll('script, style, noscript').forEach((el) => el.remove());

  // Remove hidden elements
  clone.querySelectorAll('[aria-hidden="true"], [hidden]').forEach((el) => el.remove());

  return clone.innerText.trim();
}

/**
 * Extract the main language from a lang attribute.
 * Handles 'en-US' → 'en', 'zh-Hans' → 'zh', etc.
 */
export function getLanguageCode(langAttr: string): string {
  return langAttr.split('-')[0].toLowerCase();
}

// ============================================
// URL & Domain Utilities
// ============================================

/**
 * Safely parse a URL, returning null if invalid.
 */
export function parseURL(urlString: string): URL | null {
  try {
    return new URL(urlString);
  } catch {
    return null;
  }
}

/**
 * Get the clean domain from a URL (without www prefix).
 */
export function getDomain(url: string): string {
  const parsed = parseURL(url);
  if (!parsed) return '';
  return parsed.hostname.replace(/^www\./, '');
}

/**
 * Check if the current page is likely a supported content page.
 */
export function isSupportedPage(url: string): boolean {
  const parsed = parseURL(url);
  if (!parsed) return false;

  const unsupportedProtocols = ['chrome:', 'chrome-extension:', 'about:', 'data:', 'file:'];
  return !unsupportedProtocols.includes(parsed.protocol);
}

// ============================================
// Scroll Utilities
// ============================================

/**
 * Get the current scroll position.
 */
export function getScrollPosition(): { x: number; y: number } {
  return {
    x: window.scrollX || document.documentElement.scrollLeft,
    y: window.scrollY || document.documentElement.scrollTop,
  };
}

/**
 * Get total document height.
 */
export function getDocumentHeight(): number {
  return Math.max(
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.clientHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight
  );
}

/**
 * Calculate scroll progress as a percentage (0-100).
 */
export function getScrollProgress(): number {
  const scrollTop = window.scrollY;
  const docHeight = getDocumentHeight() - window.innerHeight;
  if (docHeight <= 0) return 100;
  return Math.round((scrollTop / docHeight) * 100);
}