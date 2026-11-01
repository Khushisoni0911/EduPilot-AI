/**
 * Chrome Storage Utility
 *
 * A type-safe wrapper around Chrome's storage APIs.
 *
 * WHY THIS EXISTS:
 * The raw chrome.storage API uses callbacks (old style).
 * This wrapper converts them to Promises so we can use
 * modern async/await syntax throughout the app.
 *
 * Chrome has two storage types:
 * - chrome.storage.local  → Stored on device, up to 10MB, faster
 * - chrome.storage.sync   → Synced across user's Chrome instances,
 *                           but limited to 100KB total
 *
 * We primarily use LOCAL for large data (notes, AI responses)
 * and SYNC for small settings (theme, preferences).
 */

import type { AppSettings } from '../types/types';

// ============================================
// LOCAL Storage (device-only, larger limit)
// ============================================

/**
 * Get a value from chrome.storage.local
 * @returns The stored value, or undefined if not found
 */
export async function getLocalStorage<T>(key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(result[key] as T | undefined);
    });
  });
}

/**
 * Set a value in chrome.storage.local
 */
export async function setLocalStorage<T>(key: string, value: T): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

/**
 * Remove a value from chrome.storage.local
 */
export async function removeLocalStorage(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(key, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

/**
 * Clear ALL local storage (use carefully — e.g., on logout)
 */
export async function clearLocalStorage(): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.clear(() => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

// ============================================
// SYNC Storage (cross-device, smaller limit)
// ============================================

/**
 * Get settings from sync storage (available across devices)
 */
export async function getSyncStorage<T>(key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(result[key] as T | undefined);
    });
  });
}

/**
 * Save settings to sync storage
 */
export async function setSyncStorage<T>(key: string, value: T): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

// ============================================
// Typed Convenience Methods
// ============================================

/**
 * Get the user's app settings (typed)
 */
export async function getSettings(): Promise<AppSettings | undefined> {
  return getSyncStorage<AppSettings>('settings');
}

/**
 * Save the user's app settings (typed)
 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  return setSyncStorage('settings', settings);
}

/**
 * Listen for storage changes
 * Useful for syncing state between popup and sidebar
 */
export function onStorageChange(
  callback: (changes: { [key: string]: chrome.storage.StorageChange }) => void
): () => void {
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string
  ) => {
    if (areaName === 'local' || areaName === 'sync') {
      callback(changes);
    }
  };

  chrome.storage.onChanged.addListener(listener);

  // Return cleanup function
  return () => chrome.storage.onChanged.removeListener(listener);
}