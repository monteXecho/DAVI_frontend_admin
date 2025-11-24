'use client'

import { useRouter } from 'next/navigation';
import DocumentIcon from '../icons/DocumentIcon';

export default function RightSidebar () {
    const router = useRouter()

    return (
        <div className="flex flex-col absolute sm:relative right-0 items-center gap-[50px] w-[50px] sm:w-[130px] h-full lg:border-l border-[#C5BEBE] sm:px-[25px] py-6 sm:py-[53px]">
             <div className="flex flex-col gap-0.5 items-center" onClick={() => {router.push('/documentchat/mijn')}}>
                <DocumentIcon className="w-6 h-6 text-gray-500"/>
                <span className='text-[#8F8989] text-[12px] text-center hidden sm:block'>Mijn <br /> Documenten</span>
            </div>
        </div>
    )
}
