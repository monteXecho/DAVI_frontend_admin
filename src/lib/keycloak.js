import Keycloak from 'keycloak-js';

import { hostnameIsChatPublicHost } from '@/lib/chatPublicHost';

const keycloak = new Keycloak({
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
  // Enable token refresh
  enableLogging: process.env.NODE_ENV === 'development',
});

function isPublicChatHostname() {
  return (
    typeof window !== 'undefined' &&
    hostnameIsChatPublicHost(window.location.hostname)
  );
}

const originalInit = keycloak.init.bind(keycloak);
keycloak.init = function patchedInit(initOptions) {
  if (isPublicChatHostname()) {
    return Promise.resolve(false);
  }
  return originalInit(initOptions);
};

const originalLogin = keycloak.login.bind(keycloak);
keycloak.login = function patchedLogin(...args) {
  if (isPublicChatHostname()) {
    console.warn('[Keycloak] login skipped on public chat hostname');
    return Promise.resolve(undefined);
  }
  return originalLogin(...args);
};

const originalCreateLoginUrl = keycloak.createLoginUrl.bind(keycloak);
keycloak.createLoginUrl = function patchedCreateLoginUrl(opts) {
  if (isPublicChatHostname()) {
    return `${window.location.origin}${window.location.pathname}`;
  }
  return originalCreateLoginUrl(opts);
};

// Configure token refresh behavior
keycloak.onTokenExpired = () => {
  console.log('[Keycloak] Token expired, attempting refresh...');
  keycloak.updateToken(30).catch((error) => {
    console.error('[Keycloak] Failed to refresh token:', error);
    // No valid refresh token, redirect to login — never on anonymous chat host
    if (error?.error === 'invalid_grant' || !keycloak.refreshToken) {
      console.log('[Keycloak] No valid refresh token, redirecting to login');
      if (!isPublicChatHostname()) {
        originalLogin.call(keycloak);
      }
    }
  });
};

export default keycloak;

export const keycloakLoginUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/auth` +
  `?client_id=${process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_KEYCLOAK_REDIRECT_URI)}` +
  "&response_type=code" +
  "&scope=openid" +
  "&response_mode=fragment";

export const hasRole = (keycloak, roles = []) => {
  if (!keycloak?.authenticated) return false;
  const userRoles = keycloak?.tokenParsed?.realm_access?.roles || [];
  return roles.some(role => userRoles.includes(role));
};
