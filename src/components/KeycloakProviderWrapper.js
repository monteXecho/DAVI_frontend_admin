'use client';

import { ReactKeycloakProvider } from '@react-keycloak/web';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import keycloak from '@/lib/keycloak';

/**
 * Anonymous end-user chat URLs only (`/publicChat/...`).
 * Case-sensitive on purpose: admin UI lives under `/public-chat-admin` (lowercase differs).
 */
function isPublicChatPath(pathname) {
  if (!pathname || typeof pathname !== 'string') return false;
  const pathPart = pathname.split('?')[0];
  return /^\/publicChat(\/|$)/.test(pathPart);
}

/**
 * Chat-only hostname (from server layout): never mount Keycloak — avoids SSO when pathname is still `/`
 * during hydration / PWA cold open before redirect to `/publicChat`.
 */
export default function KeycloakProviderWrapper({
  children,
  suppressKeycloak = false,
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (suppressKeycloak || isPublicChatPath(pathname ?? '')) {
      return undefined;
    }
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
  }, [pathname, suppressKeycloak]);

  if (suppressKeycloak) {
    return <>{children}</>;
  }

  if (isPublicChatPath(pathname ?? '')) {
    return <>{children}</>;
  }

  const isPublicRoute =
    pathname?.includes('/register') ||
    pathname?.includes('/userswitch');

  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{
        onLoad: 'check-sso',
        checkLoginIframe: false,
        pkceMethod: 'S256',
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
        if (
          event === 'onAuthLogout' ||
          (event === 'onReady' && !keycloak.authenticated)
        ) {
          try {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
          } catch (e) {
            /* ignore */
          }
        }
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
