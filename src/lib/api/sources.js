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

  const downloadSource = useCallback(
    (filePath, fileName) =>
      withAuth(async (token) => {
        const encodedPath = encodeURIComponent(filePath);
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const url = `${baseUrl}/company-admin/sources/download?file_path=${encodedPath}`;

        try {
          const response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${token}`,
              ...(typeof window !== 'undefined' && window.localStorage.getItem('daviActingOwnerId')
                ? { 'X-Acting-Owner-Id': window.localStorage.getItem('daviActingOwnerId') }
                : {}),
              ...(typeof window !== 'undefined' && window.localStorage.getItem('daviActingOwnerIsGuest') === 'true'
                ? { 'X-Acting-Owner-Is-Guest': 'true' }
                : {}),
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to download source: ${response.statusText}`);
          }

          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          const newWindow = window.open(blobUrl, '_blank');
          if (newWindow) {
            // Clean up blob URL after a delay
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
          }
        } catch (err) {
          console.error('Failed to download source:', err);
          throw err;
        }
      }),
    [withAuth]
  );

  return {
    getSources,
    addUrlSource,
    uploadHtmlSource,
    updateSource,
    deleteSource,
    syncSources,
    downloadSource,
  };
}
