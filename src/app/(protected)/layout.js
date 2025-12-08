"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/components/layout/mainLayout";
import { WorkspaceProvider } from "@/context/WorkspaceContext";

export default function ProtectedLayout({ children }) {
  return (
    <MainLayout>
      <ProtectedRoute>
        <WorkspaceProvider>
          {children}
        </WorkspaceProvider>
      </ProtectedRoute>
    </MainLayout>
  );
}
