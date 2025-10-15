'use client'
import { useState } from "react";
import CheckBox from "@/components/buttons/CheckBox";
import DropdownMenu from "@/components/input/DropdownMenu";
import AddIcon from "@/components/icons/AddIcon";

export default function ToewijzenTab () {
    const allOptions = ["Staff", "Option 1", "Option 2", "Option 3"];
    const [selected, setSelected] = useState(allOptions[0]);

    return (
        <div className="flex flex-col gap-11 w-full">
            <div className="flex flex-col w-full">
                <span className="mb-2 font-montserrat font-normal text-[16px] leading-normal tracking-normal">Rolnaam</span>
                
                <div className="relative w-1/3 ">
                    <DropdownMenu value={selected} onChange={setSelected} allOptions={allOptions} />
                </div>               
                <span className="mt-[23px] mb-2 font-montserrat font-normal text-[16px] leading-normal tracking-normal">E-mail adres</span>
                <div className="flex gap-[14px] items-center">
                    <input type="text" placeholder="info@creeert.net" className="w-1/3 h-12 rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none" />
                    <AddIcon />
                </div>
                <div className="flex mt-[37px] gap-3 items-center">
                    <CheckBox toggle={true} color='#000' />
                    <span className="font-montserrat font-normal text-[16px] leading-normal tracking-normal">Stuur uitnodiging</span>
                </div>

            </div>

            <button className="w-[95px] h-[50px] rounded-[8px] bg-[#23BD92] font-montserrat font-bold text-base leading-[100%] tracking-normal text-center text-white">
                Opslaan
            </button>
        </div>
    )
}