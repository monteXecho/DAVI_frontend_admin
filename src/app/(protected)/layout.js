"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/components/layout/mainLayout";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { MaintenanceProvider } from "@/context/MaintenanceContext";
import NextcloudAutoSyncProvider from "@/components/NextcloudAutoSyncProvider";
import MaintenanceGate from "@/components/MaintenanceGate";

export default function ProtectedLayout({ children }) {
  return (
    <WorkspaceProvider>
      <MaintenanceProvider>
        <MaintenanceGate>
          <ProtectedRoute>
            <NextcloudAutoSyncProvider>
              <MainLayout>
                {children}
              </MainLayout>
            </NextcloudAutoSyncProvider>
          </ProtectedRoute>
        </MaintenanceGate>
      </MaintenanceProvider>
    </WorkspaceProvider>
  );
}
