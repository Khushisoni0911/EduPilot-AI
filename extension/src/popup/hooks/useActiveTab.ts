/**
 * useActiveTab Hook
 * Gets info about the currently active browser tab.
 */

import { useState, useEffect } from 'react';
import { sendToBackground } from '../../shared/utils/messaging';
import type { TabInfo } from '../../shared/types/types';

interface UseActiveTabReturn {
  tabInfo: TabInfo | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useActiveTab(): UseActiveTabReturn {
  const [tabInfo, setTabInfo] = useState<TabInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTabInfo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await sendToBackground<undefined, TabInfo>('GET_ACTIVE_TAB_INFO');
      if (response.success && response.data) {
        setTabInfo(response.data);
      } else {
        setError(response.error ?? 'Failed to get tab info');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTabInfo();
  }, []);

  return { tabInfo, isLoading, error, refresh: fetchTabInfo };
}