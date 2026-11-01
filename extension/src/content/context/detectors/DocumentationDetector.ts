import type { SiteDetector, DetectorResult } from '../ContextDetector';

const DOCS_DOMAINS = [
  'docs.google.com',
  'developer.mozilla.org',
  'docs.microsoft.com',
  'learn.microsoft.com',
  'reactjs.org',
  'vuejs.org',
  'docs.python.org',
  'npmjs.com',
  'readthedocs.io',
  'gitbook.io',
];

export class DocumentationDetector implements SiteDetector {
  detect(url: URL, doc: Document): DetectorResult {
    const domain = url.hostname.replace(/^www\./, '');

    // Check known docs domains
    if (DOCS_DOMAINS.some((d) => domain.includes(d))) {
      return { siteType: 'documentation', confidence: 0.95 };
    }

    // Check URL patterns (e.g., /docs/, /api/, /reference/)
    const docsPathPatterns = ['/docs/', '/api/', '/reference/', '/guide/', '/manual/'];
    const hasDocsPath = docsPathPatterns.some((p) => url.pathname.includes(p));
    if (hasDocsPath) {
      return { siteType: 'documentation', confidence: 0.75 };
    }

    // Check DOM signals
    const hasSidebar = !!(
      doc.querySelector('nav.sidebar, aside.toc, [class*="sidebar"]')
    );
    const hasHeadings =
      doc.querySelectorAll('h1, h2, h3').length > 5;

    if (hasSidebar && hasHeadings) {
      return { siteType: 'documentation', confidence: 0.5 };
    }

    return { siteType: 'documentation', confidence: 0 };
  }
}