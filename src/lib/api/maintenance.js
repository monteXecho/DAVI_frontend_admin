/**
 * Maintenance (Construction Page) API
 * Super admin only: activate/deactivate construction page for all users
 */
import { useCallback } from 'react';
import { useApiCore } from './useApiCore';

export function useMaintenanceApi() {
  const { withAuth, apiClient, createAuthHeaders } = useApiCore();

  const getMaintenanceStatus = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get('/super-admin/maintenance-status', createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const activateMaintenance = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .post('/super-admin/maintenance/activate', {}, createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const deactivateMaintenance = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .post('/super-admin/maintenance/deactivate', {}, createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  return {
    getMaintenanceStatus,
    activateMaintenance,
    deactivateMaintenance,
  };
}
