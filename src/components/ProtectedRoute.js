'use client';

import { useKeycloak } from '@react-keycloak/web';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ProtectedRoute({ children }) {
  const { keycloak, initialized } = useKeycloak();
  const path = usePathname();

  useEffect(() => {
    if (!initialized) return;

    if (!keycloak.authenticated) {
      keycloak.login();
      return;
    }

    const tokenParsed = keycloak.tokenParsed;
    const currentTime = Math.floor(Date.now() / 1000); 
    if (tokenParsed && tokenParsed.exp && tokenParsed.exp < currentTime) {
      keycloak.logout({ redirectUri: window.location.origin });
      keycloak.login();
    }
  }, [initialized, keycloak, path]);

  if (!initialized) return null;
  if (!keycloak.authenticated) return null;

  return children;
}
