/**
 * Document Chat / AI API
 * Handles document chat and AI-related operations
 */
import { useCallback } from 'react';
import { useApiCore } from './useApiCore';

export function useDocumentChat() {
  const { withAuth, apiClient, createAuthHeaders } = useApiCore();

  const askQuestion = useCallback(
    (question) =>
      withAuth((token) =>
        apiClient
          .post('/ask/run', { question }, createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  return {
    askQuestion,
  };
}

