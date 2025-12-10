'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { apiClient, createAuthHeaders } from '@/lib/apiClient';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const { keycloak } = useKeycloak();
  const [workspaces, setWorkspaces] = useState(null);
  const [selectedOwnerId, setSelectedOwnerId] = useState(null);
  const [permissions, setPermissions] = useState(null);

  useEffect(() => {
    const roles = keycloak?.tokenParsed?.realm_access?.roles || [];
    const isSuperAdmin = roles.includes('super_admin');

    const fetchWorkspaces = async () => {
      if (!keycloak?.authenticated) return;
      if (isSuperAdmin) {
        // Super admins don't need workspace selection; skip fetching to avoid 403s
        setWorkspaces(null);
        setSelectedOwnerId(null);
        setPermissions(null);
        return;
      }
      const token = keycloak.token;
      if (!token) return;

      try {
        const res = await apiClient.get(
          '/company-admin/guest-workspaces',
          createAuthHeaders(token)
        );
        setWorkspaces(res.data);
      } catch (err) {
        console.error('[WorkspaceProvider] Failed to fetch workspaces:', err);
      }
    };

    fetchWorkspaces();
  }, [keycloak]);

  // Function to sync selectedOwnerId with localStorage
  const syncWithLocalStorage = useCallback(() => {
    if (!workspaces) return;

    const optionIds = [
      workspaces.self?.ownerId,
      ...(workspaces.guestOf || []).map((ws) => ws.ownerId),
    ].filter(Boolean);

    if (!optionIds.length) return;

    let stored = null;
    if (typeof window !== 'undefined') {
      try {
        stored = window.localStorage.getItem('daviActingOwnerId');
      } catch (e) {
        // ignore storage read errors
      }
    }

    const nextOwnerId = optionIds.includes(stored)
      ? stored
      : workspaces.self?.ownerId || optionIds[0];

    if (nextOwnerId && nextOwnerId !== selectedOwnerId) {
      setSelectedOwnerId(nextOwnerId);
    }
  }, [workspaces, selectedOwnerId]);

  useEffect(() => {
    syncWithLocalStorage();
  }, [syncWithLocalStorage]);

  // Listen for storage changes (e.g., when user switches on /userswitch page)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e) => {
      if (e.key === 'daviActingOwnerId') {
        syncWithLocalStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom events (for same-tab updates)
    window.addEventListener('daviWorkspaceChange', syncWithLocalStorage);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('daviWorkspaceChange', syncWithLocalStorage);
    };
  }, [syncWithLocalStorage]);

  useEffect(() => {
    if (!selectedOwnerId || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('daviActingOwnerId', selectedOwnerId);
      // Also update session storage to indicate selection was made
      window.sessionStorage.setItem('daviActingOwnerSelectedForSession', 'true');
    } catch (e) {
      // ignore storage write errors
    }
  }, [selectedOwnerId]);

  useEffect(() => {
    if (!workspaces || !selectedOwnerId) {
      setPermissions(null);
      return;
    }

    if (workspaces.self && workspaces.self.ownerId === selectedOwnerId) {
      setPermissions(workspaces.self.permissions || null);
      return;
    }

    const guest = (workspaces.guestOf || []).find(
      (ws) => ws.ownerId === selectedOwnerId
    );
    if (guest) {
      setPermissions(guest.permissions || null);
    } else {
      setPermissions(null);
    }
  }, [workspaces, selectedOwnerId]);

  const value = {
    workspaces,
    selectedOwnerId,
    permissions,
    setSelectedOwnerId,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return ctx;
}
