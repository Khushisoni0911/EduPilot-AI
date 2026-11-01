/**
 * Background Service Worker — Module 3 Update
 * Adds context menu setup.
 */

import { handleMessage } from './message-handler';
import { initializeTabManager } from './tab-manager';
import { setupContextMenu, setupContextMenuClickHandler } from './context-menu';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../shared/types/types';

// ── Lifecycle ──────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async (details) => {
  console.info('[EduPilot AI Background] Extension installed:', details.reason);

  // Setup right-click context menu
  setupContextMenu();

  if (details.reason === 'install') {
    await handleFirstInstall();
  }
});

// Setup context menu click handler (always active)
setupContextMenuClickHandler();

// ── Message Router ─────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    if (process.env.NODE_ENV !== 'production') {
      console.info(
        '[EduPilot AI Background] Message:',
        message.type,
        '| From:',
        sender.tab ? `Tab ${sender.tab.id}` : 'Popup'
      );
    }

    handleMessage(message, sender)
      .then(sendResponse)
      .catch((error: Error) => {
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep channel open
  }
);

// ── Keyboard Commands ──────────────────────────────────────────────────

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command === 'toggle-sidebar' && tab?.id) {
    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SIDEBAR' });
    } catch {
      console.warn('[EduPilot AI Background] Cannot toggle sidebar on this page');
    }
  }
});

// ── Tab Cleanup ────────────────────────────────────────────────────────

chrome.tabs.onRemoved.addListener(async (tabId) => {
  // Clean up session storage for closed tabs
  const sessionData = await chrome.storage.session.get('pendingAction');
  if (sessionData.pendingAction) {
    await chrome.storage.session.remove('pendingAction');
  }
  console.info(`[EduPilot AI Background] Tab ${tabId} removed`);
});

// ── Initialization ─────────────────────────────────────────────────────

initializeTabManager();

async function handleFirstInstall(): Promise<void> {
  try {
    await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: DEFAULT_SETTINGS });
    await chrome.storage.local.set({
      [STORAGE_KEYS.USER]: null,
      [STORAGE_KEYS.AUTH_TOKEN]: null,
      [STORAGE_KEYS.NOTES]: [],
    });
    console.info('[EduPilot AI Background] ✅ First install complete');
  } catch (error) {
    console.error('[EduPilot AI Background] ❌ Install error:', error);
  }
}

console.info('[EduPilot AI Background] ✅ Service Worker ready — Module 3');