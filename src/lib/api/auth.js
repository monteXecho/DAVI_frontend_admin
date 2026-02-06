/**
 * Authentication API
 * Handles authentication-related operations (registration, etc.)
 */
import { useCallback } from 'react';
import { useApiCore } from './useApiCore';

export function useAuth() {
  const { apiClient } = useApiCore();

  // Registration doesn't require authentication - user is creating an account
  const register = useCallback(
    (payload) =>
      apiClient
        .post('/auth/register', payload)
        .then((res) => res.data)
        .catch((err) => {
          // Re-throw with better error handling
          throw err;
        }),
    [apiClient]
  );

  return {
    register,
  };
}

