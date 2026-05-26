/**
 * Background Service Worker — Entry Point
 *
 * The central nervous system of the extension.
 * Routes messages between popup and content scripts.
 * Manages extension lifecycle events.
 *
 * IMPORTANT MV3 CONSTRAINT:
 * Service Workers are EPHEMERAL. They can stop running
 * at any time when idle. Never store state in module-level
 * variables — always use chrome.storage instead.
 */

import { handleMessage } from './message-handler';
import { initializeTabManager } from './tab-manager';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../shared/types';

// ============================================
// Lifecycle — Installation
// ============================================

chrome.runtime.onInstalled.addListener(async (details) => {
  console.info('[Background] Extension installed:', details.reason);

  if (details.reason === 'install') {
    await handleFirstInstall();
  } else if (details.reason === 'update') {
    console.info('[Background] Updated to version:', chrome.runtime.getManifest().version);
  }
});

/**
 * Set default values in storage on first install.
 */
async function handleFirstInstall(): Promise<void> {
  try {
    await chrome.storage.sync.set({
      [STORAGE_KEYS.SETTINGS]: DEFAULT_SETTINGS,
    });

    await chrome.storage.local.set({
      [STORAGE_KEYS.USER]: null,
      [STORAGE_KEYS.AUTH_TOKEN]: null,
      [STORAGE_KEYS.ONBOARDING]: { completed: false, step: 0 },
      [STORAGE_KEYS.NOTES]: [],
    });

    console.info('[Background] ✅ Default storage initialized');
  } catch (error) {
    console.error('[Background] ❌ Failed to initialize storage:', error);
  }
}

// ============================================
// Lifecycle — Service Worker Activation
// ============================================

/**
 * The 'activate' event fires when the service worker takes control.
 * We use self (not window — service workers don't have window).
 */
self.addEventListener('activate', () => {
  console.info('[Background] Service Worker activated');
});

// ============================================
// Message Router
// ============================================

/**
 * Central message listener.
 * ALL messages from popup and content scripts arrive here.
 * We delegate to message-handler.ts to keep this file clean.
 */
chrome.runtime.onMessage.addListener(
  (
    message: { type: string; payload?: unknown; requestId?: string },
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void
  ) => {
    // Log incoming messages during development
    if (process.env.NODE_ENV !== 'production') {
      console.info(
        '[Background] Message received:',
        message.type,
        '| From:',
        sender.tab ? `Tab ${sender.tab.id}` : 'Extension popup'
      );
    }

    // Handle message asynchronously and send response
    handleMessage(message, sender)
      .then((response) => sendResponse(response))
      .catch((error: Error) => {
        console.error('[Background] Message handling error:', error);
        sendResponse({
          success: false,
          error: error.message || 'Unknown background error',
        });
      });

    // CRITICAL: Return true to keep message channel open for async response.
    // Without this, sendResponse becomes invalid after the listener returns.
    return true;
  }
);

// ============================================
// Keyboard Command Handler
// ============================================

/**
 * Handle keyboard commands defined in manifest.json's "commands" field.
 * Ctrl+Shift+S (Win/Linux) / Cmd+Shift+S (Mac) toggles the sidebar.
 */
chrome.commands.onCommand.addListener(async (command, tab) => {
  console.info('[Background] Command received:', command);

  if (command === 'toggle-sidebar' && tab?.id) {
    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_SIDEBAR',
        payload: undefined,
      });
    } catch {
      // Content script might not be injected on this page (chrome:// pages etc.)
      console.warn('[Background] Could not send toggle to tab:', tab.id);
    }
  }
});

// ============================================
// Tab Manager Initialization
// ============================================

// Track tab events (tab switching, navigation, closure)
initializeTabManager();

console.info('[Background] ✅ Service Worker ready');