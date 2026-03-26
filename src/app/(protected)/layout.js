"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/components/layout/mainLayout";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { MaintenanceProvider } from "@/context/MaintenanceContext";
import NextcloudAutoSyncProvider from "@/components/NextcloudAutoSyncProvider";
import PublicChatUrlAutoSyncProvider from "@/components/PublicChatUrlAutoSyncProvider";
import MaintenanceGate from "@/components/MaintenanceGate";

export default function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <MaintenanceProvider>
        <MaintenanceGate>
          <WorkspaceProvider>
            <NextcloudAutoSyncProvider>
              <PublicChatUrlAutoSyncProvider>
                <MainLayout>
                  {children}
                </MainLayout>
              </PublicChatUrlAutoSyncProvider>
            </NextcloudAutoSyncProvider>
          </WorkspaceProvider>
        </MaintenanceGate>
      </MaintenanceProvider>
    </ProtectedRoute>
  );
}
