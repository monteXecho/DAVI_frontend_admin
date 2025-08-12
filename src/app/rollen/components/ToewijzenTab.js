'use client'
import { useState } from "react";

export default function ToewijzenTab () {
    const defaultValue = "Staff";
    const allOptions = ["Option 1", "Option 2", "Option 3"];
    const [selected, setSelected] = useState(defaultValue);
    const [open, setOpen] = useState(false);

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
        <div className="flex flex-col gap-11">
            <div className="flex flex-col">
                <span className="mb-2 font-montserrat font-normal text-sm leading-normal tracking-normal">Rolnaam</span>
                
                <div className="relative">
                    <div
                        className="flex items-center justify-between w-60 h-10 bg-white border border-[#D9D9D9] rounded-[8px] px-4 cursor-pointer select-none"
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
                        <ul className="absolute top-full left-0 w-60 bg-white border border-[#D9D9D9] rounded-lg mt-1 shadow-md max-h-48 overflow-auto z-10" role="listbox" tabIndex={-1}>
                        {dropdownOptions.map(opt => (
                            <li key={opt} className="px-4 py-2 cursor-pointer hover:bg-gray-100" onClick={() => selectOption(opt)} role="option" aria-selected={selected === opt} tabIndex={0} onKeyDown={e => { if(e.key === "Enter" || e.key === " ") { e.preventDefault(); selectOption(opt); } }}>
                            {opt}
                            </li>
                        ))}
                        </ul>
                    )}
                </div>               
                <span className="mt-[23px] mb-2 font-montserrat font-normal text-sm leading-normal tracking-normal">E-mail adres</span>
                <div className="flex gap-[14px] items-center">
                    <input type="text" placeholder="info@creeert.net" className="w-60 h-12 rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none" />
                    <div className="flex gap-[6px]">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.997 0C15.515 0 19.995 4.48 19.995 9.998C19.995 15.515 15.515 19.995 9.997 19.995C4.48 19.995 0 15.515 0 9.998C0 4.48 4.48 0 9.997 0ZM9.25 9.25H5.75C5.336 9.25 5 9.586 5 10C5 10.414 5.336 10.75 5.75 10.75H9.25V14.25C9.25 14.664 9.586 15 10 15C10.414 15 10.75 14.664 10.75 14.25V10.75H14.25C14.664 10.75 15 10.414 15 10C15 9.586 14.664 9.25 14.25 9.25H10.75V5.75C10.75 5.336 10.414 5 10 5C9.586 5 9.25 5.336 9.25 5.75V9.25Z" fill="#23BD92"/>
                        </svg>
                    </div>
                </div>
                <div className="flex mt-[37px] gap-3 items-center">
                    <input type="checkbox" defaultChecked={true} className="box-border w-4 h-4 bg-white border border-[#757575] rounded-sm" />                        
                    <span className="font-montserrat font-normal text-sm leading-normal tracking-normal">Stuur uitnodiging</span>
                </div>

            </div>

            <button className="w-[95px] h-[50px] rounded-[8px] bg-[#23BD92] font-montserrat font-bold text-base leading-[100%] tracking-normal text-center text-white">
                Opslaan
            </button>
        </div>
    )
}