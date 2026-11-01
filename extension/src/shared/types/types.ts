/**
 * Centralized TypeScript Type Definitions — Module 2
 *
 * All types used across popup, sidebar, content script,
 * and background worker are defined here.
 *
 * PRINCIPLE: Single source of truth for data shapes.
 * If a type changes, update it here and TypeScript will
 * flag every place that needs updating automatically.
 */

// ============================================
// User & Auth Types
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: UserPlan;
  createdAt: string;
}

export type UserPlan = 'free' | 'pro' | 'student';

// ============================================
// Message System Types
// ============================================

/**
 * All possible message types in the extension.
 * Using a const object + type ensures autocomplete works.
 */
export const MESSAGE_TYPES = {
  // Connection / Health
  PING: 'PING',

  // Sidebar control
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  OPEN_SIDEBAR: 'OPEN_SIDEBAR',
  CLOSE_SIDEBAR: 'CLOSE_SIDEBAR',
  SIDEBAR_READY: 'SIDEBAR_READY',

  // Page content
  GET_PAGE_CONTENT: 'GET_PAGE_CONTENT',
  GET_SELECTED_TEXT: 'GET_SELECTED_TEXT',
  GET_ACTIVE_TAB_INFO: 'GET_ACTIVE_TAB_INFO',

  // AI Actions (scaffold for future modules)
  SUMMARIZE_PAGE: 'SUMMARIZE_PAGE',
  GENERATE_QUIZ: 'GENERATE_QUIZ',
  EXPLAIN_TEXT: 'EXPLAIN_TEXT',

  // Notes (scaffold for future modules)
  SAVE_NOTE: 'SAVE_NOTE',
  GET_NOTES: 'GET_NOTES',

  // Auth (scaffold for future modules)
  AUTH_LOGIN: 'AUTH_LOGIN',
  AUTH_LOGOUT: 'AUTH_LOGOUT',
  GET_AUTH_STATUS: 'GET_AUTH_STATUS',

  // Settings
  GET_SETTINGS: 'GET_SETTINGS',
  SAVE_SETTINGS: 'SAVE_SETTINGS',
} as const;

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];

export interface ExtensionMessage<T = unknown> {
  type: MessageType;
  payload?: T;
  requestId?: string;
}

export interface ExtensionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  requestId?: string;
}

// ============================================
// Tab & Page Types
// ============================================

export interface TabInfo {
  id: number;
  url: string;
  title: string;
  favicon?: string;
  isSupported: boolean; // false for chrome:// pages, pdf, etc.
}

export interface PageContent {
  url: string;
  title: string;
  text: string;
  selectedText?: string;
  metadata: PageMetadata;
}

export interface PageMetadata {
  description?: string;
  author?: string;
  publishedDate?: string;
  siteName?: string;
  language?: string;
  wordCount: number;
  readingTimeMinutes: number;
}

// ============================================
// Sidebar Types
// ============================================

export type SidebarPanel = 'summary' | 'quiz' | 'notes' | 'explain' | 'flashcards';

export type SidebarPosition = 'right' | 'left';

export interface SidebarState {
  isOpen: boolean;
  activePanel: SidebarPanel;
  position: SidebarPosition;
  width: number;
  isLoading: boolean;
}

// ============================================
// AI Feature Types (Scaffold — used in Module 5+)
// ============================================

export interface SummarizeRequest {
  content: string;
  length: 'brief' | 'detailed' | 'comprehensive';
  style: 'bullet-points' | 'paragraph' | 'key-concepts';
}

export interface SummarizeResponse {
  summary: string;
  keyPoints: string[];
  readingTime: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// ============================================
// Notes Types (Scaffold — used in Module 6+)
// ============================================

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  sourceUrl: string;
  sourceTitle: string;
  tags: string[];
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Settings Types
// ============================================

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  sidebarPosition: SidebarPosition;
  sidebarWidth: number;
  autoOpenSidebar: boolean;
  summaryLength: 'brief' | 'detailed' | 'comprehensive';
  quizDifficulty: 'easy' | 'medium' | 'hard';
  language: string;
  keyboardShortcuts: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  sidebarPosition: 'right',
  sidebarWidth: 380,
  autoOpenSidebar: false,
  summaryLength: 'brief',
  quizDifficulty: 'medium',
  language: 'en',
  keyboardShortcuts: true,
};

// ============================================
// Storage Keys (typed constants)
// ============================================

export const STORAGE_KEYS = {
  USER: 'user',
  AUTH_TOKEN: 'authToken',
  SETTINGS: 'settings',
  ONBOARDING: 'onboarding',
  NOTES: 'notes',
  SIDEBAR_STATE: 'sidebarState',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];