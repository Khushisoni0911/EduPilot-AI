/**
 * Background Message Handler — Module 3 Update
 *
 * Extended to handle new message types from Module 3:
 * - TEXT_SELECTED: Store selection state, update badge
 * - TEXT_DESELECTED: Clear selection state
 * - FAB_ACTION_TRIGGERED: Handle user clicking FAB buttons
 * - CONTENT_SCRIPT_READY: Track which tabs have active content scripts
 * - PAGE_CONTEXT_READY: Store context for popup display
 */

import type {
  AnyMessage,
  MessageResponse,
  FABAction,
  SiteType,
} from '../shared/types/messages';
import { getActiveTab } from '../shared/utils/messaging';

// ============================================
// In-Memory State
// (Lost when service worker sleeps — that's OK for transient state)
// ============================================

interface TabState {
  url: string;
  title: string;
  siteType: SiteType;
  hasSelection: boolean;
  selectedText: string;
  lastActivity: number;
}

const tabStateMap = new Map<number, TabState>();

// ============================================
// Main Router
// ============================================

export async function handleMessage(
  message: { type: string; payload?: unknown; requestId?: string },
  sender: chrome.runtime.MessageSender
): Promise<MessageResponse> {
  const { type, payload, requestId } = message;

  try {
    let data: unknown;

    switch (type as AnyMessage['type']) {
      // ── Health ──────────────────────────────────────────────
      case 'PING':
        data = { status: 'alive', timestamp: Date.now() };
        break;

      // ── NEW: Content Script Status ──────────────────────────
      case 'CONTENT_SCRIPT_READY':
        data = await handleContentScriptReady(
          payload as { url: string; title: string; siteType: SiteType },
          sender
        );
        break;

      case 'PAGE_CONTEXT_READY':
        data = await handlePageContextReady(payload, sender);
        break;

      // ── NEW: Selection Events ───────────────────────────────
      case 'TEXT_SELECTED':
        data = await handleTextSelected(payload as {
          text: string;
          wordCount: number;
          charCount: number;
          url: string;
        }, sender);
        break;

      case 'TEXT_DESELECTED':
        data = await handleTextDeselected(sender);
        break;

      // ── NEW: FAB Actions ────────────────────────────────────
      case 'FAB_ACTION_TRIGGERED':
        data = await handleFABAction(payload as {
          action: FABAction;
          selectedText: string;
          url: string;
        }, sender);
        break;

      // ── Sidebar Control ─────────────────────────────────────
      case 'TOGGLE_SIDEBAR':
        data = await forwardToContentScript('TOGGLE_SIDEBAR', undefined, sender);
        break;

      case 'OPEN_SIDEBAR':
        data = await forwardToContentScript('OPEN_SIDEBAR', payload, sender);
        break;

      case 'CLOSE_SIDEBAR':
        data = await forwardToContentScript('CLOSE_SIDEBAR', undefined, sender);
        break;

      // ── Page Data ───────────────────────────────────────────
      case 'GET_ACTIVE_TAB_INFO':
        data = await handleGetActiveTabInfo();
        break;

      case 'GET_PAGE_CONTENT': {
  const response = await forwardToContentScript(
    'GET_PAGE_CONTENT',
    undefined,
    sender
  ) as MessageResponse;

  if (!response.success) {
    return {
      success: false,
      error: response.error ?? 'Failed to extract page content',
      requestId,
    };
  }

  data = response.data;
  break;
}

      case 'GET_SELECTED_TEXT':
        data = await forwardToContentScript('GET_SELECTED_TEXT', undefined, sender);
        break;

      case 'GET_PAGE_CONTEXT':
        data = await forwardToContentScript('GET_PAGE_CONTEXT', undefined, sender);
        break;

      // ── Settings ────────────────────────────────────────────
      case 'GET_SETTINGS':
        data = await handleGetSettings();
        break;

      case 'SAVE_SETTINGS':
        data = await handleSaveSettings(payload);
        break;

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
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[MessageHandler] '${type}' error:`, error);
    return { success: false, error: msg, requestId };
  }
}

// ============================================
// New Handlers
// ============================================

async function handleContentScriptReady(
  payload: { url: string; title: string; siteType: SiteType },
  sender: chrome.runtime.MessageSender
): Promise<{ acknowledged: boolean }> {
  const tabId = sender.tab?.id;
  if (!tabId) return { acknowledged: false };

  tabStateMap.set(tabId, {
    url: payload.url,
    title: payload.title,
    siteType: payload.siteType,
    hasSelection: false,
    selectedText: '',
    lastActivity: Date.now(),
  });

  // Update extension badge to show site type indicator
  const siteTypeEmoji: Record<SiteType, string> = {
    'youtube': '▶',
    'coding-platform': '</>',
    'documentation': '📄',
    'article': 'A',
    'research-paper': '🔬',
    'educational': '🎓',
    'news': 'N',
    'blog': 'B',
    'ecommerce': '$',
    'social-media': '💬',
    'unsupported': '✕',
    'unknown': '?',
  };

  const badge = siteTypeEmoji[payload.siteType] ?? '';
  await chrome.action.setBadgeText({ text: badge, tabId });
  await chrome.action.setBadgeBackgroundColor({ color: '#2563eb', tabId });

  console.info(
    `[Background] Tab ${tabId} ready: ${payload.siteType} — ${payload.url}`
  );

  return { acknowledged: true };
}

async function handlePageContextReady(
  payload: unknown,
  sender: chrome.runtime.MessageSender
): Promise<void> {
  const tabId = sender.tab?.id;
  if (!tabId) return;

  const state = tabStateMap.get(tabId);
  if (state) {
    const context = payload as { siteType?: SiteType };
    if (context?.siteType) state.siteType = context.siteType;
    state.lastActivity = Date.now();
  }
}

async function handleTextSelected(
  payload: { text: string; wordCount: number; charCount: number; url: string },
  sender: chrome.runtime.MessageSender
): Promise<{ received: boolean }> {
  const tabId = sender.tab?.id;
  if (!tabId) return { received: false };

  // Update tab state
  const state = tabStateMap.get(tabId);
  if (state) {
    state.hasSelection = true;
    state.selectedText = payload.text;
    state.lastActivity = Date.now();
  }

  // Show word count badge
  const wordCount = payload.wordCount;
  const badgeText = wordCount > 99 ? '99+' : String(wordCount);
  await chrome.action.setBadgeText({ text: badgeText, tabId });
  await chrome.action.setBadgeBackgroundColor({ color: '#7c3aed', tabId });

  console.info(
    `[Background] Selection in tab ${tabId}: ${wordCount} words`
  );

  return { received: true };
}

async function handleTextDeselected(
  sender: chrome.runtime.MessageSender
): Promise<void> {
  const tabId = sender.tab?.id;
  if (!tabId) return;

  const state = tabStateMap.get(tabId);
  if (state) {
    state.hasSelection = false;
    state.selectedText = '';
  }

  // Reset badge to site type indicator
  const siteType = state?.siteType ?? 'unknown';
  const badges: Partial<Record<SiteType, string>> = {
    'youtube': '▶',
    'coding-platform': '<>',
    'documentation': '?',
    'educational': '🎓',
  };
  const badge = badges[siteType] ?? '';
  await chrome.action.setBadgeText({ text: badge, tabId });
  await chrome.action.setBadgeBackgroundColor({ color: '#2563eb', tabId });
}

async function handleFABAction(
  payload: { action: FABAction; selectedText: string; url: string },
  sender: chrome.runtime.MessageSender
): Promise<{ processed: boolean }> {
  console.info(
    `[Background] FAB action: ${payload.action} | Text: ${payload.selectedText.slice(0, 50)}`
  );

  const tabId = sender.tab?.id ?? (await getActiveTab())?.id;
  if (!tabId) return { processed: false };

  // Store the pending action in chrome.storage for the popup/sidebar to read
  await chrome.storage.session.set({
    pendingAction: {
      action: payload.action,
      selectedText: payload.selectedText,
      url: payload.url,
      timestamp: Date.now(),
    },
  });

  // Open the sidebar (action will be processed there in Module 5)
  try {
    await chrome.tabs.sendMessage(tabId, {
      type: 'OPEN_SIDEBAR',
      payload: { panel: payload.action },
    });
  } catch {
    console.warn('[Background] Could not open sidebar for FAB action');
  }

  return { processed: true };
}

// ============================================
// Helper: Forward to Content Script
// ============================================

async function forwardToContentScript(
  type: string,
  payload: unknown,
  sender: chrome.runtime.MessageSender
): Promise<unknown> {
  const tabId = sender.tab?.id ?? (await getActiveTab())?.id;
  if (!tabId) throw new Error('No active tab found');

  return chrome.tabs.sendMessage(tabId, { type, payload });
}

// ============================================
// Existing Handlers (from Module 2)
// ============================================

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

function isUrlSupported(url?: string): boolean {
  if (!url) return false;
  const unsupported = ['chrome://', 'chrome-extension://', 'about:', 'data:', 'file://'];
  return !unsupported.some((prefix) => url.startsWith(prefix));
}
