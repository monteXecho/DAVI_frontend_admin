import '@/app/globals.css'
import '@fontsource/montserrat/800.css';
import KeycloakProviderWrapper from '@/components/KeycloakProviderWrapper'
import ProtectedRoute from '@/components/ProtectedRoute'

export const metadata = {
  title: 'DAVI',
  description: 'RAG_DAVI',
}

// empty layout disables global layout
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="lg:h-screen">
        <KeycloakProviderWrapper>
          {/* <ProtectedRoute> */}
            {children}
          {/* </ProtectedRoute> */}
        </KeycloakProviderWrapper>
      </body>
    </html>
  )
}
