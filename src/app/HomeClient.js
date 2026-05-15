"use client";

import MainLayout from "@/components/layout/mainLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { WorkspaceProvider } from "@/context/WorkspaceContext";

import DocumentClient from "./(protected)/documentchat/DocumentClient";

export default function HomeClient() {
  return (
    <ProtectedRoute>
      <WorkspaceProvider>
        <MainLayout>
          <DocumentClient />
        </MainLayout>
      </WorkspaceProvider>
    </ProtectedRoute>
  );
}
