/**
 * usePageContent Hook
 * Extracts and returns the current page's content.
 */

import { useState, useCallback } from 'react';
import { sendToBackground } from '../../shared/utils/messaging';
import type { PageContentResponse } from '../../shared/types/messages';

interface UsePageContentReturn {
  content: PageContentResponse | null;
  isLoading: boolean;
  error: string | null;
  extractContent: () => Promise<void>;
}

export function usePageContent(): UsePageContentReturn {
  const [content, setContent] = useState<PageContentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await sendToBackground<undefined, PageContentResponse>('GET_PAGE_CONTENT');
      if (response.success && response.data) {
        setContent(response.data);
      } else {
        setError(response.error ?? 'Failed to extract content');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { content, isLoading, error, extractContent };
}