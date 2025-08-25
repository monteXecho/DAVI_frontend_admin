import AddIcon from "@/components/icons/AddIcon"

export default function VersturenTab () {
    return (
        <div className="flex flex-col gap-11 w-full">
            <div className="flex flex-col w-full">             
                <span className="mt-[23px] mb-2 font-montserrat font-normal text-[16px] leading-normal tracking-normal">E-mail adres</span>
                <div className="flex gap-[14px] items-center">
                    <input type="text" placeholder="info@creeert.net" className="w-1/3 h-12 rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none" />
                    <div className="flex gap-[86px] items-center">
                        <div className="flex gap-[6px]">
                            <AddIcon />
                        </div>
                        <button className="w-[149px] h-[50px] border-[2px] border-[#23BD92] rounded-[8px] font-bold text-[16px] leading-[100%] tracking-[0] text-center text-[#23BD92]">
                            Bulk uploaden
                        </button>
                    </div>

                </div>

                <span className="mt-[23px] mb-2 font-montserrat font-normal text-[16px] leading-normal tracking-normal">Rolnaam</span>
                <input type="text" className="mb-5 w-1/3 h-12 rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none" />
            </div>

            <button className="w-[95px] h-[50px] rounded-[8px] bg-[#23BD92] font-montserrat font-bold text-base leading-[100%] tracking-normal text-center text-white">
                Versturen
            </button>
        </div>
    )
}