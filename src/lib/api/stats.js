/**
 * Statistics API
 * Handles all statistics-related operations
 */
import { useCallback } from 'react';
import { useApiCore } from './useApiCore';

export function useStats() {
  const { withAuth, apiClient, createAuthHeaders } = useApiCore();

  const getCompanyStats = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/stats', createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const getSuperAdminStats = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get(`/super-admin/stats`, createAuthHeaders(token))
          .then((res) => res.data)
          .catch((err) => {
            // Silently handle 404 errors - endpoint doesn't exist yet
            // This is expected and the caller will fall back to calculating from companies
            if (err.response?.status === 404) {
              // Return a rejected promise with a special flag so caller knows to skip
              const silentError = new Error('Stats endpoint not available');
              silentError.is404 = true;
              silentError.silent = true; // Flag to indicate this should be silent
              return Promise.reject(silentError);
            }
            throw err;
          })
      ),
    [withAuth]
  );

  const getSuperAdminRolesCount = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get(`/super-admin/roles/count`, createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  return {
    getCompanyStats,
    getSuperAdminStats,
    getSuperAdminRolesCount,
  };
}

