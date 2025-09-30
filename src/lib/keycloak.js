import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
});

export default keycloak;
 
export const keycloakLoginUrl =
  "http://localhost:8080/realms/DAVI/protocol/openid-connect/auth" +
  "?client_id=frontend" +
  "&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fdocumentchat" +
  "&response_type=code" +
  "&scope=openid" +
  "&response_mode=fragment"

// helper to check if the user has at least one of the given roles
export const hasRole = (keycloak, roles = []) => {
  if (!keycloak?.authenticated) return false;
  const userRoles = keycloak?.tokenParsed?.realm_access?.roles || [];
  return roles.some(role => userRoles.includes(role));
};

  