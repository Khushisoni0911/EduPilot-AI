import type { SiteDetector, DetectorResult } from '../ContextDetector';

export class ArticleDetector implements SiteDetector {
  detect(_url: URL, doc: Document): DetectorResult {
    let confidence = 0;

    // Strong signals
    if (doc.querySelector('article')) confidence += 0.4;
    if (doc.querySelector('main')) confidence += 0.2;

    // Meta tags (publishers add these)
    const ogType = doc.querySelector('meta[property="og:type"]');
    if (ogType?.getAttribute('content') === 'article') confidence += 0.3;

    // Structural signals
    const wordCount = (doc.body.innerText || '').split(/\s+/).length;
    if (wordCount > 500) confidence += 0.15;
    if (wordCount > 1000) confidence += 0.1;

    // Author / date signals
    if (
      doc.querySelector(
        '[rel="author"], .author, [itemprop="author"], time[datetime]'
      )
    )
      confidence += 0.15;

    return {
      siteType: 'article',
      confidence: Math.min(confidence, 1.0),
    };
  }
}