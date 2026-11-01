/**
 * Floating Action Button Renderer
 *
 * Creates and manages the DOM structure of the FAB (Floating Action Button)
 * that appears near selected text.
 *
 * The FAB is a small button cluster that gives users quick access to
 * AI actions (summarize, explain, quiz, define, save note).
 *
 * ARCHITECTURE NOTE:
 * The FAB is NOT a React component — it's pure DOM.
 * Why? Content scripts that inject React create complex bundling.
 * For a small, performance-critical UI like the FAB, vanilla DOM
 * is faster to mount and lighter on memory.
 * (The sidebar IS React because it's more complex.)
 *
 * DESIGN:
 * - Appears near selected text
 * - Shows main AI button + expandable action buttons
 * - Auto-hides after 5 seconds of no interaction
 * - Has a close button
 */

import { createElement } from '../dom/DOMUtils';
import type { FABAction } from '../../shared/types/messages';

// ============================================
// FAB Action Configuration
// ============================================

export interface FABActionConfig {
  id: FABAction;
  label: string;
  emoji: string;
  title: string;
  shortcutKey?: string;
}

export const FAB_ACTIONS: FABActionConfig[] = [
  {
    id: 'explain',
    label: 'Explain',
    emoji: '💡',
    title: 'Explain this text in simple terms',
  },
  {
    id: 'summarize',
    label: 'Summarize',
    emoji: '📝',
    title: 'Summarize selected content',
  },
  {
    id: 'define',
    label: 'Define',
    emoji: '📖',
    title: 'Define this word or phrase',
  },
  {
    id: 'quiz',
    label: 'Quiz',
    emoji: '❓',
    title: 'Generate quiz questions',
  },
  {
    id: 'save-note',
    label: 'Save',
    emoji: '🔖',
    title: 'Save as a note',
  },
];

// ============================================
// FAB Element IDs
// ============================================

const FAB_HOST_ID = 'edupilot-ai-fab-host';
const FAB_CONTAINER_ID = 'edupilot-ai-fab-container';
// ============================================
// FABRenderer Class
// ============================================

export type FABActionHandler = (action: FABAction, selectedText: string) => void;

export class FABRenderer {
  private hostElement: HTMLElement | null = null;
  private containerElement: HTMLElement | null = null;
  private actionHandler: FABActionHandler;
  //private isExpanded = false;
  private currentSelectedText = '';
  private autoHideTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(actionHandler: FABActionHandler) {
    this.actionHandler = actionHandler;
  }

  // ============================================
  // Public API
  // ============================================

  /**
   * Mount the FAB into the document.
   * Must be called before show().
   */
  mount(): void {
    if (document.getElementById(FAB_HOST_ID)) return;

    // Create host element (positioned by FABPositioner)
    this.hostElement = createElement('div', {
      id: FAB_HOST_ID,
      attributes: {
        'data-extension': 'edupilot-ai',
        'aria-label': 'EduPilot AI actions',
        role: 'toolbar',
      },
      style: {
        position: 'absolute',
        zIndex: '2147483646', // Just below sidebar
        display: 'none',
        pointerEvents: 'auto',
        // Transitions for smooth show/hide
        transition: 'opacity 0.15s ease, transform 0.15s ease',
        opacity: '0',
        transform: 'translateY(4px) scale(0.95)',
      },
    });

    // Create the visible container
    this.containerElement = this.buildFABContainer();
    this.hostElement.appendChild(this.containerElement);

    // Append to body
    document.body.appendChild(this.hostElement);
  }

  /**
   * Show the FAB at a specific position with selected text context.
   */
  show(top: number, left: number, selectedText: string): void {
    if (!this.hostElement) return;

    this.currentSelectedText = selectedText;
    //this.isExpanded = false;

    // Update position
    this.hostElement.style.top = `${top}px`;
    this.hostElement.style.left = `${left}px`;
    this.hostElement.style.display = 'block';

    // Animate in
    requestAnimationFrame(() => {
      if (!this.hostElement) return;
      this.hostElement.style.opacity = '1';
      this.hostElement.style.transform = 'translateY(0) scale(1)';
    });

    // Update the selected text preview in FAB
    this.updateTextPreview(selectedText);

    // Start auto-hide timer
    this.scheduleAutoHide();
  }

  /**
   * Hide the FAB.
   */
  hide(): void {
    if (!this.hostElement) return;

    this.cancelAutoHide();

    // Animate out
    this.hostElement.style.opacity = '0';
    this.hostElement.style.transform = 'translateY(4px) scale(0.95)';

    setTimeout(() => {
      if (this.hostElement) {
        this.hostElement.style.display = 'none';
      }
      //this.isExpanded = false;
    }, 150);
  }

  /**
   * Completely remove the FAB from the DOM.
   */
  unmount(): void {
    this.cancelAutoHide();
    this.hostElement?.remove();
    this.hostElement = null;
    this.containerElement = null;
  }

  /**
   * Check if FAB is currently visible.
   */
  isVisible(): boolean {
    return this.hostElement?.style.display !== 'none';
  }

  // ============================================
  // DOM Building
  // ============================================

  private buildFABContainer(): HTMLElement {
    // Main pill-shaped button container
    const container = createElement('div', {
      id: FAB_CONTAINER_ID,
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))',
      },
    });

    // ── Text preview chip ─────────────────────────
    const textPreview = this.buildTextPreview();
    container.appendChild(textPreview);

    // ── Action buttons row ────────────────────────
    const actionsRow = this.buildActionsRow();
    container.appendChild(actionsRow);

    return container;
  }

  private buildTextPreview(): HTMLElement {
    const preview = createElement('div', {
      attributes: { 'data-fab-preview': 'true' },
      style: {
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(8px)',
        color: '#e2e8f0',
        fontSize: '11px',
        padding: '4px 10px',
        borderRadius: '20px',
        maxWidth: '220px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        letterSpacing: '0.01em',
      },
    });
    return preview;
  }

  private buildActionsRow(): HTMLElement {
    const row = createElement('div', {
      style: {
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(12px)',
        borderRadius: '24px',
        padding: '4px',
        border: '1px solid rgba(255,255,255,0.1)',
      },
    });

    // Main AI button
    const mainBtn = this.buildMainButton();
    row.appendChild(mainBtn);

    // Divider
    const divider = createElement('div', {
      style: {
        width: '1px',
        height: '20px',
        background: 'rgba(255,255,255,0.15)',
        margin: '0 2px',
      },
    });
    row.appendChild(divider);

    // Action buttons
    FAB_ACTIONS.forEach((action) => {
      const btn = this.buildActionButton(action);
      row.appendChild(btn);
    });

    // Close button
    const closeBtn = this.buildCloseButton();
    row.appendChild(closeBtn);

    return row;
  }

  private buildMainButton(): HTMLElement {
    const btn = createElement('button', {
      attributes: {
        title: 'EduPilot AI — Click an action',
        'aria-label': 'EduPilot AI',
      },
      style: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
        border: 'none',
        cursor: 'default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        flexShrink: '0',
      },
      innerHTML: '🎓',
    });

    return btn;
  }

  private buildActionButton(action: FABActionConfig): HTMLElement {
    const btn = createElement('button', {
      dataset: { fabAction: action.id },
      attributes: { title: action.title, 'aria-label': action.label },
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1px',
        width: '40px',
        height: '32px',
        borderRadius: '16px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        transition: 'background 0.15s ease',
        padding: '0',
      },
      innerHTML: `
        <span style="font-size: 13px; line-height: 1;">${action.emoji}</span>
        <span style="
          font-size: 9px;
          color: #94a3b8;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-weight: 500;
          line-height: 1;
        ">${action.label}</span>
      `,
    });

    // Hover effect
    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(255,255,255,0.12)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'transparent';
    });

    // Click handler
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.cancelAutoHide();
      this.actionHandler(action.id, this.currentSelectedText);
      this.hide();
    });

    return btn;
  }

  private buildCloseButton(): HTMLElement {
    const btn = createElement('button', {
      attributes: { title: 'Dismiss', 'aria-label': 'Close EduPilot AI popup' },
      style: {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        color: '#64748b',
        flexShrink: '0',
        marginLeft: '2px',
        transition: 'background 0.15s ease',
      },
      innerHTML: '✕',
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(255,255,255,0.15)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'rgba(255,255,255,0.08)';
    });

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.hide();
    });

    return btn;
  }

  // ============================================
  // Helpers
  // ============================================

  private updateTextPreview(text: string): void {
    const preview = this.containerElement?.querySelector('[data-fab-preview]');
    if (preview) {
      const truncated =
        text.length > 40 ? text.slice(0, 37) + '...' : text;
      preview.textContent = `"${truncated}"`;
    }
  }

  private scheduleAutoHide(delayMs = 6000): void {
    this.cancelAutoHide();
    this.autoHideTimer = setTimeout(() => {
      this.hide();
    }, delayMs);
  }

  private cancelAutoHide(): void {
    if (this.autoHideTimer !== null) {
      clearTimeout(this.autoHideTimer);
      this.autoHideTimer = null;
    }
  }
}