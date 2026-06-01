import axios from 'axios';

/**
 * Build auth headers for company-admin APIs.
 *
 * `omitWorkspaceHeaders` — Set on /userswitch (or similar) so a stale organisation / acting-owner
 * in localStorage does not break probing calls (avoid 403 "geen account in gekozen organisatie").
 */
export const createAuthHeaders = (
  token,
  extraHeaders = {},
  options = {}
) => {
  const omitWorkspaceHeaders = Boolean(options.omitWorkspaceHeaders);

  let actingOwnerId = null;
  let isGuest = false;
  let selectedCompanyId = null;

  if (!omitWorkspaceHeaders && typeof window !== 'undefined') {
    try {
      actingOwnerId = window.localStorage.getItem('daviActingOwnerId');
      const isGuestStr = window.localStorage.getItem('daviActingOwnerIsGuest');
      isGuest = isGuestStr === 'true';
      selectedCompanyId = window.localStorage.getItem('daviSelectedCompanyId');
    } catch (e) {
      // ignore
    }
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    ...extraHeaders,
  };

  if (!omitWorkspaceHeaders && selectedCompanyId && String(selectedCompanyId).trim()) {
    headers['X-Selected-Company-Id'] = String(selectedCompanyId).trim();
  }

  if (!omitWorkspaceHeaders && actingOwnerId) {
    headers['X-Acting-Owner-Id'] = actingOwnerId;
  }

  if (!omitWorkspaceHeaders && isGuest) {
    headers['X-Acting-Owner-Is-Guest'] = 'true';
  }

  return { headers };
};

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
});

// Add response interceptor to suppress console errors for expected 403/404 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // For 404 errors, mark them as silent to prevent console logging
    if (error.response?.status === 404) {
      error.silent = true;
    }
    // For 403 errors, also mark as silent
    if (error.response?.status === 403) {
      error.silent = true;
    }
    // The error will still be thrown and can be caught by the calling code
    return Promise.reject(error);
  }
);
