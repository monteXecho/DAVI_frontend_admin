/**
 * Core API hook - handles authentication and token management
 * This is the foundation that all domain-specific API hooks build upon
 */
import { useKeycloak } from '@react-keycloak/web';
import { useCallback, useState } from 'react';
import { apiClient, createAuthHeaders } from '../apiClient';

let isRefreshing = false;
let refreshPromise = null;

export function useApiCore() {
  const { keycloak } = useKeycloak();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getToken = useCallback(async () => {
    if (!keycloak?.authenticated) {
      throw new Error('User is not authenticated');
    }
    
    try {
      const tokenParsed = keycloak.tokenParsed;
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (tokenParsed?.exp && tokenParsed.exp <= currentTime + 30) {
        if (!keycloak.refreshToken) {
          console.warn('[useApi] No refresh token available, user needs to re-authenticate');
          keycloak.login();
          throw new Error('Session expired. Please log in again.');
        }
        
        if (isRefreshing && refreshPromise) {
          try {
            await refreshPromise;
          } catch (refreshErr) {
            isRefreshing = false;
            refreshPromise = null;
          }
        }
        
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = keycloak.updateToken(30).catch((refreshError) => {
            console.error('[useApi] Token refresh failed:', refreshError);
            isRefreshing = false;
            refreshPromise = null;
            
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
      if (err.message && (err.message.includes('Session expired') || err.message.includes('not authenticated'))) {
        throw err;
      }
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
        // Don't log 403/404 errors or silent errors as they're often expected
        // (e.g., super admin accessing company-admin endpoints, or stats endpoint not existing)
        // Only log unexpected errors
        if (!err.silent && err.response?.status !== 403 && err.response?.status !== 404) {
          console.error('[useApi] Auth error:', err);
        }
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  return {
    withAuth,
    apiClient,
    createAuthHeaders,
    loading,
    error,
  };
}

