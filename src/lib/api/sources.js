/**
 * Sources (Bronnen) Management API
 * Handles all source-related operations (URL and HTML sources)
 */
import { useCallback } from 'react';
import { useApiCore } from './useApiCore';

export function useSources() {
  const { withAuth, apiClient, createAuthHeaders } = useApiCore();

  const getSources = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/sources', createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const addUrlSource = useCallback(
    (url) =>
      withAuth((token) => {
        const formData = new FormData();
        formData.append('url', url);
        
        return apiClient
          .post('/company-admin/sources/url', formData, createAuthHeaders(token, { 'Content-Type': 'multipart/form-data' }))
          .then((res) => res.data)
          .catch((err) => {
            console.error('[useApi] Add URL source failed:', err.response?.data || err);
            throw err;
          });
      }),
    [withAuth]
  );

  const uploadHtmlSource = useCallback(
    (file) =>
      withAuth((token) => {
        const formData = new FormData();
        formData.append('file', file);
        
        return apiClient
          .post('/company-admin/sources/html', formData, createAuthHeaders(token, { 'Content-Type': 'multipart/form-data' }))
          .then((res) => res.data)
          .catch((err) => {
            console.error('[useApi] Upload HTML source failed:', err.response?.data || err);
            throw err;
          });
      }),
    [withAuth]
  );

  const updateSource = useCallback(
    (sourceId, status) =>
      withAuth((token) => {
        const formData = new FormData();
        if (status) {
          formData.append('status', status);
        }
        
        return apiClient
          .put(`/company-admin/sources/${sourceId}`, formData, createAuthHeaders(token, { 'Content-Type': 'multipart/form-data' }))
          .then((res) => res.data)
          .catch((err) => {
            console.error('[useApi] Update source failed:', err.response?.data || err);
            throw err;
          });
      }),
    [withAuth]
  );

  const deleteSource = useCallback(
    (sourceId) =>
      withAuth((token) =>
        apiClient
          .delete(`/company-admin/sources/${sourceId}`, createAuthHeaders(token))
          .then((res) => res.data)
          .catch((err) => {
            console.error('[useApi] Delete source failed:', err.response?.data || err);
            throw err;
          })
      ),
    [withAuth]
  );

  const syncSources = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .post('/company-admin/sources/sync', {}, createAuthHeaders(token))
          .then((res) => res.data)
          .catch((err) => {
            console.error('[useApi] Sync sources failed:', err.response?.data || err);
            throw err;
          })
      ),
    [withAuth]
  );

  return {
    getSources,
    addUrlSource,
    uploadHtmlSource,
    updateSource,
    deleteSource,
    syncSources,
  };
}
