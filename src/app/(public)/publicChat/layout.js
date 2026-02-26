'use client'

export default function PublicChatLayout({ children }) {
  // This layout allows unauthenticated access - no ProtectedRoute wrapper
  // Public chat pages should be accessible without login
  return <>{children}</>
}

