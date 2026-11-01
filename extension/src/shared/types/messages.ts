/**
 * Typed Message Contracts
 *
 * This file defines the EXACT shape of every message that can flow
 * through the extension's messaging system.
 *
 * WHY A SEPARATE FILE?
 * Messages are the "API" between extension components.
 * Defining them strictly here means:
 * - TypeScript will catch wrong message shapes at compile time
 * - Every developer knows exactly what data each message carries
 * - Refactoring is safe — change a type here and TS flags everything
 *
 * PATTERN: Discriminated Union Types
 * Each message has a `type` field that TypeScript uses to narrow
 * the type of the entire message object. This gives full type safety
 * in switch statements.
 */

// ============================================
// Outgoing Messages (Content → Background)
// ============================================

export interface TextSelectedMessage {
  type: 'TEXT_SELECTED';
  payload: {
    text: string;
    wordCount: number;
    charCount: number;
    position: SelectionPosition;
    pageContext: PageContextSummary;
    url: string;
    timestamp: number;
  };
}

export interface TextDeselectedMessage {
  type: 'TEXT_DESELECTED';
  payload: { url: string };
}

export interface PageContextReadyMessage {
  type: 'PAGE_CONTEXT_READY';
  payload: PageContextSummary;
}

export interface ContentScriptReadyMessage {
  type: 'CONTENT_SCRIPT_READY';
  payload: {
    url: string;
    title: string;
    siteType: SiteType;
  };
}

export interface FABActionTriggeredMessage {
  type: 'FAB_ACTION_TRIGGERED';
  payload: {
    action: FABAction;
    selectedText: string;
    url: string;
  };
}

export interface ContextMenuActionMessage {
  type: 'CONTEXT_MENU_ACTION';
  payload: {
    action: ContextMenuAction;
    selectedText: string;
    url: string;
    pageTitle: string;
  };
}

// ============================================
// Incoming Messages (Background/Popup → Content)
// ============================================

export interface GetPageContentMessage {
  type: 'GET_PAGE_CONTENT';
  payload?: undefined;
}

export interface GetSelectedTextMessage {
  type: 'GET_SELECTED_TEXT';
  payload?: undefined;
}

export interface GetPageContextMessage {
  type: 'GET_PAGE_CONTEXT';
  payload?: undefined;
}

export interface ToggleSidebarMessage {
  type: 'TOGGLE_SIDEBAR';
  payload?: undefined;
}

export interface OpenSidebarMessage {
  type: 'OPEN_SIDEBAR';
  payload?: { panel?: string };
}

export interface CloseSidebarMessage {
  type: 'CLOSE_SIDEBAR';
  payload?: undefined;
}

export interface PingMessage {
  type: 'PING';
  payload?: undefined;
}

export interface HighlightTextMessage {
  type: 'HIGHLIGHT_TEXT';
  payload: { text: string; color?: HighlightColor };
}

// ============================================
// Discriminated Union — ALL Messages
// ============================================

/** All messages that can be sent FROM content script */
export type OutgoingContentMessage =
  | TextSelectedMessage
  | TextDeselectedMessage
  | PageContextReadyMessage
  | ContentScriptReadyMessage
  | FABActionTriggeredMessage
  | ContextMenuActionMessage;

/** All messages that can be received BY content script */
export type IncomingContentMessage =
  | GetPageContentMessage
  | GetSelectedTextMessage
  | GetPageContextMessage
  | ToggleSidebarMessage
  | OpenSidebarMessage
  | CloseSidebarMessage
  | PingMessage
  | HighlightTextMessage;

/** Combined type for the message router */
//export type AnyMessage = OutgoingContentMessage | IncomingContentMessage;
export interface GetActiveTabInfoMessage {
  type: 'GET_ACTIVE_TAB_INFO';
  payload?: undefined;
}

export interface GetSettingsMessage {
  type: 'GET_SETTINGS';
  payload?: undefined;
}

export interface SaveSettingsMessage {
  type: 'SAVE_SETTINGS';
  payload: unknown;
}

export interface GetAuthStatusMessage {
  type: 'GET_AUTH_STATUS';
  payload?: undefined;
}

export type AnyMessage =
  | OutgoingContentMessage
  | IncomingContentMessage
  | GetActiveTabInfoMessage
  | GetSettingsMessage
  | SaveSettingsMessage
  | GetAuthStatusMessage;

// ============================================
// Supporting Types
// ============================================

export interface SelectionPosition {
  /** Position relative to the viewport */
  viewport: { top: number; left: number; bottom: number; right: number };
  /** Position relative to the document */
  document: { top: number; left: number };
  /** Width and height of the selection bounding box */
  width: number;
  height: number;
}

export interface PageContextSummary {
  siteType: SiteType;
  url: string;
  title: string;
  domain: string;
  isReadingMode: boolean;
  hasCode: boolean;
  hasVideo: boolean;
  estimatedReadTime: number;
  wordCount: number;
  language: string;
  detectedTopics: string[];
}

export type SiteType =
  | 'article'
  | 'documentation'
  | 'youtube'
  | 'coding-platform'
  | 'research-paper'
  | 'educational'
  | 'news'
  | 'blog'
  | 'ecommerce'
  | 'social-media'
  | 'unsupported'
  | 'unknown';

export type FABAction =
  | 'summarize'
  | 'explain'
  | 'quiz'
  | 'define'
  | 'translate'
  | 'save-note';

export type ContextMenuAction =
  | 'explain-selection'
  | 'summarize-selection'
  | 'quiz-from-selection'
  | 'define-word'
  | 'save-as-note';

export type HighlightColor = 'yellow' | 'blue' | 'green' | 'pink';

// ============================================
// Response Types
// ============================================

export interface MessageResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  requestId?: string;
}

export interface PageContentResponse {
  url: string;
  title: string;
  text: string;
  wordCount: number;
  readingTime: number;
  metadata: Record<string, string | undefined>;
}

export interface SelectedTextResponse {
  text: string;
  isEmpty: boolean;
  wordCount: number;
  position?: SelectionPosition;
}

export interface PageContextResponse {
  context: PageContextSummary;
}