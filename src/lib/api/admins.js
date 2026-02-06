/**
 * Company Admin Management API
 * Handles all company admin-related operations
 */
import { useCallback } from 'react';
import { useApiCore } from './useApiCore';

export function useAdmins() {
  const { withAuth, apiClient, createAuthHeaders } = useApiCore();

  const getCompanyAdmins = useCallback(
    (companyId) =>
      withAuth((token) =>
        apiClient
          .get(`/super-admin/companies/${companyId}/admins`, createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const addCompanyAdmin = useCallback(
    (companyId, name, email, modules = []) =>
      withAuth((token) => {
        // Support both old signature (name, email, modules) and new signature (payload)
        let payload;
        if (typeof name === 'object' && name !== null && name.email) {
          // New signature: (companyId, payload) where payload has name, email, modules
          payload = name;
        } else {
          // Old signature: (companyId, name, email, modules)
          // Convert modules array to ModuleConfig format
          const moduleConfigs = Array.isArray(modules) 
            ? modules.map(m => {
                if (typeof m === 'string') {
                  return { name: m, enabled: true };
                } else if (typeof m === 'object' && m.name) {
                  return { name: m.name, enabled: m.enabled !== false };
                }
                return m;
              })
            : [];
          payload = {
            name,
            email,
            modules: moduleConfigs
          };
        }
        return apiClient
          .post(`/super-admin/companies/${companyId}/admins`, payload, createAuthHeaders(token))
          .then((res) => res.data);
      }),
    [withAuth]
  );

  const reassignCompanyAdmin = useCallback(
    (companyId, adminId, name, email) =>
      withAuth((token) => {
        // Support both old signature (name, email) and new signature (payload)
        let payload;
        if (typeof name === 'object' && name !== null) {
          // New signature: (companyId, adminId, payload)
          payload = name;
        } else {
          // Old signature: (companyId, adminId, name, email)
          payload = { name, email };
        }
        return apiClient
          .patch(`/super-admin/companies/${companyId}/admins/${adminId}`, payload, createAuthHeaders(token))
          .then((res) => res.data);
      }),
    [withAuth]
  );

  const deleteCompanyAdmin = useCallback(
    (companyId, adminId) =>
      withAuth((token) =>
        apiClient
          .delete(`/super-admin/companies/${companyId}/admins/${adminId}`, createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const assignModules = useCallback(
    (companyId, adminId, modules) =>
      withAuth((token) => {
        // Support both old signature ({modules}) and new signature (modules array)
        let payload;
        if (modules && typeof modules === 'object' && !Array.isArray(modules) && modules.modules) {
          // Old signature: {modules: [...]}
          payload = modules;
        } else {
          // New signature: modules array directly
          payload = { modules: Array.isArray(modules) ? modules : [modules] };
        }
        return apiClient
          .post(`/super-admin/companies/${companyId}/admins/${adminId}/modules`, payload, createAuthHeaders(token))
          .then((res) => res.data);
      }),
    [withAuth]
  );

  return {
    getCompanyAdmins,
    addCompanyAdmin,
    reassignCompanyAdmin,
    deleteCompanyAdmin,
    assignModules,
  };
}

