/**
 * Background Message Handler
 *
 * Routes messages to appropriate handlers based on type.
 *
 * Pattern: Command Pattern + Switch Dispatch
 * Each message type has a dedicated handler function.
 * This keeps the code organized and easy to extend.
 */

import type { ExtensionResponse, MessageType } from '../shared/types';
import { getActiveTab } from '../shared/utils/messaging';

// ============================================
// Main Router
// ============================================

export async function handleMessage(
  message: { type: string; payload?: unknown; requestId?: string },
  sender: chrome.runtime.MessageSender
): Promise<ExtensionResponse> {
  const { type, payload, requestId } = message;

  try {
    let data: unknown;

    switch (type as MessageType) {
      // ── Health Check ───────────────────────────────
      case 'PING':
        data = await handlePing();
        break;

      // ── Sidebar Control ────────────────────────────
      case 'TOGGLE_SIDEBAR':
        data = await handleToggleSidebar(sender);
        break;

      case 'OPEN_SIDEBAR':
        data = await handleOpenSidebar(sender);
        break;

      case 'CLOSE_SIDEBAR':
        data = await handleCloseSidebar(sender);
        break;

      // ── Tab / Page Info ────────────────────────────
      case 'GET_ACTIVE_TAB_INFO':
        data = await handleGetActiveTabInfo();
        break;

      case 'GET_PAGE_CONTENT':
        data = await handleGetPageContent(sender);
        break;

      case 'GET_SELECTED_TEXT':
        data = await handleGetSelectedText(sender);
        break;

      // ── Settings ───────────────────────────────────
      case 'GET_SETTINGS':
        data = await handleGetSettings();
        break;

      case 'SAVE_SETTINGS':
        data = await handleSaveSettings(payload);
        break;

      // ── Auth Status ────────────────────────────────
      case 'GET_AUTH_STATUS':
        data = await handleGetAuthStatus();
        break;

      default:
        return {
          success: false,
          error: `Unknown message type: ${type}`,
          requestId,
        };
    }

    return { success: true, data, requestId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[MessageHandler] Error handling '${type}':`, error);
    return { success: false, error: errorMessage, requestId };
  }
}

// ============================================
// Individual Handlers
// ============================================

async function handlePing() {
  return {
    status: 'alive',
    timestamp: Date.now(),
    version: chrome.runtime.getManifest().version,
  };
}

async function handleToggleSidebar(sender: chrome.runtime.MessageSender) {
  // Get the tab to send the toggle to
  let tabId: number | undefined;

  if (sender.tab?.id) {
    // Message came from content script — use same tab
    tabId = sender.tab.id;
  } else {
    // Message came from popup — use active tab
    const activeTab = await getActiveTab();
    tabId = activeTab?.id;
  }

  if (!tabId) {
    throw new Error('No active tab found to toggle sidebar');
  }

  // Forward toggle command to the content script in that tab
  try {
    const response = await chrome.tabs.sendMessage(tabId, {
      type: 'TOGGLE_SIDEBAR',
      payload: undefined,
    });
    return response;
  } catch {
    throw new Error('Could not reach content script. Is the extension loaded on this page?');
  }
}

async function handleOpenSidebar(sender: chrome.runtime.MessageSender) {
  const tabId = sender.tab?.id ?? (await getActiveTab())?.id;
  if (!tabId) throw new Error('No active tab');

  return chrome.tabs.sendMessage(tabId, { type: 'OPEN_SIDEBAR', payload: undefined });
}

async function handleCloseSidebar(sender: chrome.runtime.MessageSender) {
  const tabId = sender.tab?.id ?? (await getActiveTab())?.id;
  if (!tabId) throw new Error('No active tab');

  return chrome.tabs.sendMessage(tabId, { type: 'CLOSE_SIDEBAR', payload: undefined });
}

async function handleGetActiveTabInfo() {
  const tab = await getActiveTab();
  if (!tab) return null;

  return {
    id: tab.id,
    url: tab.url,
    title: tab.title,
    favicon: tab.favIconUrl,
    isSupported: isUrlSupported(tab.url),
  };
}

async function handleGetPageContent(sender: chrome.runtime.MessageSender) {
  const tabId = sender.tab?.id ?? (await getActiveTab())?.id;
  if (!tabId) throw new Error('No active tab');

  // Ask the content script to extract the page content
  return chrome.tabs.sendMessage(tabId, {
    type: 'GET_PAGE_CONTENT',
    payload: undefined,
  });
}

async function handleGetSelectedText(sender: chrome.runtime.MessageSender) {
  const tabId = sender.tab?.id ?? (await getActiveTab())?.id;
  if (!tabId) throw new Error('No active tab');

  return chrome.tabs.sendMessage(tabId, {
    type: 'GET_SELECTED_TEXT',
    payload: undefined,
  });
}

async function handleGetSettings() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('settings', (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(result['settings'] ?? null);
    });
  });
}

async function handleSaveSettings(payload: unknown) {
  return new Promise<void>((resolve, reject) => {
    chrome.storage.sync.set({ settings: payload }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

async function handleGetAuthStatus() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['user', 'authToken'], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve({
        isAuthenticated: !!result['authToken'],
        user: result['user'] ?? null,
      });
    });
  });
}

// ============================================
// Helpers
// ============================================

/**
 * Check if our extension can operate on a given URL.
 * We can't inject into chrome:// pages, the web store, etc.
 */
function isUrlSupported(url?: string): boolean {
  if (!url) return false;
  const unsupportedPrefixes = [
    'chrome://',
    'chrome-extension://',
    'https://chrome.google.com/webstore',
    'about:',
    'data:',
    'file://',
  ];
  return !unsupportedPrefixes.some((prefix) => url.startsWith(prefix));
}