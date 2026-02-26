'use client';

import { ReactKeycloakProvider } from '@react-keycloak/web';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import keycloak from '@/lib/keycloak';

export default function KeycloakProviderWrapper({ children }) {
  const pathname = usePathname();
  
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

  // Check if we're on a public route that doesn't require authentication
  const isPublicRoute = pathname?.includes('/publicChat') || pathname?.includes('/publicchat') || pathname?.includes('/register');

  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{ 
        onLoad: isPublicRoute ? 'check-sso' : 'check-sso',
        checkLoginIframe: false, 
        pkceMethod: 'S256' 
      }}
      onTokens={(tokens) => { 
        if (tokens.token) {
          localStorage.setItem('token', tokens.token);
        }
        if (tokens.refreshToken) {
          localStorage.setItem('refreshToken', tokens.refreshToken);
        }
      }}
      onEvent={(event, error) => {
        // Don't force login for public routes
        if (isPublicRoute) {
          return;
        }
        
        if (event === 'onAuthError' || event === 'onTokenExpired') {
          console.warn('[KeycloakProvider] Auth error:', event, error);
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
