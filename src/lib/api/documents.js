/**
 * Document Management API
 * Handles all document-related operations (upload, download, delete, etc.)
 */
import { useCallback } from 'react';
import { useApiCore } from './useApiCore';

export function useDocuments() {
  const { withAuth, apiClient, createAuthHeaders } = useApiCore();

  const uploadDocument = useCallback(
    (formData, uploadType = 'document') =>
      withAuth((token) => {
        // Add upload_type as a query parameter or form field
        const url = `/company-admin/documents/upload?upload_type=${uploadType}`;
        return apiClient
          .post(url, formData, createAuthHeaders(token, { 'Content-Type': 'multipart/form-data' }))
          .then((res) => ({ success: true, data: res.data, message: 'File uploaded successfully' }))
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
          });
      }),
    [withAuth]
  );

  const uploadDocumentForRole = useCallback(
    (folderPath, formData) =>
      withAuth((token) => {
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
          });
      }),
    [withAuth]
  );

  const deleteDocuments = useCallback(
    (documentsToDelete) =>
      withAuth((token) =>
        apiClient
          .post('/company-admin/documents/delete', { documents: documentsToDelete }, createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const deletePrivateDocuments = useCallback(
    (documentsToDelete) =>
      withAuth((token) =>
        apiClient
          .post('/company-admin/documents/delete-private', { documents: documentsToDelete }, createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const getAdminDocuments = useCallback(
    (adminId = null) =>
      withAuth((token) => {
        // If adminId is provided, use super-admin endpoint
        // Otherwise, use company-admin endpoint for current admin
        const endpoint = adminId 
          ? `/super-admin/companies/admins/${adminId}/documents`
          : `/company-admin/documents`;
        return apiClient
          .get(endpoint, createAuthHeaders(token))
          .then((res) => res.data);
      }),
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
    (filePath, fileName) =>
      withAuth(async (token) => {
        const encodedPath = encodeURIComponent(filePath);
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

        // Check file extension to determine viewer type
        const fileExt = fileName?.split('.').pop()?.toLowerCase() || filePath.split('.').pop()?.toLowerCase();

        // For Word documents, use the viewer endpoint
        if (fileExt === 'docx' || fileExt === 'doc') {
          return {
            filePath,
            fileName: fileName || filePath.split('/').pop(),
            viewerType: 'word',
          };
        }
        // For other file types, download normally
        else {
          const url = `${baseUrl}/company-admin/documents/download?file_path=${encodedPath}`;

          try {
            const response = await fetch(url, {
              headers: {
                Authorization: `Bearer ${token}`,
                ...(typeof window !== 'undefined' && window.localStorage.getItem('daviActingOwnerId')
                  ? { 'X-Acting-Owner-Id': window.localStorage.getItem('daviActingOwnerId') }
                  : {}),
                ...(typeof window !== 'undefined' && window.localStorage.getItem('daviActingOwnerIsGuest') === 'true'
                  ? { 'X-Acting-Owner-Is-Guest': 'true' }
                  : {}),
              },
            });

            if (!response.ok) {
              throw new Error(`Failed to download document: ${response.statusText}`);
            }

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName || filePath.split('/').pop();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
          } catch (err) {
            console.error('Failed to download document:', err);
            throw err;
          }
        }
      }),
    [withAuth]
  );

  const getDocumentViewUrl = useCallback(
    (filePath, fileName) =>
      withAuth(async (token) => {
        const encodedPath = encodeURIComponent(filePath);
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        return `${baseUrl}/company-admin/documents/view?file_path=${encodedPath}`;
      }),
    [withAuth]
  );

  return {
    uploadDocument,
    uploadDocumentForRole,
    deleteDocuments,
    deletePrivateDocuments,
    getAdminDocuments,
    getPrivateDocuments,
    getAllUserDocuments,
    downloadDocument,
    getDocumentViewUrl,
  };
}

