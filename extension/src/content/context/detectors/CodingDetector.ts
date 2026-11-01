import type { SiteDetector, DetectorResult } from '../ContextDetector';

const CODING_DOMAINS = [
  'github.com',
  'gitlab.com',
  'stackoverflow.com',
  'leetcode.com',
  'hackerrank.com',
  'codepen.io',
  'codesandbox.io',
  'replit.com',
  'geeksforgeeks.org',
  'dev.to',
];

export class CodingDetector implements SiteDetector {
  detect(url: URL, doc: Document): DetectorResult {
    const domain = url.hostname.replace(/^www\./, '');

    // Check domain
    const isDomainMatch = CODING_DOMAINS.some((d) => domain.includes(d));
    if (isDomainMatch) {
      return { siteType: 'coding-platform', confidence: 0.95 };
    }

    // Check for code content signals
    const codeBlocks = doc.querySelectorAll('pre code, .highlight, .code-block').length;
    const hasMonospace = !!doc.querySelector('[class*="syntax"], [class*="prism"]');

    if (codeBlocks > 3 || hasMonospace) {
      return { siteType: 'coding-platform', confidence: 0.6 };
    }

    return { siteType: 'coding-platform', confidence: 0 };
  }
}