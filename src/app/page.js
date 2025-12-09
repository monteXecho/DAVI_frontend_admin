"use client";
import MainLayout from "@/components/layout/mainLayout"
import DocumentClient from "./(protected)/documentchat/DocumentClient";
import ProtectedRoute from "@/components/ProtectedRoute";
import { WorkspaceProvider } from "@/context/WorkspaceContext";

export default function Home() {
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
