/**
 * User Management API
 * Handles all user-related operations
 */
import { useCallback } from 'react';
import { useApiCore } from './useApiCore';

export function useUsers() {
  const { withAuth, apiClient, createAuthHeaders } = useApiCore();

  const getUsers = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/users', createAuthHeaders(token))
          .then((res) => {
            console.log(' --- USERS --- :', res.data);
            return res.data;
          })
      ),
    [withAuth]
  );

  const getGuestWorkspaces = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/guest-workspaces', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const getUser = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/user', createAuthHeaders(token))
          .then((res) => {
            console.log(' --- USER --- :', res.data);
            return res.data;
          })
      ),
    [withAuth]
  );

  const addUser = useCallback(
    (email, company_role, assigned_role) =>
      withAuth((token) => {
        console.log('Adding user with:', email, company_role, assigned_role);
        return apiClient
          .post('/company-admin/users', { email, company_role, assigned_role }, createAuthHeaders(token))
          .then((res) => res.data);
      }),
    [withAuth]
  );

  const assignTeamlidPermissions = useCallback(
    (email, team_permissions) =>
      withAuth((token) => {
        console.log('Assigning team member permissions:', email, team_permissions);
        return apiClient
          .post('/company-admin/users/teamlid', { email, team_permissions }, createAuthHeaders(token))
          .then((res) => res.data);
      }),
    [withAuth]
  );

  const updateUser = useCallback(
    (payload) =>
      withAuth((token) =>
        apiClient
          .put(`/company-admin/users/${payload.id}`, payload, createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const deleteUsers = useCallback(
    (user_ids) =>
      withAuth((token) =>
        apiClient
          .delete(`/company-admin/users?user_ids=${user_ids.join(',')}`, createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const deleteRoleFromUsers = useCallback(
    (user_ids, role_name) =>
      withAuth((token) =>
        apiClient
          .post('/company-admin/users/role/delete', { user_ids, role_name }, createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const addRoleToUsers = useCallback(
    (user_ids, role_name) =>
      withAuth((token) =>
        apiClient
          .post('/company-admin/users/role/add', { user_ids, role_name }, createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const uploadUsersFile = useCallback(
    (formData) =>
      withAuth((token) =>
        apiClient
          .post(
            `/company-admin/users/upload`,
            formData,
            createAuthHeaders(token, {
              'Content-Type': 'multipart/form-data',
            })
          )
          .then((res) => ({ success: true, data: res.data }))
          .catch((err) => {
            console.error('[useApi] Upload users file failed:', err);
            const detail = err.response?.data?.detail;
            return {
              success: false,
              message: detail || 'Failed to upload users file. Please try again.',
            };
          })
      ),
    [withAuth]
  );

  const sendResetPassword = useCallback(
    (email) =>
      withAuth((token) =>
        apiClient
          .post(`/company-admin/users/reset-password`, { email }, createAuthHeaders(token))
          .then((res) => ({ success: true }))
          .catch((err) => {
            console.error('[useApi] Reset password request sending failed:', err);
            const status = err.response?.status;
            if (status === 404) return { success: false, message: 'User not registered!' };
            const detail = err.response?.data?.detail;
            return {
              success: false,
              message: detail || 'Failed to send password reset request. Please try again.',
            };
          })
      ),
    [withAuth]
  );

  return {
    getUsers,
    getUser,
    getGuestWorkspaces,
    addUser,
    assignTeamlidPermissions,
    updateUser,
    deleteUsers,
    deleteRoleFromUsers,
    addRoleToUsers,
    uploadUsersFile,
    sendResetPassword,
  };
}

