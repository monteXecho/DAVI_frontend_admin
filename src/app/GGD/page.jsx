'use client'

import ChecksPage from "./ChecksPage";
import { ChecksProvider } from "./contexts/ChecksContext";
import MainLayout from "@/components/layout/mainLayout"
import ProtectedRoute from '@/components/ProtectedRoute'

function ComplianceCheck() {
  return (
    <MainLayout>
      <ProtectedRoute>
        <ChecksProvider>
          <ChecksPage />
        </ChecksProvider>
      </ProtectedRoute>
    </MainLayout>
  );
}

export default ComplianceCheck;
