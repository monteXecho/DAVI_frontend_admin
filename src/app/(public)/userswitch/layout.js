import ProtectedRoute from "@/components/ProtectedRoute"

export default function Layout({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
