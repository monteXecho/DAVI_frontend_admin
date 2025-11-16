'use client'

import ChecksPage from "./ChecksPage";
import { ChecksProvider } from "./contexts/ChecksContext";

function ComplianceCheck() {
  return (
    <ChecksProvider>
      <ChecksPage />
    </ChecksProvider>
  );
}

export default ComplianceCheck;
