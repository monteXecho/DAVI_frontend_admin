import { useKeycloak } from '@react-keycloak/web';
import { useCallback, useState } from 'react';
import { apiClient, createAuthHeaders } from './apiClient';
import { useWorkspace } from '@/context/WorkspaceContext';


export function useApi() {
  const { keycloak } = useKeycloak();
  const { selectedOwnerId } = useWorkspace();   // NEW
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

  const authHeaders = (token, extraHeaders = {}) =>
    createAuthHeaders(token, {
      ...(selectedOwnerId ? { 'X-Acting-Owner-Id': selectedOwnerId } : {}),
      ...extraHeaders,
    });


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
          .post('/ask/run', {question}, authHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const uploadDocumentForRole = useCallback(
    (folderPath, formData) =>
      withAuth((token) =>
        apiClient
          .post(
            `/company-admin/roles/upload/${folderPath}`,
            formData,
            authHeaders(token, {
              'Content-Type': 'multipart/form-data',
            })
          )
          .then((res) => ({ success: true, message: 'File uploaded successfully' }))
          .catch((err) => {
            console.error('[useApi] Upload failed:', err);

            const status = err.response?.status;
            const detail = err.response?.data?.detail;

            if (status === 409) {
              return { success: false, message: detail || 'That file already exists!' };
            }

            if (status === 404) {
              return { success: false, message: 'Target folder not found' };
            }

            return { success: false, message: 'Upload failed. Please try again.' };
          })
      ),
    [withAuth]
  );

  const deleteDocuments = useCallback(
    (documentsToDelete) =>
      withAuth((token) =>
        apiClient
          .post(`/company-admin/documents/delete`, { documents: documentsToDelete }, authHeaders(token))
          .then((res) => ({ success: true, data: res.data }))
          .catch((err) => {
            console.error('[useApi] Delete documents failed:', err);
            return { success: false };
          })
      ),
    [withAuth]
  );

  const deletePrivateDocuments = useCallback(
    (documentsToDelete) =>
      withAuth((token) =>
        apiClient
          .post(`/company-admin/documents/delete/private`, { documents: documentsToDelete }, authHeaders(token))
          .then((res) => ({ success: true, data: res.data }))
          .catch((err) => {
            console.error('[useApi] Delete documents failed:', err);
            return { success: false };
          })
      ),
    [withAuth]
  );

  const uploadDocument = useCallback(
    (formData, uploadType) =>
      withAuth((token) =>
        apiClient
          .post(`/upload/${uploadType}`, formData, authHeaders(token, {
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
          .get('/super-admin/companies', authHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const createCompany = useCallback(
    (company) =>
      withAuth((token) =>
        apiClient
          .post('/super-admin/companies', company, authHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const deleteCompany = useCallback(
    (companyId) =>
      withAuth((token) =>
        apiClient
          .delete(`/super-admin/companies/${companyId}`, authHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  // --- Company Admins ---
  const getCompanyAdmins = useCallback(
    (companyId) =>
      withAuth((token) =>
        apiClient
          .get(`/super-admin/companies/${companyId}/admins`, authHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const addCompanyAdmin = useCallback(
    (companyId, name, email, modules) =>
      withAuth((token) =>
        apiClient
          .post(`/super-admin/companies/${companyId}/admins`, { name, email, modules }, authHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const reassignCompanyAdmin = useCallback(
    (companyId, adminId, name, email) =>
      withAuth((token) =>
        apiClient
          .patch(`/super-admin/companies/${companyId}/admins/${adminId}`, {name, email}, authHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );  

  const assignModules = useCallback(
    (companyId, adminId, modules) =>
      withAuth((token) =>
        apiClient
          .post(`/super-admin/companies/${companyId}/admins/${adminId}/modules`, modules, authHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );  

  const deleteCompanyAdmin = useCallback(
    (companyId, adminId) =>
      withAuth((token) =>
        apiClient
          .delete(`/super-admin/companies/${companyId}/admins/${adminId}`, authHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const register = useCallback(async (user) => {
    try {
      const payload = {
        fullName: user.fullName,
        email: user.email,
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

  const getAdminDocuments = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/documents', authHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const getPrivateDocuments = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/documents/private', authHeaders(token))
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
            authHeaders(token, {
              'Content-Type': 'multipart/form-data',
            })
          )
          .then((res) => ({ success: true, data: res.data }))
          .catch((err) => {
            console.error('[useApi] Upload users file failed:', err);
            const detail = err.response?.data?.detail;
            return { 
              success: false, 
              message: detail || 'Failed to upload users file. Please try again.' 
            };
          })
      ),
    [withAuth]
  );

  const sendResetPassword = useCallback(
    (email) =>
      withAuth((token) =>
        apiClient
          .post(`/company-admin/users/reset-password`, { email }, authHeaders(token))
          .then((res) => ({ success: true}))
          .catch((err) => {
            console.error('[useApi] Reset password request sending failed:', err);
            const status = err.response?.status;
            if(status === 404)
              return { success: false, message: 'User not registered!' }
            const detail = err.response?.data?.detail;
            return { 
              success: false, 
              message: detail || 'Failed to send password reset request. Please try again.' 
            };
          })
      ),
    [withAuth]
  );

  // -------- company users -------------
  const getUsers = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/users', authHeaders(token))
          .then((res) => {
            console.log(' --- USERS --- :', res.data)
            return res.data
          })
      ),
    [withAuth]
  );

  const addUser = useCallback(
    (email, company_role, assigned_role) =>
      withAuth((token) => { 
        console.log('Adding user with:', email, company_role, assigned_role)
        return apiClient
          .post('/company-admin/users', { email, company_role, assigned_role }, authHeaders(token))
          .then((res) => res.data)
      }
      ),
    [withAuth]
  );  

  const assignTeamlidPermissions = useCallback(
    (email, team_permissions) =>
      withAuth((token) => {
        console.log('Assigning team member permissions:', email, team_permissions)
        return apiClient
          .post('/company-admin/users/teamlid', { email, team_permissions }, authHeaders(token))
          .then((res) => res.data)
      }
      ),
    [withAuth]
  );

  const getUser = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/user', authHeaders(token))
          .then((res) => {
            console.log(' --- USER --- :', res.data)
            return res.data})
      ),
    [withAuth]
  );

  const updateUser = useCallback(
    (payload) =>
      withAuth((token) =>
        apiClient
          .put(`/company-admin/users/${payload.id}`, payload, authHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );
  
  const deleteUsers = useCallback(
    (user_ids) =>
      withAuth((token) =>
        apiClient
          .delete(`/company-admin/users?user_ids=${user_ids.join(',')}`, authHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const deleteRoleFromUsers = useCallback(
    (user_ids, role_name) =>
      withAuth((token) =>
        apiClient
          .post('/company-admin/users/role/delete', {user_ids, role_name}, authHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const addRoleToUsers = useCallback(
    (user_ids, role_name) =>
      withAuth((token) =>
        apiClient
          .post('/company-admin/users/role/add', {user_ids, role_name}, authHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const getCompanyStats = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get(`/company-admin/stats`, authHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const getRoles = useCallback(
      () =>
        withAuth((token) =>
          apiClient
            .get(`/company-admin/roles`, authHeaders(token))
            .then((res) => res.data)
        ),
      [withAuth]
    );

  const addOrUpdateRole = useCallback(
    (role_name, folders, modules, action) =>
      withAuth((token) => {
        return apiClient
          .post(`/company-admin/roles`, { role_name, folders, modules, action }, authHeaders(token))
          .then((res) => {
            console.log(' -- RESULT --- :', res.data)
            return res.data
          }
        )
      }
      ),
    [withAuth]
  );

  const deleteRoles = useCallback(
    (role_names) =>
      withAuth((token) => {
        console.log('Sending role_names:', role_names); 
        apiClient
          .post(`/company-admin/roles/delete`, 
            { role_names }, 
            authHeaders(token)
          )
          .then((res) => res.data)
          .catch((err) => {
            console.error('[useApi] Delete roles failed:', err.response?.data || err);
            throw err;
          })
      }),
    [withAuth]
  );

  const addFolders = useCallback(
    (folders) =>
      withAuth((token) => {
        console.log('Sending folder_names:', folders);
        return apiClient
          .post("/company-admin/folders", 
            { folder_names: folders }, 
            authHeaders(token)
          )
          .then((res) => {
            console.log('Add folders response:', res.data);
            return res.data;
          })
          .catch((err) => {
            console.error('[useApi] Add folders failed:', err.response?.data || err);
            
            const error = new Error(err.response?.data?.message || 'Failed to add folders');
            error.response = err.response;
            throw error;
          })
      }),
    [withAuth]
  );

  const getFolders = useCallback(
    () =>
      withAuth((token) => {
        return apiClient
          .get("/company-admin/folders", 
            authHeaders(token)
          )
          .then((res) => {
            console.log('Get folders response:', res.data);
            return res.data;
          })
          .catch((err) => {
            console.error('[useApi] Get folders failed:', err.response?.data || err);
            
            const error = new Error(err.response?.data?.message || 'Failed to get folders');
            error.response = err.response;
            throw error;
          })
      }),
    [withAuth]
  );

  const deleteFolders = useCallback(
    (payload) =>
      withAuth((token) => {
        console.log('Sending role_name,and folder_names:', payload.role_names,payload.folder_names);
        apiClient
          .post(`/company-admin/folders/delete`, 
            { role_names:payload.role_names, folder_names:payload.folder_names }, 
            authHeaders(token)
          )
          .then((res) => {
            console.log('Delete folders response:', res.data);
            return res.data;
          })
          .catch((err) => {
            console.error('[useApi] Delete folders failed:', err.response?.data || err);
            throw err;
          })
      }),
    [withAuth]
  );

  const assignRole = useCallback(
    (user_id, role_name) =>
      withAuth((token) =>
        apiClient
          .post(`/company-admin/roles/assign`, { user_id, role_name }, authHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  return {
    askQuestion,
    uploadDocument,
    uploadDocumentForRole,
    deleteDocuments,
    deletePrivateDocuments,

    getCompanies,
    createCompany,
    deleteCompany,

    getCompanyAdmins,
    addCompanyAdmin,
    reassignCompanyAdmin,
    deleteCompanyAdmin,
    getAdminDocuments,
    getPrivateDocuments,
    sendResetPassword,

    getUsers,
    getUser,
    addUser,
    assignTeamlidPermissions,
    addRoleToUsers,
    updateUser,
    deleteUsers,
    deleteRoleFromUsers,
    uploadUsersFile,

    getCompanyStats,

    getRoles,
    addOrUpdateRole,
    deleteRoles,
    addFolders,
    getFolders,
    deleteFolders,
    assignRole,

    assignModules,

    register,

    loading,
    error

  };
}
