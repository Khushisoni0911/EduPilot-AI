/**
 * Selection Detector
 *
 * The core engine that listens for text selection events on the page
 * and emits structured selection data.
 *
 * WHY THIS IS COMPLEX:
 * Text selection in browsers fires many events in rapid succession.
 * The 'selectionchange' event fires on EVERY cursor move during drag.
 * We need to:
 * 1. Debounce to wait for the selection to "settle"
 * 2. Validate the selection is meaningful (not empty, not whitespace)
 * 3. Check the selection isn't inside our own extension UI
 * 4. Compute the selection's bounding rectangle for FAB positioning
 * 5. Extract rich context about the selected text
 *
 * EVENTS USED:
 * - document 'selectionchange' — fires during text selection
 * - document 'mouseup' — fires when user finishes selection
 * - document 'touchend' — mobile selection support
 */

import { debounce } from '../../shared/utils/debounce';
import { EventManager } from '../dom/EventManager';
import { isMeaningfulText, getWordCount, isExtensionElement } from '../dom/DOMUtils';
import { getScrollPosition } from '../dom/DOMUtils';
import type { SelectionPosition } from '../../shared/types/messages';

// ============================================
// Types
// ============================================

export interface SelectionData {
  text: string;
  trimmedText: string;
  wordCount: number;
  charCount: number;
  position: SelectionPosition;
  surroundingContext: string;  // Text around the selection for AI context
  elementTag: string;          // What HTML element was selected in
  isCode: boolean;             // Was it inside a <code> block?
}

export type SelectionHandler = (data: SelectionData) => void;
export type DeselectionHandler = () => void;

// ============================================
// SelectionDetector Class
// ============================================

export class SelectionDetector {
  private eventManager: EventManager;
  private onSelectHandlers: SelectionHandler[] = [];
  private onDeselectHandlers: DeselectionHandler[] = [];
  private lastSelectedText = '';
  private isActive = false;

  // Debounced handler — waits 200ms after last selectionchange
  private debouncedHandleSelectionChange: ReturnType<typeof debounce>;

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager;

    // Create debounced version of selection handler
    this.debouncedHandleSelectionChange = debounce(
      this.handleSelectionChange.bind(this),
      200 // 200ms debounce — responsive but not excessive
    );
  }

  // ============================================
  // Lifecycle
  // ============================================

  /**
   * Start listening for text selections.
   */
  start(): void {
    if (this.isActive) return;

    // Primary: selectionchange fires during selection drag
    this.eventManager.add(
      document,
      'selectionchange',
      this.debouncedHandleSelectionChange
    );

    // Secondary: mouseup catches click-to-deselect and drag end
    this.eventManager.add(
      document,
      'mouseup',
      this.handleMouseUp.bind(this)
    );

    // Mobile support
    this.eventManager.add(
      document,
      'touchend',
      this.handleTouchEnd.bind(this)
    );

    // Handle clicks outside selection (deselect)
    this.eventManager.add(
      document,
      'mousedown',
      this.handleMouseDown.bind(this)
    );

    this.isActive = true;
    console.info('[SelectionDetector] Started listening for text selections');
  }

  /**
   * Stop listening and clean up.
   */
  stop(): void {
    this.debouncedHandleSelectionChange.cancel();
    this.isActive = false;
    console.info('[SelectionDetector] Stopped');
  }

  // ============================================
  // Event Handlers
  // ============================================

  /**
   * Add a handler that fires when text is selected.
   */
  onSelect(handler: SelectionHandler): () => void {
    this.onSelectHandlers.push(handler);
    // Return unsubscribe function
    return () => {
      this.onSelectHandlers = this.onSelectHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Add a handler that fires when selection is cleared.
   */
  onDeselect(handler: DeselectionHandler): () => void {
    this.onDeselectHandlers.push(handler);
    return () => {
      this.onDeselectHandlers = this.onDeselectHandlers.filter((h) => h !== handler);
    };
  }

  // ============================================
  // Core Logic
  // ============================================

  private handleSelectionChange(): void {
    const selection = window.getSelection();

    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      // Selection was cleared
      this.handleDeselection();
      return;
    }

    const selectedText = selection.toString();

    // Skip if same text as before (no change)
    if (selectedText === this.lastSelectedText) return;

    // Skip if not meaningful text
    if (!isMeaningfulText(selectedText)) {
      this.handleDeselection();
      return;
    }

    // Skip if selection is inside our extension UI
    const anchorNode = selection.anchorNode;
    if (anchorNode && isExtensionElement(anchorNode.parentElement)) {
      return;
    }

    // Build rich selection data
    const selectionData = this.buildSelectionData(selection, selectedText);
    if (!selectionData) return;

    this.lastSelectedText = selectedText;

    // Notify all handlers
    this.onSelectHandlers.forEach((handler) => {
      try {
        handler(selectionData);
      } catch (error) {
        console.error('[SelectionDetector] Handler error:', error);
      }
    });
  }

  private handleMouseUp(): void {
    // Small delay to let selectionchange fire first
    setTimeout(() => this.handleSelectionChange(), 10);
  }

  private handleTouchEnd(): void {
    // Longer delay for mobile — touch selection is slower
    setTimeout(() => this.handleSelectionChange(), 50);
  }

  private handleMouseDown(event: MouseEvent): void {
    // If user clicks outside any selection, clear our tracking
    const target = event.target as Element;
    if (!isExtensionElement(target)) {
      // Selection will be cleared by the browser; our debounced
      // selectionchange handler will fire and call handleDeselection
    }
  }

  private handleDeselection(): void {
    if (!this.lastSelectedText) return;

    this.lastSelectedText = '';
    this.onDeselectHandlers.forEach((handler) => {
      try {
        handler();
      } catch (error) {
        console.error('[SelectionDetector] Deselect handler error:', error);
      }
    });
  }

  // ============================================
  // Data Builders
  // ============================================

  /**
   * Build rich SelectionData from the current Selection object.
   */
  private buildSelectionData(
    selection: Selection,
    selectedText: string
  ): SelectionData | null {
    try {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Skip invisible selections (can happen during programmatic selections)
      if (rect.width === 0 && rect.height === 0) return null;

      const scroll = getScrollPosition();

      const position: SelectionPosition = {
        viewport: {
          top: rect.top,
          left: rect.left,
          bottom: rect.bottom,
          right: rect.right,
        },
        document: {
          top: rect.top + scroll.y,
          left: rect.left + scroll.x,
        },
        width: rect.width,
        height: rect.height,
      };

      // Get the element containing the selection
      const container = range.commonAncestorContainer;
      const containerElement =
        container.nodeType === Node.TEXT_NODE
          ? container.parentElement
          : (container as Element);

      // Check if selected text is inside a code block
      const isCode = !!containerElement?.closest('code, pre, [class*="code"], [class*="syntax"]');

      // Get surrounding context (text around the selection for AI)
      const surroundingContext = this.getSurroundingContext(range, containerElement);

      return {
        text: selectedText,
        trimmedText: selectedText.trim(),
        wordCount: getWordCount(selectedText),
        charCount: selectedText.trim().length,
        position,
        surroundingContext,
        elementTag: containerElement?.tagName.toLowerCase() ?? 'unknown',
        isCode,
      };
    } catch (error) {
      console.error('[SelectionDetector] Error building selection data:', error);
      return null;
    }
  }

  /**
   * Get text surrounding the selection for better AI context.
   * Extracts up to 200 characters before and after the selection.
   */
  private getSurroundingContext(
    range: Range,
    containerElement: Element | null
  ): string {
    if (!containerElement) return '';

    try {
      const fullText = containerElement.textContent ?? '';
      const selectedText = range.toString();
      const selectionIndex = fullText.indexOf(selectedText);

      if (selectionIndex === -1) return '';

      const contextStart = Math.max(0, selectionIndex - 200);
      const contextEnd = Math.min(fullText.length, selectionIndex + selectedText.length + 200);

      return fullText.slice(contextStart, contextEnd);
    } catch {
      return '';
    }
  }
}