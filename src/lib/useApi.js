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
    (question) =>
      withAuth((token) =>
        apiClient
          .post('/ask.run', {question}, createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const uploadDocumentForRole = useCallback(
    (roleName, folderPath, formData ) =>
      withAuth((token) =>
        apiClient
          .post(`/company-admin/roles/upload/${roleName}/${folderPath}`, formData, createAuthHeaders(token, {
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

  const register = useCallback(async (user) => {
    try {
      const payload = {
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        password: user.password,
      };
      
      const { data } = await apiClient.post('/auth/register', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      return { ok: true, data };
    } catch (err) {
      console.error('Register error:', err);
      return {
        ok: false,
        data:
          err.response?.data ||
          { detail: 'Registration failed. Please try again.' },
      };
    }
  }, []);

  // -------- company users -------------
  const getUsers = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/users', createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const addUser = useCallback(
    (email, company_role) =>
      withAuth((token) =>
        apiClient
          .post('/company-admin/users', { email, company_role }, createAuthHeaders(token))
          .then((res) => res.data)
      ),
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

  const deleteUser = useCallback(
    (userId) =>
      withAuth((token) =>
        apiClient
          .delete(`/company-admin/users/${userId}`, createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const getCompanyStats = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get(`/company-admin/stats`, createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const getRoles = useCallback(
      () =>
        withAuth((token) =>
          apiClient
            .get(`/company-admin/roles`, createAuthHeaders(token))
            .then((res) => res.data)
        ),
      [withAuth]
    );

  const addOrUpdateRole = useCallback(
    (role_name, folders) =>
      withAuth((token) =>
        apiClient
          .post(`/company-admin/roles`, { role_name, folders }, createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const deleteRole = useCallback(
    (role_name) =>
      withAuth((token) =>
        apiClient
          .delete(`/company-admin/roles/${role_name}`, createAuthHeaders(token))
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
    askQuestion,
    uploadDocument,
    uploadDocumentForRole,

    getCompanies,
    createCompany,
    deleteCompany,

    getCompanyAdmins,
    addCompanyAdmin,
    deleteCompanyAdmin,

    getUsers,
    addUser,
    updateUser,
    deleteUser,

    getCompanyStats,

    getRoles,
    addOrUpdateRole,
    deleteRole,
    assignRole,

    assignModules,

    register,

    loading,
    error

  };
}
