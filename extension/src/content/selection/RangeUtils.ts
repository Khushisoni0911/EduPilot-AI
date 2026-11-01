/**
 * Range Utilities
 *
 * Helper functions for working with the browser's Range API.
 * Ranges represent a fragment of the document (can be a selection,
 * or any portion of the DOM).
 */

import type { SelectionPosition } from '../../shared/types/messages';

/**
 * Get the bounding rectangle of the current selection.
 * Returns null if no selection exists.
 */
export function getSelectionRect(): DOMRect | null {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    return null;
  }

  try {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Sanity check — invalid rect means invisible selection
    if (rect.width === 0 && rect.height === 0) return null;

    return rect;
  } catch {
    return null;
  }
}

/**
 * Convert a DOMRect to our SelectionPosition format
 * (adding scroll offsets for document-absolute coordinates).
 */
export function rectToPosition(rect: DOMRect): SelectionPosition {
  return {
    viewport: {
      top: rect.top,
      left: rect.left,
      bottom: rect.bottom,
      right: rect.right,
    },
    document: {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
    },
    width: rect.width,
    height: rect.height,
  };
}

/**
 * Programmatically select text on the page.
 * Used when the user asks to highlight AI-identified text.
 */
export function selectTextInElement(
  element: HTMLElement,
  startOffset: number,
  endOffset: number
): boolean {
  try {
    const range = document.createRange();
    const textNode = element.firstChild;

    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return false;

    range.setStart(textNode, startOffset);
    range.setEnd(textNode, endOffset);

    const selection = window.getSelection();
    if (!selection) return false;

    selection.removeAllRanges();
    selection.addRange(range);

    return true;
  } catch {
    return false;
  }
}

/**
 * Wrap selected text in a highlight span.
 * Used for the "highlight" feature.
 */
export function highlightCurrentSelection(color: string = '#fef08a'): boolean {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    return false;
  }

  try {
    const range = selection.getRangeAt(0);

    // Create highlight span
    const highlight = document.createElement('span');
    highlight.dataset.aiHighlight = 'true';
    highlight.dataset.extension = 'edupilot-ai';
    highlight.style.backgroundColor = color;
    highlight.style.borderRadius = '2px';
    highlight.style.padding = '0 1px';

    // Wrap the selection
    range.surroundContents(highlight);
    selection.removeAllRanges();

    return true;
  } catch {
    // surroundContents can fail on complex selections (across multiple elements)
    console.warn('[RangeUtils] Could not highlight selection — complex range');
    return false;
  }
}

/**
 * Remove all AI highlights from the page.
 */
export function clearAllHighlights(): void {
  const highlights = document.querySelectorAll('[data-ai-highlight="true"]');
  highlights.forEach((highlight) => {
    const parent = highlight.parentNode;
    if (!parent) return;

    // Replace highlight span with its text content
    while (highlight.firstChild) {
      parent.insertBefore(highlight.firstChild, highlight);
    }
    parent.removeChild(highlight);
  });

  // Normalize the DOM to merge adjacent text nodes
  document.body.normalize();
}