/**
 * Chrome Messaging Utility
 *
 * A clean, type-safe wrapper around Chrome's messaging APIs.
 *
 * MESSAGING IN CHROME EXTENSIONS:
 * There are two types of messages:
 *
 * 1. runtime.sendMessage() — Popup/Content → Background
 *    Used when you DON'T need to target a specific tab.
 *    Background worker receives via runtime.onMessage
 *
 * 2. tabs.sendMessage(tabId) — Background → Content Script
 *    Used when you NEED to send to a specific tab's content script.
 *    Content script receives via runtime.onMessage
 *
 * This utility wraps both patterns with proper TypeScript typing
 * and error handling.
 */

import type { ExtensionMessage, ExtensionResponse, MessageType } from '../types';

// ============================================
// Send Messages TO Background Worker
// ============================================

/**
 * Send a message from popup/content script to background service worker.
 *
 * @param type - The message action type
 * @param payload - Optional data to send with the message
 * @returns Promise that resolves with the background's response
 *
 * @example
 * const result = await sendToBackground('GET_PAGE_CONTENT', { url: '...' });
 */
export async function sendToBackground<TPayload = unknown, TResponse = unknown>(
  type: MessageType,
  payload?: TPayload
): Promise<ExtensionResponse<TResponse>> {
  return new Promise((resolve, reject) => {
    const message: ExtensionMessage<TPayload> = {
      type,
      payload,
      requestId: generateRequestId(),
    };

    chrome.runtime.sendMessage(message, (response: ExtensionResponse<TResponse>) => {
      // Check for Chrome API errors (extension not found, etc.)
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(response);
    });
  });
}

// ============================================
// Send Messages TO Content Scripts
// ============================================

/**
 * Send a message from background to a specific tab's content script.
 * Must be called from the BACKGROUND SERVICE WORKER only.
 *
 * @param tabId - The Chrome tab ID to send the message to
 * @param type - The message action type
 * @param payload - Optional data to send
 */
export async function sendToContentScript<TPayload = unknown, TResponse = unknown>(
  tabId: number,
  type: MessageType,
  payload?: TPayload
): Promise<ExtensionResponse<TResponse>> {
  return new Promise((resolve, reject) => {
    const message: ExtensionMessage<TPayload> = {
      type,
      payload,
      requestId: generateRequestId(),
    };

    chrome.tabs.sendMessage(tabId, message, (response: ExtensionResponse<TResponse>) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(response);
    });
  });
}

// ============================================
// Get Current Active Tab
// ============================================

/**
 * Get the currently active tab in the focused window.
 * Useful in popup to know what page the user is on.
 */
export async function getActiveTab(): Promise<chrome.tabs.Tab | null> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError || !tabs.length) {
        resolve(null);
        return;
      }
      resolve(tabs[0]);
    });
  });
}

/**
 * Get the active tab's ID (convenience method)
 */
export async function getActiveTabId(): Promise<number | null> {
  const tab = await getActiveTab();
  return tab?.id ?? null;
}

// ============================================
// Utility
// ============================================

/**
 * Generate a unique request ID for tracking async messages.
 * Useful for debugging and correlating request/response pairs.
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Check if the current context is a service worker (background).
 * Helps write code that works in multiple contexts.
 */
export function isServiceWorker(): boolean {
  return typeof window === 'undefined' && typeof self !== 'undefined';
}

/**
 * Check if we're in the extension context (popup/options) vs web page.
 */
export function isExtensionContext(): boolean {
  return typeof chrome !== 'undefined' && !!chrome.runtime?.id;
}