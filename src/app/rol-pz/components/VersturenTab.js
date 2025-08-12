export default function VersturenTab () {
    return (
        <div className="flex flex-col gap-11">
            <div className="flex flex-col">             
                <span className="mt-[23px] mb-2 font-montserrat font-normal text-sm leading-normal tracking-normal">E-mail adres</span>
                <div className="flex gap-[14px] items-center">
                    <input type="text" placeholder="info@creeert.net" className="w-60 h-12 rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none" />
                    <div className="flex gap-[86px] items-center">
                        <div className="flex gap-[6px]">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.997 0C15.515 0 19.995 4.48 19.995 9.998C19.995 15.515 15.515 19.995 9.997 19.995C4.48 19.995 0 15.515 0 9.998C0 4.48 4.48 0 9.997 0ZM9.25 9.25H5.75C5.336 9.25 5 9.586 5 10C5 10.414 5.336 10.75 5.75 10.75H9.25V14.25C9.25 14.664 9.586 15 10 15C10.414 15 10.75 14.664 10.75 14.25V10.75H14.25C14.664 10.75 15 10.414 15 10C15 9.586 14.664 9.25 14.25 9.25H10.75V5.75C10.75 5.336 10.414 5 10 5C9.586 5 9.25 5.336 9.25 5.75V9.25Z" fill="#23BD92"/>
                            </svg>
                        </div>
                        <button className="w-[149px] h-[50px] border-[2px] border-[#23BD92] rounded-[8px] font-bold text-[16px] leading-[100%] tracking-[0] text-center text-[#23BD92]">
                            Bulk uploaden
                        </button>
                    </div>

                </div>

                <span className="mt-[23px] mb-2 font-montserrat font-normal text-sm leading-normal tracking-normal">Rolnaam</span>
                <input type="text" className="mb-5 w-60 h-12 rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none" />
            </div>

            <button className="w-[95px] h-[50px] rounded-[8px] bg-[#23BD92] font-montserrat font-bold text-base leading-[100%] tracking-normal text-center text-white">
                Versturen
            </button>
        </div>
    )
}