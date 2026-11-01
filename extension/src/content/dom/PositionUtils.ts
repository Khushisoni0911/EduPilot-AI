/**
 * Element Positioning Utilities
 *
 * Handles the complex math of positioning the FAB near selected text
 * while keeping it fully visible within the viewport.
 *
 * The key challenge: if the user selects text near the bottom or
 * right edge of the viewport, we need to flip the FAB position
 * so it doesn't go off-screen.
 */

export interface Position {
  top: number;
  left: number;
}

export interface ViewportBounds {
  width: number;
  height: number;
}

export interface ElementDimensions {
  width: number;
  height: number;
}

// ============================================
// FAB Smart Positioning
// ============================================

/**
 * Calculate the optimal position for the FAB near selected text.
 *
 * STRATEGY:
 * 1. Try to place FAB above the selection (preferred)
 * 2. If too close to top, place below the selection
 * 3. Try to center horizontally on the selection
 * 4. If too close to right edge, shift left
 * 5. Always add scroll offset for fixed positioning
 *
 * @param selectionRect - Bounding rect of the text selection
 * @param fabDimensions - Width/height of the FAB element
 * @param offset - Pixel gap between selection and FAB (default: 8)
 * @returns Optimal {top, left} position for the FAB
 */
export function calculateFABPosition(
  selectionRect: DOMRect,
  fabDimensions: ElementDimensions,
  offset = 8
): Position {
  const viewport = getViewportBounds();
  const scroll = { x: window.scrollX, y: window.scrollY };

  // ── Vertical positioning ─────────────────────────────────
  let top: number;
  const spaceAbove = selectionRect.top;
  const spaceBelow = viewport.height - selectionRect.bottom;

  if (spaceAbove >= fabDimensions.height + offset) {
    // Preferred: place above the selection
    top = selectionRect.top + scroll.y - fabDimensions.height - offset;
  } else if (spaceBelow >= fabDimensions.height + offset) {
    // Fallback: place below the selection
    top = selectionRect.bottom + scroll.y + offset;
  } else {
    // Last resort: align with the top of viewport + scroll
    top = scroll.y + offset;
  }

  // ── Horizontal positioning ───────────────────────────────
  // Center the FAB on the selection midpoint
  const selectionMidX = selectionRect.left + selectionRect.width / 2;
  let left = selectionMidX + scroll.x - fabDimensions.width / 2;

  // Clamp to viewport bounds (with margin)
  const margin = 8;
  left = Math.max(scroll.x + margin, left);
  left = Math.min(scroll.x + viewport.width - fabDimensions.width - margin, left);

  return { top, left };
}

/**
 * Calculate position for the context tooltip/popover.
 * Similar to FAB but for a larger panel element.
 */
export function calculateTooltipPosition(
  anchorRect: DOMRect,
  tooltipDimensions: ElementDimensions,
  offset = 12
): Position & { placement: 'top' | 'bottom' } {
  const viewport = getViewportBounds();
  const scroll = { x: window.scrollX, y: window.scrollY };
  const spaceAbove = anchorRect.top;
const spaceBelow = viewport.height - anchorRect.bottom;

let top: number;
let placement: 'top' | 'bottom';

if (spaceBelow >= tooltipDimensions.height + offset) {
  // Place below when there is enough space
  top = anchorRect.bottom + scroll.y + offset;
  placement = 'bottom';
} else if (spaceAbove >= tooltipDimensions.height + offset) {
  // Place above when there is enough space
  top = anchorRect.top + scroll.y - tooltipDimensions.height - offset;
  placement = 'top';
} else {
  // Neither side has enough room; use the side with more space
  if (spaceBelow >= spaceAbove) {
    top = anchorRect.bottom + scroll.y + offset;
    placement = 'bottom';
  } else {
    top = anchorRect.top + scroll.y - tooltipDimensions.height - offset;
    placement = 'top';
  }
}
  

  // Center horizontally on anchor
  let left = anchorRect.left + scroll.x + anchorRect.width / 2 - tooltipDimensions.width / 2;

  // Clamp horizontally
  const margin = 8;
  left = Math.max(scroll.x + margin, left);
  left = Math.min(scroll.x + viewport.width - tooltipDimensions.width - margin, left);

  return { top, left, placement };
}

// ============================================
// Helpers
// ============================================

function getViewportBounds(): ViewportBounds {
  return {
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight,
  };
}

/**
 * Check if a position is fully within the viewport.
 */
export function isPositionVisible(
  position: Position,
  dimensions: ElementDimensions
): boolean {
  const viewport = getViewportBounds();
  const scroll = { x: window.scrollX, y: window.scrollY };

  return (
    position.left >= scroll.x &&
    position.top >= scroll.y &&
    position.left + dimensions.width <= scroll.x + viewport.width &&
    position.top + dimensions.height <= scroll.y + viewport.height
  );
}

/**
 * Get viewport-relative coordinates from a document-absolute position.
 */
export function toViewportCoords(
  documentPosition: Position
): Position {
  return {
    top: documentPosition.top - window.scrollY,
    left: documentPosition.left - window.scrollX,
  };
}