/**
 * Statistics API
 * Handles all statistics-related operations
 */
import { useCallback } from 'react';
import { useApiCore } from './useApiCore';

export function useStats() {
  const { withAuth, apiClient, createAuthHeaders } = useApiCore();

  const getCompanyStats = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/stats', createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const getSuperAdminStats = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get(`/super-admin/stats`, createAuthHeaders(token))
          .then((res) => res.data)
          .catch((err) => {
            // Silently handle 404 errors - endpoint doesn't exist yet
            // This is expected and the caller will fall back to calculating from companies
            if (err.response?.status === 404) {
              // Return a rejected promise with a special flag so caller knows to skip
              const silentError = new Error('Stats endpoint not available');
              silentError.is404 = true;
              silentError.silent = true; // Flag to indicate this should be silent
              return Promise.reject(silentError);
            }
            throw err;
          })
      ),
    [withAuth]
  );

  const getSuperAdminRolesCount = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get(`/super-admin/roles/count`, createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const getSuperAdminPublicChatsCount = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get(`/super-admin/public-chats/count`, createAuthHeaders(token))
          .then((res) => res.data)
          .catch((err) => {
            // Silently handle 404 errors - endpoint doesn't exist yet
            if (err.response?.status === 404) {
              return {};
            }
            throw err;
          })
      ),
    [withAuth]
  );

  const getCompanyDashboardActiveUsersCount = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/dashboard/active-users-count', createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const getCompanyDashboardActiveUsers = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/dashboard/active-users', createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const getCompanyDashboardDocumentsInUseCount = useCallback(
    (params = {}) =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/dashboard/documents-in-use-count', {
            ...createAuthHeaders(token),
            params,
          })
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const getCompanyDashboardDocumentsInUse = useCallback(
    (params = {}) =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/dashboard/documents-in-use', {
            ...createAuthHeaders(token),
            params,
          })
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const getCompanyDashboardDocumentAnswerUsageHistory = useCallback(
    (documentId, params = {}) =>
      withAuth((token) =>
        apiClient
          .get(
            `/company-admin/dashboard/documents-in-use/${encodeURIComponent(documentId)}/answer-usage-history`,
            {
              ...createAuthHeaders(token),
              params,
            }
          )
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const getCompanyDashboardDocumentChatQuestionsCount = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/dashboard/document-chat-questions-count', createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const getCompanyDashboardDocumentChatQuestions = useCallback(
    (params = {}) =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/dashboard/document-chat-questions', {
            ...createAuthHeaders(token),
            params,
          })
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const getCompanyDashboardDocumentChatUnansweredCount = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/dashboard/document-chat-unanswered-count', createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const getCompanyDashboardDocumentChatUnanswered = useCallback(
    (params = {}) =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/dashboard/document-chat-unanswered', {
            ...createAuthHeaders(token),
            params,
          })
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const getCompanyDashboardTopFaqPreview = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/dashboard/top-faq-preview', createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const getCompanyDashboardTopFaq = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/dashboard/top-faq', createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const getCompanyDashboardDocumentsOlderThan2yCount = useCallback(
    (params = {}) =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/dashboard/documents-older-than-2y-count', {
            ...createAuthHeaders(token),
            params,
          })
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const getCompanyDashboardDocumentsOlderThan2y = useCallback(
    (params = {}) =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/dashboard/documents-older-than-2y', {
            ...createAuthHeaders(token),
            params,
          })
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const getCompanyDashboardUserActivity = useCallback(
    (params = {}) =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/dashboard/user-activity', {
            ...createAuthHeaders(token),
            params,
          })
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const getCompanyDashboardDocumentChanges = useCallback(
    (params = {}) =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/dashboard/document-changes', {
            ...createAuthHeaders(token),
            params,
          })
          .then((res) => res.data)
      ),
    [withAuth]
  );

  const getCompanyDashboardDocumentChangesCount = useCallback(
    (params = {}) =>
      withAuth((token) =>
        apiClient
          .get('/company-admin/dashboard/document-changes-count', {
            ...createAuthHeaders(token),
            params,
          })
          .then((res) => res.data)
      ),
    [withAuth]
  );

  return {
    getCompanyStats,
    getSuperAdminStats,
    getSuperAdminRolesCount,
    getSuperAdminPublicChatsCount,
    getCompanyDashboardActiveUsersCount,
    getCompanyDashboardActiveUsers,
    getCompanyDashboardDocumentsInUseCount,
    getCompanyDashboardDocumentsInUse,
    getCompanyDashboardDocumentAnswerUsageHistory,
    getCompanyDashboardDocumentChatQuestionsCount,
    getCompanyDashboardDocumentChatQuestions,
    getCompanyDashboardDocumentChatUnansweredCount,
    getCompanyDashboardDocumentChatUnanswered,
    getCompanyDashboardTopFaqPreview,
    getCompanyDashboardTopFaq,
    getCompanyDashboardDocumentsOlderThan2yCount,
    getCompanyDashboardDocumentsOlderThan2y,
    getCompanyDashboardUserActivity,
    getCompanyDashboardDocumentChanges,
    getCompanyDashboardDocumentChangesCount,
  };
}

