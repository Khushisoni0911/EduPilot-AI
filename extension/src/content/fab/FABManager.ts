/**
 * FAB Manager
 *
 * Orchestrates the full FAB lifecycle:
 * - Listens to SelectionDetector events
 * - Uses FABPositioner to calculate position
 * - Uses FABRenderer to show/hide the FAB
 * - Handles scroll/resize to reposition the FAB
 * - Communicates FAB actions to the content script
 *
 * This is the "controller" in the MVC pattern:
 * - SelectionDetector = Model (what's selected)
 * - FABRenderer = View (what the FAB looks like)
 * - FABManager = Controller (when/where to show it)
 */

import { FABRenderer } from './FABRenderer';
import { calculateFABPosition } from '../dom/PositionUtils';
import { getSelectionRect } from '../selection/RangeUtils';
import { EventManager } from '../dom/EventManager';
import { throttle } from '../../shared/utils/debounce';
import type { FABAction } from '../../shared/types/messages';
import type { SelectionData } from '../selection/SelectionDetector';

export type FABActionCallback = (action: FABAction, selectedText: string) => void;

export class FABManager {
  private renderer: FABRenderer;
  private eventManager: EventManager;
  private onActionCallback: FABActionCallback;
  private currentSelectionData: SelectionData | null = null;

  // FAB approximate dimensions (used for position calculation)
  private readonly FAB_DIMENSIONS = { width: 240, height: 70 };

  constructor(eventManager: EventManager, onAction: FABActionCallback) {
    this.eventManager = eventManager;
    this.onActionCallback = onAction;

    this.renderer = new FABRenderer((action, text) => {
      this.onActionCallback(action, text);
    });
  }

  // ============================================
  // Lifecycle
  // ============================================

  initialize(): void {
    // Mount FAB into DOM
    this.renderer.mount();

    // Reposition FAB on scroll (throttled to avoid performance issues)
    const throttledReposition = throttle(this.repositionFAB.bind(this), 16); // 60fps
    this.eventManager.add(window, 'scroll', throttledReposition, { passive: true });

    // Hide FAB on resize (position would be wrong)
    this.eventManager.add(window, 'resize', () => {
      this.hideFAB();
    });

    console.info('[FABManager] Initialized');
  }

  destroy(): void {
    this.renderer.unmount();
  }

  // ============================================
  // Selection Handlers
  // ============================================

  /**
   * Called when the user selects text.
   * Positions and shows the FAB near the selection.
   */
  onTextSelected(data: SelectionData): void {
    this.currentSelectionData = data;
    this.showFABForSelection(data);
  }

  /**
   * Called when the user deselects text.
   * Hides the FAB.
   */
  onTextDeselected(): void {
    this.currentSelectionData = null;
    this.hideFAB();
  }

  // ============================================
  // Private Helpers
  // ============================================

  private showFABForSelection(data: SelectionData): void {
    // Get the current selection's bounding rect
    // (use live rect, not stored one, in case user scrolled)
    const rect = getSelectionRect();
    if (!rect) {
      this.hideFAB();
      return;
    }

    // Calculate optimal FAB position
    const position = calculateFABPosition(rect, this.FAB_DIMENSIONS);

    // Show FAB at calculated position
    this.renderer.show(position.top, position.left, data.trimmedText);
  }

  private hideFAB(): void {
    this.renderer.hide();
  }

  /**
   * Recalculate FAB position after scroll.
   * Only repositions if FAB is currently visible.
   */
  private repositionFAB(): void {
    if (!this.renderer.isVisible() || !this.currentSelectionData) return;

    const rect = getSelectionRect();
    if (!rect) {
      this.hideFAB();
      return;
    }

    const position = calculateFABPosition(rect, this.FAB_DIMENSIONS);
    // Update position directly (no animation for scroll repositioning)
    const fabHost = document.getElementById('edupilot-ai-fab-host');
    if (fabHost) {
      fabHost.style.top = `${position.top}px`;
      fabHost.style.left = `${position.left}px`;
    }
  }
}