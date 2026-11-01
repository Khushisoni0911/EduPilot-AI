/**
 * Selection Tracker
 *
 * Maintains the state of the current selection and provides
 * a simple interface to read it from anywhere in the content script.
 *
 * Think of this as the "selection store" — a single source of truth
 * for what the user currently has selected.
 *
 * It also handles communicating selection events to the background
 * service worker so the popup can react to page selections.
 */

import type { SelectionData } from './SelectionDetector';
import type { SelectionPosition } from '../../shared/types/messages';
import { ContentMessenger } from '../messaging/ContentMessenger';

export class SelectionTracker {
  private currentSelection: SelectionData | null = null;
  private messenger: ContentMessenger;

  constructor(messenger: ContentMessenger) {
    this.messenger = messenger;
  }

  // ============================================
  // State Management
  // ============================================

  /**
   * Update the current selection state and notify background.
   */
  updateSelection(data: SelectionData): void {
    this.currentSelection = data;

    // Notify background worker about the selection
    // Background can then update the popup badge or state
    this.messenger.sendToBackground({
      type: 'TEXT_SELECTED',
      payload: {
        text: data.trimmedText,
        wordCount: data.wordCount,
        charCount: data.charCount,
        position: data.position,
        pageContext: this.buildPageContextSummary(),
        url: window.location.href,
        timestamp: Date.now(),
      },
    }).catch((error: Error) => {
      // Don't crash if background is not ready
      console.warn('[SelectionTracker] Could not notify background:', error.message);
    });
  }

  /**
   * Clear the current selection state.
   */
  clearSelection(): void {
    if (!this.currentSelection) return;

    this.currentSelection = null;

    this.messenger.sendToBackground({
      type: 'TEXT_DESELECTED',
      payload: { url: window.location.href },
    }).catch(() => {
      // Ignore — background might be sleeping
    });
  }

  /**
   * Get the current selection (or null if nothing selected).
   */
  getCurrentSelection(): SelectionData | null {
    return this.currentSelection;
  }

  /**
   * Get the current selected text string (or empty string).
   */
  getSelectedText(): string {
    return this.currentSelection?.trimmedText ?? '';
  }

  /**
   * Get the current selection position (or null).
   */
  getSelectionPosition(): SelectionPosition | null {
    return this.currentSelection?.position ?? null;
  }

  /**
   * Check if there is an active, meaningful selection.
   */
  hasSelection(): boolean {
    return this.currentSelection !== null;
  }

  // ============================================
  // Helpers
  // ============================================

  private buildPageContextSummary() {
    return {
      siteType: 'unknown' as const,
      url: window.location.href,
      title: document.title,
      domain: window.location.hostname,
      isReadingMode: false,
      hasCode: false,
      hasVideo: false,
      estimatedReadTime: 0,
      wordCount: 0,
      language: document.documentElement.lang || 'en',
      detectedTopics: [],
    };
  }
}