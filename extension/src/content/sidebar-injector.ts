/**
 * Sidebar Injector
 *
 * This is the bridge between the content script world and
 * the sidebar React app world.
 *
 * HOW SIDEBAR INJECTION WORKS:
 * ─────────────────────────────────────────────────────
 * 1. Content script creates a <div> in the page DOM
 * 2. Creates a Shadow DOM inside that div (for style isolation)
 * 3. Mounts a React app inside the Shadow DOM
 * 4. The React app renders the sidebar UI
 *
 * WHY SHADOW DOM?
 * - Prevents the website's CSS from affecting our sidebar
 * - Prevents our CSS from affecting the website
 * - Total style isolation = professional appearance everywhere
 *
 * ─────────────────────────────────────────────────────
 * Without Shadow DOM, Tailwind classes on our sidebar
 * could conflict with the host page's styles.
 * ─────────────────────────────────────────────────────
 */

import React from 'react';
import ReactDOM from 'react-dom/client';

import SidebarApp from '../sidebar/App';

// ============================================
// Constants
// ============================================

const SIDEBAR_HOST_ID = 'ai-student-assistant-host';
const SIDEBAR_ROOT_ID = 'ai-student-assistant-root';
const SIDEBAR_WIDTH_DEFAULT = 380;

// Track injection state
let sidebarRoot: ReactDOM.Root | null = null;
let hostElement: HTMLElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let isSidebarOpen = false;

// ============================================
// Main Injection Function
// ============================================

/**
 * Inject the sidebar into the current web page.
 * Creates a Shadow DOM host and mounts the React sidebar app.
 */
export function injectSidebar(): void {
  // Don't inject twice
  if (document.getElementById(SIDEBAR_HOST_ID)) {
    console.info('[SidebarInjector] Sidebar already injected');
    return;
  }

  try {
    // Step 1: Create the host element (lives in page DOM)
    hostElement = document.createElement('div');
    hostElement.id = SIDEBAR_HOST_ID;
    hostElement.setAttribute('data-extension', 'ai-student-assistant');

    // Apply host element styles (positions it on the right side)
    applyHostStyles(hostElement);

    // Step 2: Create Shadow DOM (style isolation)
    shadowRoot = hostElement.attachShadow({ mode: 'open' });

    // Step 3: Inject Tailwind styles into Shadow DOM
    // We need to add styles because Shadow DOM is isolated from page styles
    injectStyles(shadowRoot);

    // Step 4: Create the React mount point inside Shadow DOM
    const reactRoot = document.createElement('div');
    reactRoot.id = SIDEBAR_ROOT_ID;
    reactRoot.style.cssText = 'height: 100%; width: 100%;';
    shadowRoot.appendChild(reactRoot);

    // Step 5: Mount React app into Shadow DOM
    sidebarRoot = ReactDOM.createRoot(reactRoot);
    sidebarRoot.render(
      React.createElement(React.StrictMode, null,
        React.createElement(SidebarApp, {
          onClose: closeSidebar,
          isOpen: false,
        })
      )
    );

    // Step 6: Append host to page body
    document.body.appendChild(hostElement);

    console.info('[SidebarInjector] ✅ Sidebar injected successfully');
  } catch (error) {
    console.error('[SidebarInjector] ❌ Failed to inject sidebar:', error);
  }
}

// ============================================
// Sidebar State Control
// ============================================

/**
 * Toggle sidebar open/closed
 */
export function toggleSidebar(): void {
  if (isSidebarOpen) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

/**
 * Open the sidebar (slide in from the right)
 */
export function openSidebar(): void {
  if (!hostElement) return;

  isSidebarOpen = true;
  hostElement.style.transform = 'translateX(0)';
  hostElement.style.opacity = '1';

  // Re-render with open state
  rerenderSidebar(true);

  // Adjust page content so sidebar doesn't overlap
  adjustPageLayout(true);

  console.info('[SidebarInjector] Sidebar opened');
}

/**
 * Close the sidebar (slide out to the right)
 */
export function closeSidebar(): void {
  if (!hostElement) return;

  isSidebarOpen = false;
  hostElement.style.transform = `translateX(${SIDEBAR_WIDTH_DEFAULT}px)`;
  hostElement.style.opacity = '0';

  // Re-render with closed state
  rerenderSidebar(false);

  // Restore page layout
  adjustPageLayout(false);

  console.info('[SidebarInjector] Sidebar closed');
}

/**
 * Check if sidebar is currently open
 */
export function isSidebarVisible(): boolean {
  return isSidebarOpen;
}

// ============================================
// Private Helpers
// ============================================

/**
 * Apply CSS styles to the host element.
 * The host element is what positions the sidebar on the page.
 */
function applyHostStyles(element: HTMLElement): void {
  element.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    right: 0 !important;
    width: ${SIDEBAR_WIDTH_DEFAULT}px !important;
    height: 100vh !important;
    z-index: 2147483647 !important;
    transform: translateX(${SIDEBAR_WIDTH_DEFAULT}px) !important;
    opacity: 0 !important;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                opacity 0.3s ease !important;
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15) !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  `;
}

/**
 * Inject CSS into the Shadow DOM.
 * This includes our Tailwind styles for the sidebar.
 */
function injectStyles(shadow: ShadowRoot): void {
  // Create a link element pointing to our compiled CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  // This path works because we listed sidebar CSS in web_accessible_resources
  link.href = chrome.runtime.getURL('styles/sidebar.css');
  shadow.appendChild(link);

  // Also inject base reset styles
  const style = document.createElement('style');
  style.textContent = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    :host {
      all: initial;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                   Oxygen, Ubuntu, sans-serif;
    }

    #${SIDEBAR_ROOT_ID} {
      height: 100%;
      width: 100%;
      overflow: hidden;
    }
  `;
  shadow.appendChild(style);
}

/**
 * Re-render the sidebar React app with updated props
 */
function rerenderSidebar(isOpen: boolean): void {
  if (!sidebarRoot) return;

  sidebarRoot.render(
    React.createElement(React.StrictMode, null,
      React.createElement(SidebarApp, {
        onClose: closeSidebar,
        isOpen,
      })
    )
  );
}

/**
 * Adjust the main page layout to accommodate the sidebar.
 * This prevents the sidebar from covering page content.
 */
function adjustPageLayout(sidebarOpen: boolean): void {
  const body = document.body;
  const html = document.documentElement;

  if (sidebarOpen) {
    // Shift page content to the left
    body.style.transition = 'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    body.style.marginRight = `${SIDEBAR_WIDTH_DEFAULT}px`;
    html.style.overflowX = 'hidden';
  } else {
    // Restore page content position
    body.style.marginRight = '0';
    html.style.overflowX = '';
  }
}