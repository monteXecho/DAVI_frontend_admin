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
      initOptions={{ onLoad: 'check-sso'}}
      onTokens={(tokens) => { localStorage.setItem('token', tokens.token || ''); }}
    >
      {children}
    </ReactKeycloakProvider>
  );
}
