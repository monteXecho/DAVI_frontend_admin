import axios from 'axios';

export const createAuthHeaders = (token, extraHeaders = {}) => {
  let actingOwnerId = null;

  if (typeof window !== 'undefined') {
    try {
      actingOwnerId = window.localStorage.getItem('daviActingOwnerId');
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

  return { headers };
};

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
});
