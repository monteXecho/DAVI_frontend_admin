import ProtectedRoute from "@/components/ProtectedRoute"
import { WorkspaceProvider } from "@/context/WorkspaceContext"

export default function Layout({ children }) {
  return (
    <WorkspaceProvider>
      <ProtectedRoute>{children}</ProtectedRoute>
    </WorkspaceProvider>
  )
}
