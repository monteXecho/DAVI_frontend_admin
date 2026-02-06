/**
 * Company Management API
 * Handles all company-related operations
 */
import { useCallback } from 'react';
import { useApiCore } from './useApiCore';

export function useCompanies() {
  const { withAuth, apiClient, createAuthHeaders } = useApiCore();

  const getCompanies = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get('/super-admin/companies', createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const createCompany = useCallback(
    (name, limits = null, modules = null) =>
      withAuth((token) => {
        const payload = { name };
        if (limits) {
          payload.limits = limits;
        }
        if (modules) {
          payload.modules = modules;
        }
        return apiClient
          .post('/super-admin/companies', payload, createAuthHeaders(token))
          .then((res) => res.data);
      }),
    [withAuth]
  );

  const deleteCompany = useCallback(
    (companyId) =>
      withAuth((token) =>
        apiClient
          .delete(`/super-admin/companies/${companyId}`, createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const updateCompanyLimits = useCallback(
    (companyId, limits) =>
      withAuth((token) => {
        const params = new URLSearchParams();
        if (limits.max_users !== undefined && limits.max_users !== null) {
          params.append('max_users', String(limits.max_users));
        }
        if (limits.max_admins !== undefined && limits.max_admins !== null) {
          params.append('max_admins', String(limits.max_admins));
        }
        if (limits.max_documents !== undefined && limits.max_documents !== null) {
          params.append('max_documents', String(limits.max_documents));
        }
        if (limits.max_roles !== undefined && limits.max_roles !== null) {
          params.append('max_roles', String(limits.max_roles));
        }
        const url = `/super-admin/companies/${companyId}/limits?${params.toString()}`;
        console.log('Updating company limits:', url, limits);
        return apiClient
          .put(url, null, createAuthHeaders(token))
          .then((res) => {
            console.log('Update response:', res.data);
            return res.data;
          })
          .catch((err) => {
            console.error('Update error:', err.response?.data || err.message);
            throw err;
          });
      }),
    [withAuth]
  );

  const updateCompanyModules = useCallback(
    (companyId, payload) =>
      withAuth((token) => {
        console.log('Updating company modules:', companyId, payload);
        return apiClient
          .put(`/super-admin/companies/${companyId}/modules`, payload, createAuthHeaders(token))
          .then((res) => {
            console.log('Update modules response:', res.data);
            return res.data;
          })
          .catch((err) => {
            console.error('Update modules error:', err.response?.data || err.message);
            throw err;
          });
      }),
    [withAuth]
  );

  return {
    getCompanies,
    createCompany,
    deleteCompany,
    updateCompanyLimits,
    updateCompanyModules,
  };
}

