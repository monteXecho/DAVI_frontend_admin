export default function SelectedData ({ SelectedData }) {
    return (
        <div
            className="relative flex items-center justify-between w-full h-10 bg-white border border-[#D9D9D9] rounded-full px-4 cursor-pointer select-none"
            tabIndex={0}
            aria-haspopup="listbox"
        >
            <div className="font-montserrat font-normal text-base leading-6 text-[#1E1E1E]">{SelectedData}</div>
            
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 1L1 9M1 1L9 9" stroke="#1E1E1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
    )
}