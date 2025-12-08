'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { apiClient, createAuthHeaders } from '@/lib/apiClient';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const { keycloak } = useKeycloak();
  const [workspaces, setWorkspaces] = useState(null);
  const [selectedOwnerId, setSelectedOwnerId] = useState(null);
  const [permissions, setPermissions] = useState(null);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (!keycloak?.authenticated) return;
      const token = keycloak.token;
      if (!token) return;

      try {
        const res = await apiClient.get(
          '/company-admin/guest-workspaces',
          createAuthHeaders(token)
        );
        const data = res.data;
        setWorkspaces(data);

        // Default: self workspace
        if (data?.self?.ownerId) {
          setSelectedOwnerId(data.self.ownerId);
        }
      } catch (err) {
        console.error('[WorkspaceProvider] Failed to fetch workspaces:', err);
      }
    };

    fetchWorkspaces();
  }, [keycloak]);

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
