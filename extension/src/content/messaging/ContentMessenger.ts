/**
 * Content Script Messenger
 *
 * Handles all outgoing communication from the content script.
 * Wraps chrome.runtime.sendMessage with Promise support and
 * error handling.
 *
 * WHY A DEDICATED CLASS?
 * Raw chrome.runtime.sendMessage is callback-based and has no
 * TypeScript type safety for the message shapes. This class
 * provides a clean, typed, Promise-based API.
 */

import type { OutgoingContentMessage, MessageResponse } from '../../shared/types/messages';

export class ContentMessenger {
  /**
   * Send a typed message to the background service worker.
   * Returns a Promise with the response.
   */
  async sendToBackground<TResponse = unknown>(
    message: OutgoingContentMessage
  ): Promise<MessageResponse<TResponse>> {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage(message, (response: MessageResponse<TResponse>) => {
          if (chrome.runtime.lastError) {
            // Background worker is sleeping — this is normal in MV3
            if (chrome.runtime.lastError.message?.includes('Receiving end does not exist')) {
              resolve({ success: false, error: 'background_sleeping' });
            } else {
              reject(new Error(chrome.runtime.lastError.message));
            }
            return;
          }
          resolve(response ?? { success: true });
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Send a message and ignore the response.
   * Use for fire-and-forget notifications.
   */
  sendAndForget(message: OutgoingContentMessage): void {
    try {
      chrome.runtime.sendMessage(message).catch(() => {
        // Silently ignore — background might be sleeping
      });
    } catch {
      // Extension context might be invalidated
    }
  }
}