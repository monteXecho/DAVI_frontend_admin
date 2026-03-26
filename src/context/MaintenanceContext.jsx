'use client';

import { createContext, useContext, useCallback, useEffect, useState } from 'react';

const MaintenanceContext = createContext(null);

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const MAINTENANCE_CHECK_INTERVAL = 60000; // 60s

export function MaintenanceProvider({ children }) {
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [checkedOnce, setCheckedOnce] = useState(false);

  const fetchMaintenanceStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/maintenance-status`, {
        signal: AbortSignal.timeout(5000),
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        setMaintenanceEnabled(!!data.maintenance);
      }
    } catch {
      setMaintenanceEnabled(false);
    } finally {
      setCheckedOnce(true);
    }
  }, []);

  useEffect(() => {
    fetchMaintenanceStatus();
    const interval = setInterval(fetchMaintenanceStatus, MAINTENANCE_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchMaintenanceStatus]);

  return (
    <MaintenanceContext.Provider
      value={{
        showConstruction: maintenanceEnabled,
        maintenanceEnabled,
        checkedOnce,
        refetch: fetchMaintenanceStatus,
      }}
    >
      {children}
    </MaintenanceContext.Provider>
  );
}

export function useMaintenance() {
  const ctx = useContext(MaintenanceContext);
  if (!ctx) throw new Error('useMaintenance must be used within MaintenanceProvider');
  return ctx;
}
