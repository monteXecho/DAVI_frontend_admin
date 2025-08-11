import axios from 'axios';

export const createAuthHeaders = (token, extraHeaders = {}) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    ...extraHeaders,
  },
});

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
});
