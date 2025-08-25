export default function SearchBox ({ placeholderText }) {
    return (
        <div className="relative w-full h-10">
            <input placeholder={placeholderText} className="w-full h-full bg-white border border-[#D9D9D9] focus:outline-none rounded-full pl-4 pr-10 font-montserrat font-normal text-base leading-6 text-[#1E1E1E]" />
            <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 13L10.1 10.1M11.6667 6.33333C11.6667 9.27885 9.27885 11.6667 6.33333 11.6667C3.38781 11.6667 1 9.27885 1 6.33333C1 3.38781 3.38781 1 6.33333 1C9.27885 1 11.6667 3.38781 11.6667 6.33333Z" stroke="#1E1E1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
        </div>
    )
}