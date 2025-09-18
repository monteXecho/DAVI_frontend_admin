import './globals.css'
import '@fontsource/montserrat/800.css';
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import KeycloakProviderWrapper from '@/components/KeycloakProviderWrapper'
import ProtectedRoute from '@/components/ProtectedRoute'

export const metadata = {
  title: 'DAVI',
  description: 'RAG_DAVI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="lg:h-screen">
        <div className="flex flex-col lg:flex-row w-full h-full">
          <KeycloakProviderWrapper>
            <ProtectedRoute>
              <div className='lg:block hidden'> <LeftSidebar /> </div>
              <div className='lg:hidden'> <Header /> </div>

              <main className="flex-1 mt-[90px] mb-[120px] lg:mt-0 lg:mb-0">
                    {children}                
              </main>
              <div className='lg:hidden'> <Footer /> </div>
          </ProtectedRoute>
        </KeycloakProviderWrapper>
        </div>
      </body>
    </html>
  )
}
