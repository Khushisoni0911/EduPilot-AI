/**
 * Application-wide Constants
 *
 * Centralizing constants prevents "magic strings" scattered across code.
 * If an API endpoint changes, you update it in ONE place.
 */

// ============================================
// API Configuration
// ============================================

export const API_CONFIG = {
  // Will switch to production URL in deployment
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  VERSION: '/api/v1',
  TIMEOUT: 30000, // 30 seconds
} as const;

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',

  // AI Features
  SUMMARIZE: '/ai/summarize',
  QUIZ: '/ai/quiz',
  EXPLAIN: '/ai/explain',
  FLASHCARDS: '/ai/flashcards',

  // Notes
  NOTES: '/notes',
  NOTE_BY_ID: (id: string) => `/notes/${id}`,

  // User
  PROFILE: '/user/profile',
  SETTINGS: '/user/settings',
} as const;

// ============================================
// Chrome Storage Keys
// ============================================

export const STORAGE_KEYS = {
  USER: 'user',
  AUTH_TOKEN: 'authToken',
  SETTINGS: 'settings',
  ONBOARDING: 'onboarding',
  CACHED_NOTES: 'cachedNotes',
} as const;

// ============================================
// Extension Message Types
// ============================================

export const MESSAGE_TYPES = {
  PING: 'PING',
  GET_PAGE_CONTENT: 'GET_PAGE_CONTENT',
  GET_ACTIVE_TAB_INFO: 'GET_ACTIVE_TAB_INFO',
  SUMMARIZE_PAGE: 'SUMMARIZE_PAGE',
  GENERATE_QUIZ: 'GENERATE_QUIZ',
  EXPLAIN_TEXT: 'EXPLAIN_TEXT',
  SAVE_NOTE: 'SAVE_NOTE',
  AUTH_LOGIN: 'AUTH_LOGIN',
  AUTH_LOGOUT: 'AUTH_LOGOUT',
} as const;

// ============================================
// UI Constants
// ============================================

export const UI = {
  POPUP_WIDTH: 400,
  POPUP_HEIGHT: 580,
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 3000,
} as const;

// ============================================
// AI Configuration
// ============================================

export const AI_CONFIG = {
  MAX_INPUT_LENGTH: 10000,     // Max characters to send to AI
  MAX_SUMMARY_LENGTH: 2000,    // Max summary length in characters
  MAX_QUIZ_QUESTIONS: 20,
  DEFAULT_QUIZ_COUNT: 5,
} as const;