import SearchIcon from './icons/SearchIcon';
import HistoryIcon from './icons/HistoryIcon';
import DocumentIcon from './icons/DocumentIcon';

export default function RightSidebar () {
    return (
        <div className="flex flex-col items-center gap-[50px] w-[130px] h-full border-l border-[#C5BEBE] px-[25px] py-[53px]">
            <div className="flex flex-col gap-[2px] items-center">
                <SearchIcon className="w-6 h-6 text-gray-500"/>
                <span className='text-[#8F8989] text-[12px]'>Zoeken</span>
            </div>

            <div className="flex flex-col gap-[2px] items-center">
                <HistoryIcon className="w-6 h-6 text-gray-500"/>
                <span className='text-[#8F8989] text-[12px]'>Geschiedenis</span>
            </div>

             <div className="flex flex-col gap-[2px] items-center">
                <DocumentIcon className="w-6 h-6 text-gray-500"/>
                <span className='text-[#8F8989] text-[12px]'>Documenten</span>
            </div>
        </div>
    )
}
