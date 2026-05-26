/**
 * Content Script — Main Entry Point
 *
 * This script is injected into EVERY web page the user visits
 * (as configured in manifest.json content_scripts).
 *
 * RESPONSIBILITIES:
 * 1. Inject the sidebar React app into the page DOM
 * 2. Listen for messages from popup/background
 * 3. Extract page content when requested
 * 4. Relay selected text to the extension
 *
 * IMPORTANT SECURITY NOTE:
 * Content scripts run in an "isolated world":
 * - Can access the page's DOM (document, window.location, etc.)
 * - CANNOT access the page's JavaScript variables
 * - CANNOT access JavaScript defined by the website
 * This is a Chrome security feature — it prevents malicious pages
 * from tampering with extension code.
 */

import { injectSidebar, toggleSidebar, openSidebar, closeSidebar } from './sidebar-injector';
import { extractPageContent, getSelectedText } from './page-extractor';
import type { ExtensionMessage, ExtensionResponse } from '../shared/types';

// ============================================
// Initialize Content Script
// ============================================

/**
 * Main initialization function.
 * Called once when the content script loads.
 */
function initialize(): void {
  console.info('[Content] Script initialized on:', window.location.hostname);

  // Inject the sidebar React app into the page
  injectSidebar();

  // Setup message listener for communication with popup/background
  setupMessageListener();

  // Notify background that content script is ready
  notifyReady();
}

// ============================================
// Message Listener
// ============================================

/**
 * Listen for messages from the background service worker.
 * The background worker acts as the message broker —
 * messages from the popup come through background first.
 */
function setupMessageListener(): void {
  chrome.runtime.onMessage.addListener(
    (
      message: ExtensionMessage,
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response: ExtensionResponse) => void
    ) => {
      console.info('[Content] Message received:', message.type);

      // Process message and send response
      handleContentMessage(message)
        .then((data) => sendResponse({ success: true, data, requestId: message.requestId }))
        .catch((error: Error) =>
          sendResponse({
            success: false,
            error: error.message,
            requestId: message.requestId,
          })
        );

      // Return true for async response
      return true;
    }
  );
}

// ============================================
// Message Dispatcher
// ============================================

async function handleContentMessage(message: ExtensionMessage): Promise<unknown> {
  switch (message.type) {
    case 'PING':
      return { alive: true, url: window.location.href };

    case 'TOGGLE_SIDEBAR':
      toggleSidebar();
      return { toggled: true };

    case 'OPEN_SIDEBAR':
      openSidebar();
      return { opened: true };

    case 'CLOSE_SIDEBAR':
      closeSidebar();
      return { closed: true };

    case 'GET_PAGE_CONTENT':
      return extractPageContent();

    case 'GET_SELECTED_TEXT':
      return { selectedText: getSelectedText() };

    default:
      throw new Error(`Content script: unknown message type '${message.type}'`);
  }
}

// ============================================
// Notify Background
// ============================================

/**
 * Tell the background worker that this tab's content script is alive.
 * Useful for the popup to know if it can communicate with the page.
 */
function notifyReady(): void {
  chrome.runtime.sendMessage({
    type: 'SIDEBAR_READY',
    payload: {
      url: window.location.href,
      title: document.title,
    },
  }).catch(() => {
    // Background might not be ready yet — that's okay
    // It will reconnect automatically
  });
}

// ============================================
// Bootstrap
// ============================================

// Guard against running in frames (iframes inside pages)
if (window.self === window.top) {
  initialize();
}