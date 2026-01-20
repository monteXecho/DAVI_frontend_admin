'use client'
import CreateVGCList from "../CreateVGCList/CreateVGCList"
import { ChecksProvider } from "../ComplianceCheck/contexts/ChecksContext"

export default function CreateVGCTab() {
  return (
    <ChecksProvider>
      <CreateVGCList />
    </ChecksProvider>
  )
}

