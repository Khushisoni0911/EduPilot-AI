/**
 * useExtensionMessage Hook
 * Generic hook for sending messages to background from React components.
 */

import { useState, useCallback } from 'react';
import { sendToBackground } from '../../shared/utils/messaging';
import type { MessageType } from '../../shared/types/types';

interface UseExtensionMessageReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  send: (payload?: unknown) => Promise<T | null>;
}

export function useExtensionMessage<T = unknown>(
  messageType: MessageType
): UseExtensionMessageReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (payload?: unknown): Promise<T | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await sendToBackground<unknown, T>(messageType, payload);
        if (response.success && response.data !== undefined) {
          setData(response.data);
          return response.data;
        } else {
          setError(response.error ?? 'Unknown error');
          return null;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [messageType]
  );

  return { data, isLoading, error, send };
}