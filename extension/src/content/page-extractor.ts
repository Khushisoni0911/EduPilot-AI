/**
 * Page Content Extractor
 *
 * Extracts readable text content from web pages.
 * This is the foundation for all AI features —
 * summarization, quiz generation, and explanation
 * all start with extracting the page content.
 *
 * EXTRACTION STRATEGY:
 * 1. Try to find main content areas (article, main, etc.)
 * 2. Fall back to intelligent body text extraction
 * 3. Clean the text (remove nav, ads, footers)
 * 4. Calculate reading metadata
 */

import type { PageContent, PageMetadata } from '../shared/types/types';

// ============================================
// Main Extraction Functions
// ============================================

/**
 * Extract the full readable content of the current page.
 */
export function extractPageContent(): PageContent {
  const text = extractReadableText();
  const metadata = extractMetadata(text);

  return {
    url: window.location.href,
    title: document.title,
    text,
    metadata,
  };
}

/**
 * Get the text the user has currently selected.
 */
export function getSelectedText(): string {
  return window.getSelection()?.toString().trim() ?? '';
}

// ============================================
// Text Extraction
// ============================================

/**
 * Extract readable text using a priority-based strategy.
 *
 * Priority order:
 * 1. <article> tag — semantic main content
 * 2. <main> tag — HTML5 main content area
 * 3. Common content selectors (article-body, post-content, etc.)
 * 4. Body text with noise removal
 */
function extractReadableText(): string {
  // Priority 1: Look for semantic article element
  const articleElement = document.querySelector('article');
  if (articleElement && isSubstantial(articleElement)) {
    return cleanText(articleElement.innerText);
  }

  // Priority 2: Look for <main> element
  const mainElement = document.querySelector('main');
  if (mainElement && isSubstantial(mainElement)) {
    return cleanText(mainElement.innerText);
  }

  // Priority 3: Common content class selectors
  const contentSelectors = [
    '[role="main"]',
    '.article-content',
    '.post-content',
    '.entry-content',
    '.content-body',
    '.story-body',
    '#content',
    '#main-content',
    '.main-content',
  ];

  for (const selector of contentSelectors) {
    const element = document.querySelector(selector) as HTMLElement | null;
    if (element && isSubstantial(element)) {
      return cleanText(element.innerText);
    }
  }

  // Priority 4: Extract from body, removing noisy elements
  return extractFromBody();
}

/**
 * Extract text from body while removing navigation, ads, headers, footers.
 */
function extractFromBody(): string {
  // Clone body to avoid modifying the actual page
  const bodyClone = document.body.cloneNode(true) as HTMLElement;

  // Remove noisy elements from the clone
  const noiseSelectors = [
    'nav', 'header', 'footer', 'aside',
    '.advertisement', '.ads', '.ad-container',
    '.sidebar', '.navigation', '.menu',
    '.cookie-banner', '.popup', '.modal',
    'script', 'style', 'noscript',
    '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
  ];

  noiseSelectors.forEach((selector) => {
    bodyClone.querySelectorAll(selector).forEach((el) => el.remove());
  });

  return cleanText(bodyClone.innerText);
}

// ============================================
// Metadata Extraction
// ============================================

/**
 * Extract page metadata from meta tags and content analysis.
 */
function extractMetadata(text: string): PageMetadata {
  const wordCount = countWords(text);
  const readingTimeMinutes = calculateReadingTime(wordCount);

  return {
    description: getMeta('description') ?? getMeta('og:description'),
    author: getMeta('author') ?? getMeta('og:article:author'),
    publishedDate: getMeta('article:published_time') ?? getMeta('og:published_time'),
    siteName: getMeta('og:site_name') ?? window.location.hostname,
    language: document.documentElement.lang || 'en',
    wordCount,
    readingTimeMinutes,
  };
}

/**
 * Helper to get meta tag content by name or property.
 */
function getMeta(name: string): string | undefined {
  const byName = document.querySelector(`meta[name="${name}"]`);
  const byProperty = document.querySelector(`meta[property="${name}"]`);
  const element = byName || byProperty;
  return (element as HTMLMetaElement)?.content || undefined;
}

// ============================================
// Text Utilities
// ============================================

/**
 * Clean extracted text — remove excess whitespace and empty lines.
 */
function cleanText(text: string): string {
  return text
    .replace(/\t/g, ' ')              // Replace tabs with spaces
    .replace(/\n{3,}/g, '\n\n')       // Max 2 consecutive newlines
    .replace(/[ ]{2,}/g, ' ')         // Max 1 consecutive space
    .trim();
}

/**
 * Check if an element has substantial text content (> 100 chars).
 * Prevents extracting from tiny/empty sections.
 */
function isSubstantial(element: HTMLElement): boolean {
  return element.innerText.trim().length > 100;
}

/**
 * Count words in a text string.
 */
function countWords(text: string): number {
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Calculate estimated reading time.
 * Average adult reads ~200-250 words per minute.
 */
function calculateReadingTime(wordCount: number): number {
  const WORDS_PER_MINUTE = 225;
  return Math.ceil(wordCount / WORDS_PER_MINUTE);
}