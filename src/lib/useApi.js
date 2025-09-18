import { useKeycloak } from '@react-keycloak/web';
import { useCallback, useState } from 'react';
import { apiClient, createAuthHeaders } from './apiClient';

export function useApi() {
  const { keycloak } = useKeycloak();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getToken = useCallback(async () => {
    if (!keycloak?.authenticated) {
      throw new Error('User is not authenticated');
    }
    const token = await keycloak.token;
    if (!token) {
      throw new Error('Unable to retrieve Keycloak token');
    }
    return token;
  }, [keycloak]);

  const withAuth = useCallback(
    async (callback) => {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        return await callback(token);
      } catch (err) {
        console.error('[useApi] Auth error:', err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  const askQuestion = useCallback(
    (question, model = 'granite-3.2-8b-instruct@q8_0') =>
      withAuth((token) =>
        apiClient
          .post('/ask', { question, model }, createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const uploadDocument = useCallback(
    (formData, uploadType) =>
      withAuth((token) =>
        apiClient
          .post(`/upload/${uploadType}`, formData, createAuthHeaders(token, {
            'Content-Type': 'multipart/form-data',
          }))
          .then((res) => ({ success: true, data: res.data }))
          .catch((err) => {
            console.error('[useApi] Upload failed:', err);
            return { success: false };
          })
      ),
    [withAuth]
  );

  // --- Companies ---
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
    (company) =>
      withAuth((token) =>
        apiClient
          .post('/super-admin/companies', company, createAuthHeaders(token))
          .then((res) => res.data)
      ),
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

  // --- Company Admins ---
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
    (companyId, name, email, modules) =>
      withAuth((token) =>
        apiClient
          .post(`/super-admin/companies/${companyId}/admins`, { name, email, modules }, createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const assignModules = useCallback(
    (companyId, adminId, modules) =>
      withAuth((token) =>
        apiClient
          .post(`/super-admin/companies/${companyId}/admins/${adminId}/modules`, modules, createAuthHeaders(token))
          .then((res) => res.data)
      ),
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

  return {
    askQuestion,
    uploadDocument,

    getCompanies,
    createCompany,
    deleteCompany,

    getCompanyAdmins,
    addCompanyAdmin,
    deleteCompanyAdmin,

    assignModules,

    loading,
    error,
  };
}
