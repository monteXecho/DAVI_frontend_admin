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
