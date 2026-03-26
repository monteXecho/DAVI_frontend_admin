/**
 * Folder Management API
 * Handles all folder-related operations
 */
import { useCallback } from 'react';
import { useApiCore } from './useApiCore';

export function useFolders() {
  const { withAuth, apiClient, createAuthHeaders } = useApiCore();

  const getFolders = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/folders', createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const addFolders = useCallback(
    (payload) =>
      withAuth((token) => {
        // Handle both array (legacy) and object formats
        const requestPayload = Array.isArray(payload) 
          ? { folder_names: payload }
          : payload.folder_names 
            ? payload 
            : { folder_names: payload };
        
        console.log('Sending folder_names:', requestPayload.folder_names);
        return apiClient
          .post(`/company-admin/folders`, requestPayload, createAuthHeaders(token))
          .then((res) => {
            console.log('Add folders response:', res.data);
            return res.data;
          })
          .catch((err) => {
            console.error('[useApi] Add folders failed:', err.response?.data || err);
            throw err;
          });
      }),
    [withAuth]
  );

  const deleteFolders = useCallback(
    (payload) =>
      withAuth((token) => {
        console.log('Sending role_name and folder_names:', payload.role_names, payload.folder_names);
        return apiClient
          .post(`/company-admin/folders/delete`, payload, createAuthHeaders(token))
          .then((res) => {
            console.log('Delete folders response:', res.data);
            return res.data;
          })
          .catch((err) => {
            console.error('[useApi] Delete folders failed:', err.response?.data || err);
            throw err;
          });
      }),
    [withAuth]
  );

  const listImportableFolders = useCallback(
    (importRoot = null) =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/folders/import/list', {
            params: importRoot ? { import_root: importRoot } : {},
            ...createAuthHeaders(token),
          })
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const importFolders = useCallback(
    (payload) =>
      withAuth((token) => {
        // Handle both array (legacy) and object formats
        const requestPayload = Array.isArray(payload) 
          ? { folder_paths: payload }
          : payload.folder_paths 
            ? payload 
            : { folder_paths: payload };
        
        return apiClient
          .post('/company-admin/folders/import', requestPayload, createAuthHeaders(token))
          .then((res) => res.data)
          .catch((err) => {
            console.error('[useApi] Import folders failed:', err.response?.data || err);
            throw err;
          });
      }),
    [withAuth]
  );

  const syncFoldersFromNextcloud = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .post('/company-admin/folders/sync-nextcloud', {}, createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const getNextcloudSyncSchedule = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/folders/nextcloud-sync-schedule', createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  return {
    getFolders,
    addFolders,
    deleteFolders,
    listImportableFolders,
    importFolders,
    syncFoldersFromNextcloud,
    getNextcloudSyncSchedule,
  };
}

