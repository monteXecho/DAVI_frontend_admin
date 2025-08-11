'use client';

import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from '@/lib/keycloak';

export default function KeycloakProviderWrapper({ children }) {
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
