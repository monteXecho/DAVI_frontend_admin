"use client"
import ProtectedRoute from "@/components/ProtectedRoute"
import MainLayout from "@/components/layout/mainLayout"

export default function ProtectedLayout({ children }) {
  return (    
    <MainLayout>
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    </MainLayout>
  )
}
