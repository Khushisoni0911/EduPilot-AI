
/**
 * Content Script Message Router
 *
 * Handles ALL incoming messages from background/popup.
 * Routes each message type to the appropriate handler.
 *
 * This is the "receiver" side of the content script's
 * messaging system. ContentMessenger handles sending;
 * MessageRouter handles receiving.
 */

import type {
  IncomingContentMessage,
  MessageResponse,
  PageContentResponse,
  SelectedTextResponse,
  PageContextResponse,
} from '../../shared/types/messages';
import { extractPageContent } from '../page-extractor';
import type { SelectionTracker } from '../selection/SelectionTracker';
import type { ContextDetector } from '../context/ContextDetector';
import type { FABManager } from '../fab/FABManager';
import {
  isSidebarVisible,
  toggleSidebar,
  openSidebar,
  closeSidebar,
} from '../sidebar-injector';
import { highlightCurrentSelection } from '../selection/RangeUtils';

export interface RouterDependencies {
  selectionTracker: SelectionTracker;
  contextDetector: ContextDetector;
  fabManager: FABManager;
}

export class MessageRouter {
  private deps: RouterDependencies;

  constructor(deps: RouterDependencies) {
    this.deps = deps;
  }

  /**
   * Route an incoming message to the correct handler.
   * Returns a Promise resolving to the response.
   */
  async route(
    message: IncomingContentMessage
  ): Promise<MessageResponse> {
    switch (message.type) {
      case 'PING':
        return this.handlePing();

      case 'GET_PAGE_CONTENT':
        return this.handleGetPageContent();

      case 'GET_SELECTED_TEXT':
        return this.handleGetSelectedText();

      case 'GET_PAGE_CONTEXT':
        return this.handleGetPageContext();

      case 'TOGGLE_SIDEBAR':
        return this.handleToggleSidebar();

      case 'OPEN_SIDEBAR':
        return this.handleOpenSidebar(message.payload?.panel);

      case 'CLOSE_SIDEBAR':
        return this.handleCloseSidebar();

      case 'HIGHLIGHT_TEXT':
        return this.handleHighlightText(message.payload.color);

      default:
        return {
          success: false,
          error: 'Unknown message type received by content script',
        };
    }
  }

  // ============================================
  // Individual Handlers
  // ============================================

  private handlePing(): MessageResponse {
    return {
      success: true,
      data: {
        alive: true,
        url: window.location.href,
        title: document.title,
        sidebarOpen: isSidebarVisible(),
        hasSelection: this.deps.selectionTracker.hasSelection(),
      },
    };
  }

  private handleGetPageContent(): MessageResponse<PageContentResponse> {
    try {
      const content = extractPageContent();

      // TEMPORARY DEBUG LOG: Verify page extraction results.
      console.log('[EduPilot Test] Page extraction results:', {
        title: content.title,
        url: content.url,
        textLength: content.text.length,
        wordCount: content.metadata.wordCount,
        readingTime: content.metadata.readingTimeMinutes,
        preview: content.text.slice(0, 300),
      });

      return {
        success: true,
        data: {
          url: content.url,
          title: content.title,
          text: content.text,
          wordCount: content.metadata.wordCount,
          readingTime: content.metadata.readingTimeMinutes,
          metadata: {
            description: content.metadata.description,
            author: content.metadata.author,
            publishedDate: content.metadata.publishedDate,
            siteName: content.metadata.siteName,
            language: content.metadata.language,
          },
        },
      };
    } catch (error) {
      console.error('[EduPilot Test] Page extraction failed:', error);

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to extract page content',
      };
    }
  }

  private handleGetSelectedText(): MessageResponse<SelectedTextResponse> {
    const text = this.deps.selectionTracker.getSelectedText();
    const position = this.deps.selectionTracker.getSelectionPosition();

    return {
      success: true,
      data: {
        text,
        isEmpty: text.length === 0,
        wordCount: text.split(/\s+/).filter(Boolean).length,
        position: position ?? undefined,
      },
    };
  }

  private handleGetPageContext(): MessageResponse<PageContextResponse> {
    try {
      const context = this.deps.contextDetector.detect();

      return {
        success: true,
        data: { context },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Context detection failed',
      };
    }
  }

  private handleToggleSidebar(): MessageResponse {
    toggleSidebar();

    return {
      success: true,
      data: { isOpen: isSidebarVisible() },
    };
  }

  private handleOpenSidebar(panel?: string): MessageResponse {
  openSidebar(panel);

  return {
    success: true,
    data: { isOpen: true, panel },
  };
}

  private handleCloseSidebar(): MessageResponse {
    closeSidebar();

    return {
      success: true,
      data: { isOpen: false },
    };
  }

  private handleHighlightText(color?: string): MessageResponse {
    const highlighted = highlightCurrentSelection(color);

    return {
      success: highlighted,
      data: { highlighted },
    };
  }
}