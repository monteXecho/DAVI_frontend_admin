import { useCallback } from "react";
import { useApiCore } from "./useApiCore";

export function usePublicChat() {
  const { withAuth, apiClient, createAuthHeaders } = useApiCore();

  const getPublicChats = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get("/company-admin/public-chats", createAuthHeaders(token))
          .then((res) => res.data)
          .catch((err) => {
            console.error("[useApi] Get public chats failed:", err.response?.data || err);
            throw err;
          })
      ),
    [withAuth, apiClient, createAuthHeaders]
  );

  const createPublicChat = useCallback(
    (data) =>
      withAuth((token) =>
        apiClient
          .post("/company-admin/public-chats", data, createAuthHeaders(token))
          .then((res) => res.data)
          .catch((err) => {
            console.error("[useApi] Create public chat failed:", err.response?.data || err);
            throw err;
          })
      ),
    [withAuth, apiClient, createAuthHeaders]
  );

  const updatePublicChat = useCallback(
    (chatId, data) =>
      withAuth((token) =>
        apiClient
          .put(`/company-admin/public-chats/${chatId}`, data, createAuthHeaders(token))
          .then((res) => res.data)
          .catch((err) => {
            console.error("[useApi] Update public chat failed:", err.response?.data || err);
            throw err;
          })
      ),
    [withAuth, apiClient, createAuthHeaders]
  );

  const deletePublicChat = useCallback(
    (chatId) =>
      withAuth((token) =>
        apiClient
          .delete(`/company-admin/public-chats/${chatId}`, createAuthHeaders(token))
          .then((res) => res.data)
          .catch((err) => {
            console.error("[useApi] Delete public chat failed:", err.response?.data || err);
            throw err;
          })
      ),
    [withAuth, apiClient, createAuthHeaders]
  );

  const getPublicChat = useCallback(
    (chatId) =>
      withAuth((token) =>
        apiClient
          .get(`/company-admin/public-chats/${chatId}`, createAuthHeaders(token))
          .then((res) => res.data)
          .catch((err) => {
            console.error("[useApi] Get public chat failed:", err.response?.data || err);
            throw err;
          })
      ),
    [withAuth, apiClient, createAuthHeaders]
  );

  const addUrlSource = useCallback(
    (chatId, url) =>
      withAuth((token) => {
        const formData = new FormData();
        formData.append("url", url);
        
        return apiClient
          .post(
            `/company-admin/public-chats/${chatId}/sources/url`,
            formData,
            createAuthHeaders(token, { "Content-Type": "multipart/form-data" })
          )
          .then((res) => res.data)
          .catch((err) => {
            console.error("[useApi] Add URL source failed:", err.response?.data || err);
            throw err;
          });
      }),
    [withAuth, apiClient, createAuthHeaders]
  );

  const addHtmlSource = useCallback(
    (chatId, file) =>
      withAuth((token) => {
        const formData = new FormData();
        formData.append("file", file);
        
        return apiClient
          .post(
            `/company-admin/public-chats/${chatId}/sources/html`,
            formData,
            createAuthHeaders(token, { "Content-Type": "multipart/form-data" })
          )
          .then((res) => res.data)
          .catch((err) => {
            console.error("[useApi] Add HTML source failed:", err.response?.data || err);
            throw err;
          });
      }),
    [withAuth, apiClient, createAuthHeaders]
  );

  const addFileSource = useCallback(
    (chatId, file) =>
      withAuth((token) => {
        const formData = new FormData();
        formData.append("file", file);
        
        return apiClient
          .post(
            `/company-admin/public-chats/${chatId}/sources/file`,
            formData,
            createAuthHeaders(token, { "Content-Type": "multipart/form-data" })
          )
          .then((res) => res.data)
          .catch((err) => {
            console.error("[useApi] Add file source failed:", err.response?.data || err);
            throw err;
          });
      }),
    [withAuth, apiClient, createAuthHeaders]
  );

  const getChatSources = useCallback(
    (chatId) =>
      withAuth((token) =>
        apiClient
          .get(`/company-admin/public-chats/${chatId}/sources`, createAuthHeaders(token))
          .then((res) => res.data)
          .catch((err) => {
            console.error("[useApi] Get chat sources failed:", err.response?.data || err);
            throw err;
          })
      ),
    [withAuth, apiClient, createAuthHeaders]
  );

  const syncChatSources = useCallback(
    (chatId) =>
      withAuth((token) =>
        apiClient
          .post(
            `/company-admin/public-chats/${chatId}/sources/sync`,
            {},
            createAuthHeaders(token)
          )
          .then((res) => res.data)
          .catch((err) => {
            console.error("[useApi] Sync chat sources failed:", err.response?.data || err);
            throw err;
          })
      ),
    [withAuth, apiClient, createAuthHeaders]
  );

  const getPublicChatUrlSyncSchedule = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .get(
            "/company-admin/public-chats/sources/sync-schedule",
            createAuthHeaders(token)
          )
          .then((res) => res.data)
          .catch((err) => {
            console.error("[useApi] Get public chat sync schedule failed:", err.response?.data || err);
            throw err;
          })
      ),
    [withAuth, apiClient, createAuthHeaders]
  );

  const syncAllChatSources = useCallback(
    () =>
      withAuth((token) =>
        apiClient
          .post(
            "/company-admin/public-chats/sources/sync-all",
            {},
            createAuthHeaders(token)
          )
          .then((res) => res.data)
          .catch((err) => {
            console.error("[useApi] Sync all chat sources failed:", err.response?.data || err);
            throw err;
          })
      ),
    [withAuth, apiClient, createAuthHeaders]
  );

  const deleteChatSource = useCallback(
    (chatId, sourceId) =>
      withAuth((token) =>
        apiClient
          .delete(
            `/company-admin/public-chats/${chatId}/sources/${sourceId}`,
            createAuthHeaders(token)
          )
          .then((res) => res.data)
          .catch((err) => {
            console.error("[useApi] Delete chat source failed:", err.response?.data || err);
            throw err;
          })
      ),
    [withAuth, apiClient, createAuthHeaders]
  );

  return {
    getPublicChats,
    createPublicChat,
    updatePublicChat,
    deletePublicChat,
    getPublicChat,
    addUrlSource,
    addHtmlSource,
    addFileSource,
    getChatSources,
    syncChatSources,
    syncAllChatSources,
    getPublicChatUrlSyncSchedule,
    deleteChatSource,
  };
}

