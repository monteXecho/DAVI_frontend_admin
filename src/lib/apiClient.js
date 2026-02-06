import axios from 'axios';

export const createAuthHeaders = (token, extraHeaders = {}) => {
  let actingOwnerId = null;
  let isGuest = false;

  if (typeof window !== 'undefined') {
    try {
      actingOwnerId = window.localStorage.getItem('daviActingOwnerId');
      const isGuestStr = window.localStorage.getItem('daviActingOwnerIsGuest');
      isGuest = isGuestStr === 'true';
    } catch (e) {
      // ignore
    }
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    ...extraHeaders,
  };

  if (actingOwnerId) {
    headers['X-Acting-Owner-Id'] = actingOwnerId;
  }
  
  if (isGuest) {
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
