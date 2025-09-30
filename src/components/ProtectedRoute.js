'use client';

import { useKeycloak } from '@react-keycloak/web';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ProtectedRoute({ children }) {
  const { keycloak, initialized } = useKeycloak();
  const path = usePathname();

  useEffect(() => {
    if (!initialized) return;

    // If not authenticated, redirect to login
    if (!keycloak.authenticated) {
      keycloak.login();
      return;
    }

    // Check if token expired
    const tokenParsed = keycloak.tokenParsed;
    const currentTime = Math.floor(Date.now() / 1000); // current time in seconds
    if (tokenParsed && tokenParsed.exp && tokenParsed.exp < currentTime) {
      // Token expired, force logout and login
      keycloak.logout({ redirectUri: window.location.origin });
      keycloak.login();
    }
  }, [initialized, keycloak, path]);

  if (!initialized) return null;
  if (!keycloak.authenticated) return null;

  return children;
}
