import MainLayout from "@/components/layout/mainLayout"
import ProtectedRoute from '@/components/ProtectedRoute'

export default function layout({ children }) {
  return (
    <MainLayout>
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    </MainLayout>
  )
}
