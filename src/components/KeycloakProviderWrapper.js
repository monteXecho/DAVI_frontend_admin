'use client';

import { ReactKeycloakProvider } from '@react-keycloak/web';
import { useEffect } from 'react';
import keycloak from '@/lib/keycloak';

export default function KeycloakProviderWrapper({ children }) {
  useEffect(() => {
    const handleAuthError = (event) => {
      console.log('Global auth error detected:', event.detail);
      if (keycloak.authenticated) {
        keycloak.logout({ redirectUri: window.location.origin });
      }
    };

    window.addEventListener('authError', handleAuthError);
    
    return () => {
      window.removeEventListener('authError', handleAuthError);
    };
  });

  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{ 
        onLoad: 'check-sso',
        checkLoginIframe: false, // Disable iframe check to avoid refresh token issues
        pkceMethod: 'S256' // Use PKCE for better security
      }}
      onTokens={(tokens) => { 
        if (tokens.token) {
          localStorage.setItem('token', tokens.token);
        }
        // Store refresh token if available
        if (tokens.refreshToken) {
          localStorage.setItem('refreshToken', tokens.refreshToken);
        }
      }}
      onEvent={(event, error) => {
        if (event === 'onAuthError' || event === 'onTokenExpired') {
          console.warn('[KeycloakProvider] Auth error:', event, error);
          // Don't auto-logout on token refresh errors, let the app handle it
          if (error?.error !== 'invalid_grant') {
            keycloak.login();
          }
        }
      }}
    >
      {children}
    </ReactKeycloakProvider>
  );
}
