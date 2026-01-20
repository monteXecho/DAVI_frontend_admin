'use client'
import ComplianceCheck from "../ComplianceCheck/ComplianceCheck"
import { ChecksProvider } from "../ComplianceCheck/contexts/ChecksContext"

export default function ComplianceCheckTab() {
  return (
    <ChecksProvider>
      <ComplianceCheck />
    </ChecksProvider>
  )
}

