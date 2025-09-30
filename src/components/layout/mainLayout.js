import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'DAVI',
  description: 'RAG_DAVI',
}

export default function MainLayout({ children }) {
  return (
        <div className="flex flex-col lg:flex-row w-full h-full">
          <div className='lg:block hidden'> <LeftSidebar /> </div>
          <div className='lg:hidden'> <Header /> </div>

          <main className="flex-1 mt-[90px] mb-[120px] lg:mt-0 lg:mb-0">
                {children}                
          </main>
          <div className='lg:hidden'> <Footer /> </div>
        </div>
  )
}
