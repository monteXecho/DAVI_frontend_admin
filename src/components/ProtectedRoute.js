'use client';

import { useKeycloak } from '@react-keycloak/web';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }) {
  const { keycloak, initialized } = useKeycloak();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (initialized && !keycloak.authenticated && path !== '/') {
      keycloak.login();
    }
  }, [initialized, keycloak, path]);

  if (!initialized) return null;
  if (!keycloak.authenticated && path !== '/') return null;

  return children;
}
