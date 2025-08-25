'use client'
import { useState } from "react";

import DropdownMenu from "@/components/input/DropdownMenu";

export default function WijzigenTab () {
    const allOptions = ["Beheerder", "Option 1", "Option 2", "Option 3"];
    const [selected, setSelected] = useState(allOptions[0]);
  
    return (
        <div className="flex flex-col w-full gap-11">
            <div className="flex flex-col w-full">
                <div className="flex w-2/3 gap-4">
                    <div className="flex flex-col w-1/2">
                        <span className="mb-2 font-montserrat font-normal text-[16px] leading-normal tracking-normal">Voornaam</span>
                        <input type="text" placeholder="Carsten" className="mb-5 h-12 rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none" />
                    </div>
                    <div className="flex flex-col w-1/2">
                        <span className="mb-2 font-montserrat font-normal text-[16px] leading-normal tracking-normal">Achternaam</span>
                        <input type="text" placeholder="Altena" className="mb-5 h-12 rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none" />
                    </div>
                </div>
               
                <span className="mb-2 font-montserrat font-normal text-[16px] leading-normal tracking-normal">Rol</span>
                <div className="w-1/3 ">
                    <DropdownMenu value={selected} onChange={setSelected} allOptions={allOptions} />
                </div>    

                <span className="mt-[23px] font-montserrat font-normal text-[16px] leading-normal tracking-normal">E-mail adres</span>                
                <div className="mt-2 flex gap-[14px] items-center">
                    <input type="text" placeholder="info@creeert.net" className="w-1/3 h-12 rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none" />
                    <div className="relative">
                        <button className="w-fit h-[40px] flex items-center py-[15px] px-[13px] border-[2px] border-[#23BD92] rounded-[8px] font-bold text-[16px] leading-[100%] text-[#23BD92]">
                            Wachtwoord resetten
                        </button>                            
                        <span className="w-[300px] absolute right-[-110px] top-12 font-montserrat font-normal text-[16px] leading-normal">
                            De gebruiker zal gevraagd worden om <br />
                            een sterk wachtwoord te bedenken.
                        </span>                           
                    </div>
                </div>
            </div>

            <button className="w-[95px] h-[50px] rounded-[8px] bg-[#23BD92] font-montserrat font-bold text-base leading-[100%] tracking-normal text-center text-white">
                Opslaan
            </button>
        </div>
    )
}