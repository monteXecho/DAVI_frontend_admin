'use client';

import { useKeycloak } from '@react-keycloak/web';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }) {
  const { keycloak, initialized } = useKeycloak();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    // Not authenticated → go to Keycloak
    if (!keycloak.authenticated) {
      keycloak.login();
      return;
    }

    // Token expiry guard
    const tokenParsed = keycloak.tokenParsed;
    const currentTime = Math.floor(Date.now() / 1000);
    if (tokenParsed && tokenParsed.exp && tokenParsed.exp < currentTime) {
      keycloak.logout({ redirectUri: window.location.origin });
      keycloak.login();
      return;
    }

    const roles = tokenParsed?.realm_access?.roles || [];
    const isSuperAdmin = roles.includes('super_admin');
    if (isSuperAdmin) {
      // Super admins should never be forced into workspace selection
      return;
    }

    // Workspace selection: if we have no acting owner stored yet,
    // force the user to '/userswitch' to choose a mode.
    if (typeof window !== 'undefined') {
      const actingOwnerId = window.localStorage.getItem('daviActingOwnerId');
      if (!actingOwnerId && pathname !== '/userswitch') {
        router.replace('/userswitch');
      }
    }
  }, [initialized, keycloak, pathname, router]);

  if (!initialized) return null;
  if (!keycloak.authenticated) return null;

  return children;
}
