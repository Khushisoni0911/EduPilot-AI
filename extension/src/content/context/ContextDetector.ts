/**
 * Website Context Detector
 *
 * Analyzes the current webpage to determine what TYPE of site it is.
 * This allows our AI features to be more context-aware:
 *
 * - On YouTube → offer to summarize video transcript
 * - On GitHub → offer to explain code
 * - On a research paper → offer academic-style summary
 * - On a news site → offer to identify bias/perspective
 * - On documentation → offer to generate code examples
 *
 * DETECTION STRATEGY:
 * Each detector uses multiple signals (URL patterns, meta tags,
 * DOM elements, page structure) with a confidence scoring system.
 * The highest-confidence detector wins.
 */

import type { PageContextSummary, SiteType } from '../../shared/types/messages';
import { getDomain, getWordCount, qsa, parseURL } from '../dom/DOMUtils';
import { YouTubeDetector } from './detectors/YouTubeDetector';
import { CodingDetector } from './detectors/CodingDetector';
import { DocumentationDetector } from './detectors/DocumentationDetector';
import { ArticleDetector } from './detectors/ArticleDetector';

// ============================================
// Detector Interface
// ============================================

export interface DetectorResult {
  siteType: SiteType;
  confidence: number; // 0-1 score
  metadata?: Record<string, unknown>;
}

export interface SiteDetector {
  detect(url: URL, document: Document): DetectorResult;
}

// ============================================
// ContextDetector Class
// ============================================

export class ContextDetector {
  private detectors: SiteDetector[];
  private cachedContext: PageContextSummary | null = null;
  private cachedUrl = '';

  constructor() {
    this.detectors = [
      new YouTubeDetector(),
      new CodingDetector(),
      new DocumentationDetector(),
      new ArticleDetector(),
    ];
  }

  // ============================================
  // Public API
  // ============================================

  /**
   * Analyze the current page and return a context summary.
   * Results are cached for the current URL.
   */
  detect(): PageContextSummary {
    const currentUrl = window.location.href;

    // Return cached result if URL hasn't changed
    if (this.cachedContext && this.cachedUrl === currentUrl) {
      return this.cachedContext;
    }

    const parsedUrl = parseURL(currentUrl);
    if (!parsedUrl) {
      return this.buildDefaultContext('unsupported');
    }

    // Run all detectors and find the highest confidence one
    const results = this.detectors
      .map((detector) => {
        try {
          return detector.detect(parsedUrl, document);
        } catch {
          return { siteType: 'unknown' as SiteType, confidence: 0 };
        }
      })
      .sort((a, b) => b.confidence - a.confidence);

    const topResult = results[0];
    const siteType =
      topResult && topResult.confidence >= 0.5
        ? topResult.siteType
        : this.detectGenericType();

    const context = this.buildContext(siteType);

    // Cache the result
    this.cachedContext = context;
    this.cachedUrl = currentUrl;

    return context;
  }

  /**
   * Clear the cache (call when URL changes in SPAs).
   */
  clearCache(): void {
    this.cachedContext = null;
    this.cachedUrl = '';
  }

  // ============================================
  // Private Helpers
  // ============================================

  private detectGenericType(): SiteType {
    const url = window.location.href;
    const domain = getDomain(url);

    // News sites
    const newsDomains = ['bbc.com', 'cnn.com', 'reuters.com', 'theguardian.com', 'nytimes.com'];
    if (newsDomains.some((d) => domain.includes(d))) return 'news';

    // Social media
    const socialDomains = ['twitter.com', 'x.com', 'facebook.com', 'reddit.com', 'linkedin.com'];
    if (socialDomains.some((d) => domain.includes(d))) return 'social-media';

    // E-commerce
    const ecommerceDomains = ['amazon.com', 'ebay.com', 'shopify.com', 'etsy.com'];
    if (ecommerceDomains.some((d) => domain.includes(d))) return 'ecommerce';

    // Check for article-like structure
    const hasArticle = !!document.querySelector('article');
    const hasMain = !!document.querySelector('main');
    const wordCount = getWordCount(document.body.innerText);

    if ((hasArticle || hasMain) && wordCount > 300) return 'article';

    return 'unknown';
  }

  private buildContext(siteType: SiteType): PageContextSummary {
    const bodyText = document.body.innerText || '';
    const wordCount = getWordCount(bodyText);
    const hasCode = qsa('code, pre').length > 0;
    const hasVideo =
      qsa('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length > 0;
    const language =
      document.documentElement.lang
        ? document.documentElement.lang.split('-')[0]
        : 'en';
    const detectedTopics = this.detectTopics(bodyText);

    return {
      siteType,
      url: window.location.href,
      title: document.title,
      domain: getDomain(window.location.href),
      isReadingMode: this.detectReadingMode(),
      hasCode,
      hasVideo,
      estimatedReadTime: Math.ceil(wordCount / 225),
      wordCount,
      language,
      detectedTopics,
    };
  }

  private buildDefaultContext(siteType: SiteType): PageContextSummary {
    return {
      siteType,
      url: window.location.href,
      title: document.title,
      domain: getDomain(window.location.href),
      isReadingMode: false,
      hasCode: false,
      hasVideo: false,
      estimatedReadTime: 0,
      wordCount: 0,
      language: 'en',
      detectedTopics: [],
    };
  }

  private detectReadingMode(): boolean {
    // Check for reader mode indicators
    return (
      !!document.querySelector('article') &&
      !document.querySelector('nav.main-nav, header.site-header') &&
      document.querySelectorAll('aside, .sidebar').length === 0
    );
  }

  private detectTopics(text: string): string[] {
    const topics: string[] = [];
    const lowerText = text.toLowerCase();

    const topicKeywords: Record<string, string[]> = {
      'Machine Learning': ['machine learning', 'neural network', 'deep learning', 'ai model'],
      'Web Development': ['html', 'css', 'javascript', 'react', 'vue', 'angular'],
      'Data Science': ['data science', 'pandas', 'numpy', 'matplotlib', 'dataset'],
      Mathematics: ['theorem', 'equation', 'calculus', 'algebra', 'statistics'],
      Biology: ['dna', 'cell', 'organism', 'protein', 'gene', 'evolution'],
      Physics: ['quantum', 'relativity', 'thermodynamics', 'mechanics', 'wave'],
      History: ['century', 'civilization', 'empire', 'revolution', 'ancient'],
      Programming: ['function', 'variable', 'algorithm', 'class', 'object'],
    };

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      const matchCount = keywords.filter((kw) => lowerText.includes(kw)).length;
      if (matchCount >= 2) {
        topics.push(topic);
      }
    });

    return topics.slice(0, 3); // Max 3 detected topics
  }
}