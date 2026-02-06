/**
 * Role Management API
 * Handles all role-related operations
 */
import { useCallback } from 'react';
import { useApiCore } from './useApiCore';

export function useRoles() {
  const { withAuth, apiClient, createAuthHeaders } = useApiCore();

  const getRoles = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/roles', createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const addOrUpdateRole = useCallback(
    (role_name, folders, modules, action) =>
      withAuth((token) =>
        apiClient
          .post('/company-admin/roles', { role_name, folders, modules, action }, createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const deleteRoles = useCallback(
    (role_names) =>
      withAuth((token) =>
        apiClient
          .post('/company-admin/roles/delete', { role_names }, createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const assignRole = useCallback(
    (user_id, role_name) =>
      withAuth((token) =>
        apiClient
          .post(`/company-admin/roles/assign`, { user_id, role_name }, createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  return {
    getRoles,
    addOrUpdateRole,
    deleteRoles,
    assignRole,
  };
}

