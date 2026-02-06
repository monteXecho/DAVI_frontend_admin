/**
 * WebChat API
 * Handles WebChat query operations
 */
import { useCallback } from 'react';
import { useApiCore } from './useApiCore';

export function useWebChat() {
  const { withAuth, apiClient, createAuthHeaders } = useApiCore();

  const askQuestion = useCallback(
    (question) =>
      withAuth((token) =>
        apiClient
          .post('/webchat/ask', { question }, createAuthHeaders(token))
          .then((res) => res.data)
          .catch((err) => {
            console.error('[useApi] WebChat ask failed:', err.response?.data || err);
            throw err;
          })
      ),
    [withAuth]
  );

  return {
    askQuestion,
  };
}

