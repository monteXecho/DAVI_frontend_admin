'use client'
import CheckBox from "@/components/buttons/CheckBox";
import { useState, useRef } from "react";

export default function MakenTab () {
    const defaultValue = "Beheerder";
    const allOptions = ["Option 1", "Option 2", "Option 3"];
    const [selected, setSelected] = useState(defaultValue);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Build dropdown list options, including defaultValue if it's not selected
    const dropdownOptions = selected === defaultValue
    ? allOptions
    : [defaultValue, ...allOptions.filter(opt => opt !== selected)];

    function toggleDropdown() {
        setOpen(!open);
    }

    function selectOption(option) {
        setSelected(option);
        setOpen(false);
    }

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
                <div className="relative w-1/3">
                    <div
                        className="flex items-center justify-between w-full h-10 bg-white border border-[#D9D9D9] rounded-[8px] px-4 cursor-pointer select-none"
                        onClick={toggleDropdown}
                        tabIndex={0} 
                        onKeyDown={e => { if(e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleDropdown(); } }}
                        aria-haspopup="listbox"
                        aria-expanded={open}
                    >
                        <div className="font-montserrat font-normal text-base leading-6 text-[#1E1E1E]">{selected}</div>
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className={open ? "rotate-180" : ""} style={{ transition: "transform 0.2s" }}>
                        <path d="M1 1L5 5L9 1" stroke="#1E1E1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>

                    {open && (
                        <ul className="absolute top-full left-0 w-full bg-white border border-[#D9D9D9] rounded-lg mt-1 shadow-md max-h-48 overflow-auto z-10" role="listbox" tabIndex={0}>
                        {dropdownOptions.map(opt => (
                            <li key={opt} className="px-4 py-2 cursor-pointer hover:bg-gray-100" onClick={() => selectOption(opt)} role="option" aria-selected={selected === opt} tabIndex={0} onKeyDown={e => { if(e.key === "Enter" || e.key === " ") { e.preventDefault(); selectOption(opt); } }}>
                            {opt}
                            </li>
                        ))}
                        </ul>
                    )}
                </div>    

                <span className="mt-[23px] font-montserrat font-normal text-[16px] leading-normal tracking-normal">E-mail adres</span>                
                <div className="mt-2 flex gap-[14px] items-center">
                    <input type="text" placeholder="info@creeert.net" className="w-1/3 h-12 rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none" />
                    <div className="flex gap-3 items-center">
                        <CheckBox toggle={true} color='#000' />
                        <div className="relative">
                            <span className="font-montserrat font-normal text-[16px] leading-normal">Stuur uitnodiging</span>
                            <span className="w-[300px] absolute right-[-180px] top-9 font-montserrat font-normal text-[16px] leading-normal">
                                De gebruiker zal gevraagd worden om <br />
                                een sterk wachtwoord te bedenken.
                            </span>                           
                        </div>
                    </div>
                </div>
            </div>

            <button className="w-[95px] h-[50px] rounded-[8px] bg-[#23BD92] font-montserrat font-bold text-base leading-[100%] tracking-normal text-center text-white">
                Opslaan
            </button>
        </div>
    )
}