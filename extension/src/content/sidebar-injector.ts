/**
 * Sidebar Injector
 *
 * Injects the EduPilot AI sidebar into the current webpage.
 * Uses Shadow DOM to isolate sidebar styles from the host page.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';

import SidebarApp from '../sidebar/App';

// ============================================
// Constants
// ============================================

const SIDEBAR_HOST_ID = 'edupilot-ai-host';
const SIDEBAR_ROOT_ID = 'edupilot-ai-root';
const SIDEBAR_WIDTH_DEFAULT = 380;

// ============================================
// State
// ============================================

let sidebarRoot: ReactDOM.Root | null = null;
let hostElement: HTMLElement | null = null;
let isSidebarOpen = false;

// ============================================
// Main Injection Function
// ============================================
export function injectSidebar(): void {
  // Avoid injecting the sidebar more than once.
  if (document.getElementById(SIDEBAR_HOST_ID)) {
    console.info('[SidebarInjector] Sidebar already injected');
    return;
  }

  try {
    // Create the sidebar host.
    hostElement = document.createElement('div');
    hostElement.id = SIDEBAR_HOST_ID;
    hostElement.setAttribute('data-extension', 'edupilot-ai');

    applyHostStyles(hostElement);

    // Create an isolated Shadow DOM.
    const shadowRoot = hostElement.attachShadow({ mode: 'open' });

    // Load styles into the Shadow DOM.
    injectStyles(shadowRoot);

    // Create the React mount point.
    const reactRoot = document.createElement('div');
    reactRoot.id = SIDEBAR_ROOT_ID;

    reactRoot.style.cssText = `
      height: 100%;
      width: 100%;
      overflow: hidden;
    `;

    shadowRoot.appendChild(reactRoot);

    // Mount the React application.
    sidebarRoot = ReactDOM.createRoot(reactRoot);

    sidebarRoot.render(
      React.createElement(
        React.StrictMode,
        null,
        React.createElement(SidebarApp, {
          onClose: closeSidebar,
          isOpen: false,
        })
      )
    );

    // Add the host to the webpage.
    (document.body || document.documentElement).appendChild(hostElement);

    console.info('[SidebarInjector] Sidebar injected successfully');
  } catch (error) {
    console.error('[SidebarInjector] Failed to inject sidebar:', error);
  }
}

// ============================================
// Sidebar Controls
// ============================================

export function toggleSidebar(): void {
  if (isSidebarOpen) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

export function openSidebar(panel?: string): void {
  // Recover the existing host if necessary.
  if (!hostElement) {
    const existingHost = document.getElementById(SIDEBAR_HOST_ID);

    if (existingHost) {
      hostElement = existingHost;
    } else {
      injectSidebar();
    }
  }

  if (!hostElement) {
    console.error('[SidebarInjector] Cannot open sidebar: host unavailable');
    return;
  }

  isSidebarOpen = true;

  // No !important declarations: these values can now be updated.
  hostElement.style.transform = 'translateX(0)';
  hostElement.style.opacity = '1';
  hostElement.style.visibility = 'visible';
  hostElement.style.pointerEvents = 'auto';

  rerenderSidebar(true, panel);
  adjustPageLayout(true);

  console.info('[SidebarInjector] Sidebar opened');
}

export function closeSidebar(): void {
  if (!hostElement) return;

  isSidebarOpen = false;

  hostElement.style.transform =
    `translateX(${SIDEBAR_WIDTH_DEFAULT}px)`;

  hostElement.style.opacity = '0';
  hostElement.style.visibility = 'hidden';
  hostElement.style.pointerEvents = 'none';

  rerenderSidebar(false);
  adjustPageLayout(false);

  console.info('[SidebarInjector] Sidebar closed');
}

export function isSidebarVisible(): boolean {
  return isSidebarOpen;
}

// ============================================
// Host Styles
// ============================================

function applyHostStyles(element: HTMLElement): void {
  element.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: ${SIDEBAR_WIDTH_DEFAULT}px;
    height: 100vh;
    z-index: 2147483647;
    transform: translateX(${SIDEBAR_WIDTH_DEFAULT}px);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition:
      transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.3s ease,
      visibility 0.3s ease;
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
    font-family:
      -apple-system, BlinkMacSystemFont, 'Segoe UI',
      Roboto, Oxygen, Ubuntu, sans-serif;
  `;
}

// ============================================
// Shadow DOM Styles
// ============================================

function injectStyles(shadow: ShadowRoot): void {
  // Load the compiled CSS bundled by Vite.
  const link = document.createElement('link');

  link.rel = 'stylesheet';
  link.href = chrome.runtime.getURL('styles/sidebar.css');

  shadow.appendChild(link);

  // Apply basic reset and host-independent defaults.
  const style = document.createElement('style');

  style.textContent = `
    *, *::before, *::after {
      box-sizing: border-box;
    }

    :host {
      all: initial;
      display: block;
      width: 100%;
      height: 100%;
      font-family:
        -apple-system, BlinkMacSystemFont, 'Segoe UI',
        Roboto, Oxygen, Ubuntu, sans-serif;
      color: #111827;
    }

    #${SIDEBAR_ROOT_ID} {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    button, input, textarea, select {
      font: inherit;
    }

    button {
      cursor: pointer;
    }
  `;

  shadow.appendChild(style);
}

// ============================================
// React Rendering
// ============================================

function rerenderSidebar(
  isOpen: boolean,
  panel?: string
): void {
  if (!sidebarRoot) return;
console.log('[EduPilot Debug] Panel received:', panel);
  sidebarRoot.render(
    React.createElement(
      React.StrictMode,
      null,
     React.createElement(SidebarApp, {
  key: panel ?? 'default',
  onClose: closeSidebar,
  isOpen,
  ...(panel ? { initialPanel: panel as import('../shared/types/types').SidebarPanel } : {}),
})
    )
  );
}

// ============================================
// Page Layout
// ============================================

function adjustPageLayout(sidebarOpen: boolean): void {
  const body = document.body;
  const html = document.documentElement;

  if (sidebarOpen) {
    body.style.transition =
      'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

    body.style.marginRight = `${SIDEBAR_WIDTH_DEFAULT}px`;
    html.style.overflowX = 'hidden';
  } else {
    body.style.marginRight = '0';
    body.style.transition = '';
    html.style.overflowX = '';
  }
}