'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { usePublicChat } from '@/lib/api/publicChat';

const SYNC_INTERVAL_MS = 60 * 60 * 1000; // 60 minutes

/**
 * PublicChatUrlAutoSyncProvider
 *
 * Runs Public Chat URL sync:
 * - Once when the user logs in (short delay so workspace is ready)
 * - Every 60 minutes while they remain logged in
 * - Stops when they log out
 *
 * Must be rendered inside KeycloakProvider and WorkspaceProvider.
 */
export default function PublicChatUrlAutoSyncProvider({ children }) {
  const { keycloak } = useKeycloak();
  const { syncAllChatSources } = usePublicChat();
  const intervalRef = useRef(null);
  const hasSyncedOnLoginRef = useRef(false);

  const runSync = useCallback(async () => {
    try {
      await syncAllChatSources();
    } catch (err) {
      // Silent fail - user may not have permission or no URL sources
      if (err?.response?.status !== 403 && err?.response?.status !== 404) {
        console.warn('[PublicChatUrlAutoSync] Sync failed:', err?.message || err);
      }
    }
  }, [syncAllChatSources]);

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
    // Public Chat sync is for admins only - company_user has no access to public chat management
    if (roles.includes('company_user') && !roles.includes('company_admin')) {
      return;
    }

    // Sync once on login (short delay so workspace context is ready)
    if (!hasSyncedOnLoginRef.current) {
      hasSyncedOnLoginRef.current = true;
      setTimeout(() => runSync(), 2000);
    }

    if (intervalRef.current) return;
    intervalRef.current = setInterval(runSync, SYNC_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      hasSyncedOnLoginRef.current = false;
    };
  }, [keycloak?.authenticated, keycloak?.tokenParsed, runSync]);

  return children;
}
