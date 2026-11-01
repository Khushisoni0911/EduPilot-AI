import type { SiteDetector, DetectorResult } from '../ContextDetector';

export class YouTubeDetector implements SiteDetector {
  detect(url: URL): DetectorResult {
    const isYouTube =
      url.hostname === 'www.youtube.com' || url.hostname === 'youtube.com';

    if (!isYouTube) return { siteType: 'youtube', confidence: 0 };

    // Check if it's a video page specifically
    const isVideoPage = url.pathname === '/watch' && !!url.searchParams.get('v');

    return {
      siteType: 'youtube',
      confidence: isYouTube ? (isVideoPage ? 1.0 : 0.7) : 0,
      metadata: {
        videoId: url.searchParams.get('v'),
        isVideoPage,
      },
    };
  }
}