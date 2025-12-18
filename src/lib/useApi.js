import { useKeycloak } from '@react-keycloak/web';
import { useCallback, useState, useRef } from 'react';
import { apiClient, createAuthHeaders } from './apiClient';

// Global flag to prevent multiple simultaneous token refresh attempts
let isRefreshing = false;
let refreshPromise = null;

export function useApi() {
  const { keycloak } = useKeycloak();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getToken = useCallback(async () => {
    if (!keycloak?.authenticated) {
      throw new Error('User is not authenticated');
    }
    
    try {
      // Check if token is still valid before attempting refresh
      const tokenParsed = keycloak.tokenParsed;
      const currentTime = Math.floor(Date.now() / 1000);
      
      // If token is expired or about to expire (within 30 seconds), try to refresh
      if (tokenParsed?.exp && tokenParsed.exp <= currentTime + 30) {
        // Check if refresh token is available
        if (!keycloak.refreshToken) {
          console.warn('[useApi] No refresh token available, user needs to re-authenticate');
          // Force re-login if no refresh token
          keycloak.login();
          throw new Error('Session expired. Please log in again.');
        }
        
        // Prevent multiple simultaneous refresh attempts
        if (isRefreshing && refreshPromise) {
          // Wait for the ongoing refresh to complete
          try {
            await refreshPromise;
          } catch (refreshErr) {
            // If the ongoing refresh failed, we'll try again below
            isRefreshing = false;
            refreshPromise = null;
          }
        }
        
        // If not already refreshing, start a new refresh
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = keycloak.updateToken(30).catch((refreshError) => {
            console.error('[useApi] Token refresh failed:', refreshError);
            isRefreshing = false;
            refreshPromise = null;
            
            // If refresh fails due to invalid grant or missing refresh token, force re-login
            if (refreshError?.error === 'invalid_grant' || 
                refreshError?.message?.includes('refresh token') ||
                !keycloak.refreshToken) {
              keycloak.login();
              throw new Error('Session expired. Please log in again.');
            }
            throw refreshError;
          }).then(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
          
          await refreshPromise;
        }
      }
      
      const token = await keycloak.token;
      if (!token) {
        throw new Error('Unable to retrieve Keycloak token');
      }
      return token;
    } catch (err) {
      // If it's already our custom error, re-throw it
      if (err.message && (err.message.includes('Session expired') || err.message.includes('not authenticated'))) {
        throw err;
      }
      // Handle Keycloak token errors
      if (err.error === 'invalid_grant' || err.message?.includes('refresh token')) {
        console.error('[useApi] Refresh token issue, forcing re-login');
        keycloak.login();
        throw new Error('Session expired. Please log in again.');
      }
      throw err;
    }
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
          .post('/ask/run', {question}, createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const uploadDocumentForRole = useCallback(
    (folderPath, formData) =>
      withAuth((token) => {
        // URL encode the folder path to handle special characters
        const encodedFolderPath = encodeURIComponent(folderPath);
        return apiClient
          .post(
            `/company-admin/roles/upload/${encodedFolderPath}`,
            formData,
            createAuthHeaders(token, {
              'Content-Type': 'multipart/form-data',
            })
          )
          .then((res) => ({ success: true, message: 'File uploaded successfully' }))
          .catch((err) => {
            const status = err.response?.status;
            const detail = err.response?.data?.detail;

            if (status === 409) {
              return { success: false, message: detail || 'That file already exists!' };
            }

            if (status === 404) {
              return { success: false, message: detail || 'Target folder not found' };
            }

            if (status === 500) {
              return { success: false, message: detail || 'Server error during upload. Please try again.' };
            }

            return { success: false, message: detail || 'Upload failed. Please try again.' };
          })
      }),
    [withAuth]
  );

  const deleteDocuments = useCallback(
    (documentsToDelete) =>
      withAuth((token) =>
        apiClient
          .post(`/company-admin/documents/delete`, { documents: documentsToDelete }, createAuthHeaders(token))
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
          .post(`/company-admin/documents/delete/private`, { documents: documentsToDelete }, createAuthHeaders(token))
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
          .post(`/upload/${uploadType}`, formData, createAuthHeaders(token, {
            'Content-Type': 'multipart/form-data',
          }))
          .then((res) => ({ success: true, data: res.data }))
          .catch((err) => {
            console.error('[useApi] Upload failed:', err);

            const status = err.response?.status;
            const detail = err.response?.data?.detail;

            if (status === 409) {
              return { success: false, message: detail || 'Dit document bestaat al!' };
            }

            return { success: false, message: detail || 'Upload mislukt. Probeer het opnieuw.' };
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

  const reassignCompanyAdmin = useCallback(
    (companyId, adminId, name, email) =>
      withAuth((token) =>
        apiClient
          .patch(`/super-admin/companies/${companyId}/admins/${adminId}`, {name, email}, createAuthHeaders(token))
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
          .get('/company-admin/documents', createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const getPrivateDocuments = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/documents/private', createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const getAllUserDocuments = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/documents/all', createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const downloadDocument = useCallback(
    (filePath) =>
      withAuth(async (token) => {
        const encodedPath = encodeURIComponent(filePath);
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/company-admin/documents/download?file_path=${encodedPath}`;
        
        // Open in new tab with authentication
        // Since we can't pass headers via window.open, we'll fetch and create a blob URL
        try {
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`,
              ...(typeof window !== 'undefined' && window.localStorage.getItem('daviActingOwnerId') 
                ? { 'X-Acting-Owner-Id': window.localStorage.getItem('daviActingOwnerId') }
                : {}),
              ...(typeof window !== 'undefined' && window.localStorage.getItem('daviActingOwnerIsGuest') === 'true'
                ? { 'X-Acting-Owner-Is-Guest': 'true' }
                : {})
            }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to download document: ${response.statusText}`);
          }
          
          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
          
          // Clean up the blob URL after a delay
          setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
        } catch (err) {
          console.error('Failed to download document:', err);
          throw err;
        }
      }),
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
          .post(`/company-admin/users/reset-password`, { email }, createAuthHeaders(token))
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
          .get('/company-admin/users', createAuthHeaders(token))
          .then((res) => {
            console.log(' --- USERS --- :', res.data)
            return res.data
          })
      ),
    [withAuth]
  );

  const getGuestWorkspaces = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          // Do NOT forward acting owner here; we need full list, not scoped
          .get('/company-admin/guest-workspaces', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const addUser = useCallback(
    (email, company_role, assigned_role) =>
      withAuth((token) => { 
        console.log('Adding user with:', email, company_role, assigned_role)
        return apiClient
          .post('/company-admin/users', { email, company_role, assigned_role }, createAuthHeaders(token))
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
          .post('/company-admin/users/teamlid', { email, team_permissions }, createAuthHeaders(token))
          .then((res) => res.data)
      }
      ),
    [withAuth]
  );

  const getUser = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/user', createAuthHeaders(token))
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
          .post('/company-admin/users/role/delete', {user_ids, role_name}, createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const addRoleToUsers = useCallback(
    (user_ids, role_name) =>
      withAuth((token) =>
        apiClient
          .post('/company-admin/users/role/add', {user_ids, role_name}, createAuthHeaders(token))
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
    (role_name, folders, modules, action) =>
      withAuth((token) => {
        return apiClient
          .post(`/company-admin/roles`, { role_name, folders, modules, action }, createAuthHeaders(token))
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
            createAuthHeaders(token)
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
            createAuthHeaders(token)
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
            createAuthHeaders(token)
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
        return apiClient
          .post(`/company-admin/folders/delete`, 
            { role_names:payload.role_names, folder_names:payload.folder_names }, 
            createAuthHeaders(token)
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
          .post(`/company-admin/roles/assign`, { user_id, role_name }, createAuthHeaders(token))
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
    getAllUserDocuments,
    downloadDocument,
    sendResetPassword,

    getUsers,
    getUser,
    getGuestWorkspaces,
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
