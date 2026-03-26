'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useApi } from '@/lib/useApi';
import { hasNextcloudPermission } from '@/lib/permissions';

const SYNC_INTERVAL_MS = 60 * 60 * 1000; // 60 minutes

/**
 * NextcloudAutoSyncProvider
 *
 * Runs Nextcloud sync:
 * - Once when the user logs in (if they have Nextcloud access)
 * - Every 60 minutes while they remain logged in
 * - Stops when they log out
 *
 * Must be rendered inside KeycloakProvider and WorkspaceProvider.
 */
export default function NextcloudAutoSyncProvider({ children }) {
  const { keycloak } = useKeycloak();
  const { getUser, syncFoldersFromNextcloud } = useApi();
  const intervalRef = useRef(null);
  const hasSyncedOnLoginRef = useRef(false);

  const runSync = useCallback(async () => {
    try {
      await syncFoldersFromNextcloud();
    } catch (err) {
      // Silent fail - user may not have Nextcloud or API may return 403
      if (err?.response?.status !== 403 && err?.response?.status !== 404) {
        console.warn('[NextcloudAutoSync] Sync failed:', err?.message || err);
      }
    }
  }, [syncFoldersFromNextcloud]);

  useEffect(() => {
    if (!keycloak?.authenticated) {
      hasSyncedOnLoginRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const roles = keycloak?.tokenParsed?.realm_access?.roles || [];
    if (roles.includes('super_admin')) {
      return;
    }

    const init = async () => {
      let user = null;
      try {
        user = await getUser();
      } catch (err) {
        return;
      }
      if (!user || !hasNextcloudPermission(user)) {
        return;
      }

      // Sync once on login (short delay so workspace context is ready)
      if (!hasSyncedOnLoginRef.current) {
        hasSyncedOnLoginRef.current = true;
        setTimeout(() => runSync(), 2000);
      }

      if (intervalRef.current) return;
      intervalRef.current = setInterval(runSync, SYNC_INTERVAL_MS);
    };

    init();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      hasSyncedOnLoginRef.current = false;
    };
  }, [keycloak?.authenticated, keycloak?.tokenParsed, getUser, runSync]);

  return children;
}
