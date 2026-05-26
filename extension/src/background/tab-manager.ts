/**
 * Tab Manager
 *
 * Tracks tab lifecycle events to maintain a consistent
 * understanding of what's happening in the browser.
 *
 * In MV3, the service worker is ephemeral, so we use
 * chrome.storage to persist state across worker restarts.
 */

// ============================================
// Initialize Listeners
// ============================================

export function initializeTabManager(): void {
  // When user navigates to a new URL in a tab
  chrome.tabs.onUpdated.addListener(handleTabUpdated);

  // When user switches to a different tab
  chrome.tabs.onActivated.addListener(handleTabActivated);

  // When a tab is closed
  chrome.tabs.onRemoved.addListener(handleTabRemoved);

  console.info('[TabManager] ✅ Tab listeners registered');
}

// ============================================
// Event Handlers
// ============================================

function handleTabUpdated(
  tabId: number,
  changeInfo: chrome.tabs.TabChangeInfo,
  tab: chrome.tabs.Tab
): void {
  // Only care about when the page fully loads
  if (changeInfo.status !== 'complete') return;

  // Skip unsupported pages
  if (!tab.url || !isUrlSupported(tab.url)) return;

  console.info('[TabManager] Tab updated:', tabId, tab.url);
}

function handleTabActivated(activeInfo: chrome.tabs.TabActiveInfo): void {
  console.info('[TabManager] Tab activated:', activeInfo.tabId);
}

function handleTabRemoved(tabId: number): void {
  console.info('[TabManager] Tab removed:', tabId);
}

// ============================================
// Helpers
// ============================================

function isUrlSupported(url: string): boolean {
  const unsupportedPrefixes = ['chrome://', 'chrome-extension://', 'about:', 'data:'];
  return !unsupportedPrefixes.some((prefix) => url.startsWith(prefix));
}