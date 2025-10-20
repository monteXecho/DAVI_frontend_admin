import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
});

const keycloak_server = process.env.NEXT_PUBLIC_KEYCLOAK_URL

export default keycloak;
 
export const keycloakLoginUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/auth` +
  `?client_id=${process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_KEYCLOAK_REDIRECT_URI)}` +
  "&response_type=code" +
  "&scope=openid" +
  "&response_mode=fragment";

// helper to check if the user has at least one of the given roles
export const hasRole = (keycloak, roles = []) => {
  if (!keycloak?.authenticated) return false;
  const userRoles = keycloak?.tokenParsed?.realm_access?.roles || [];
  return roles.some(role => userRoles.includes(role));
};

  