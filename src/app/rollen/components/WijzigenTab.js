'use client'
import { useState } from "react";
import Toggle from "@/components/buttons/Toggle"

export default function WijzigenTab () {
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
        <div className="flex flex-col gap-11 w-full">
            <div className="flex flex-col w-full">
                <span className="mb-2 font-montserrat font-normal text-[16px] leading-normal tracking-normal">Rolnaam</span>
                <div className="relative mb-5">
                    <div className="flex gap-[14px] items-center">
                        <div
                            className="flex items-center justify-between w-1/3 h-12 bg-white border border-[#D9D9D9] rounded-[8px] px-4 cursor-pointer select-none"
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

                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.997 0C15.515 0 19.995 4.48 19.995 9.997C19.995 15.515 15.515 19.995 9.997 19.995C4.48 19.995 0 15.515 0 9.997C0 4.48 4.48 0 9.997 0ZM9.997 8.933L7.276 6.211C7.13 6.065 6.937 5.992 6.745 5.992C6.341 5.992 5.995 6.316 5.995 6.741C5.995 6.934 6.068 7.125 6.214 7.272L8.936 9.994L6.208 12.722C6.061 12.869 5.988 13.062 5.988 13.253C5.988 13.68 6.338 14.003 6.739 14.003C6.931 14.003 7.123 13.93 7.269 13.784L9.997 11.056L12.726 13.784C12.872 13.93 13.064 14.003 13.256 14.003C13.657 14.003 14.006 13.68 14.006 13.253C14.006 13.062 13.933 12.869 13.786 12.722L11.059 9.994L13.776 7.277C13.922 7.13 13.995 6.939 13.995 6.746C13.995 6.321 13.649 5.996 13.245 5.996C13.053 5.996 12.86 6.069 12.714 6.216L9.997 8.933Z" fill="#E94F4F"/>
                        </svg>
                    </div>
                    {open && (
                        <ul className="absolute top-full left-0 w-60 bg-white border border-[#D9D9D9] rounded-lg mt-1 shadow-md max-h-48 overflow-auto z-10" role="listbox" tabIndex={0}>
                        {dropdownOptions.map(opt => (
                            <li key={opt} className="px-4 py-2 cursor-pointer hover:bg-gray-100" onClick={() => selectOption(opt)} role="option" aria-selected={selected === opt} tabIndex={0} onKeyDown={e => { if(e.key === "Enter" || e.key === " ") { e.preventDefault(); selectOption(opt); } }}>
                            {opt}
                            </li>
                        ))}
                        </ul>
                    )}
                </div>                     
                <span className="mb-2 font-montserrat font-normal text-[16px] leading-normal tracking-normal">Toegang tot map/document</span>
                <div className="flex mb-4  gap-[14px] items-center">
                    <input type="text" placeholder="//beleid" className="w-1/3 h-12 rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none" />
                    <div className="flex gap-[6px]">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.997 0C15.515 0 19.995 4.48 19.995 9.998C19.995 15.515 15.515 19.995 9.997 19.995C4.48 19.995 0 15.515 0 9.998C0 4.48 4.48 0 9.997 0ZM9.25 9.25H5.75C5.336 9.25 5 9.586 5 10C5 10.414 5.336 10.75 5.75 10.75H9.25V14.25C9.25 14.664 9.586 15 10 15C10.414 15 10.75 14.664 10.75 14.25V10.75H14.25C14.664 10.75 15 10.414 15 10C15 9.586 14.664 9.25 14.25 9.25H10.75V5.75C10.75 5.336 10.414 5 10 5C9.586 5 9.25 5.336 9.25 5.75V9.25Z" fill="#23BD92"/>
                        </svg>

                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.997 0C15.515 0 19.995 4.48 19.995 9.997C19.995 15.515 15.515 19.995 9.997 19.995C4.48 19.995 0 15.515 0 9.997C0 4.48 4.48 0 9.997 0ZM9.997 8.933L7.276 6.211C7.13 6.065 6.937 5.992 6.745 5.992C6.341 5.992 5.995 6.316 5.995 6.741C5.995 6.934 6.068 7.125 6.214 7.272L8.936 9.994L6.208 12.722C6.061 12.869 5.988 13.062 5.988 13.253C5.988 13.68 6.338 14.003 6.739 14.003C6.931 14.003 7.123 13.93 7.269 13.784L9.997 11.056L12.726 13.784C12.872 13.93 13.064 14.003 13.256 14.003C13.657 14.003 14.006 13.68 14.006 13.253C14.006 13.062 13.933 12.869 13.786 12.722L11.059 9.994L13.776 7.277C13.922 7.13 13.995 6.939 13.995 6.746C13.995 6.321 13.649 5.996 13.245 5.996C13.053 5.996 12.86 6.069 12.714 6.216L9.997 8.933Z" fill="#E94F4F"/>
                        </svg>
                    </div>
                </div>
                <div className="flex mb-4  gap-[14px] items-center">
                    <input type="text" placeholder="//kwaliteit/bkr" className="w-1/3 h-12 rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none" />
                    <div className="flex gap-[6px]">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.997 0C15.515 0 19.995 4.48 19.995 9.998C19.995 15.515 15.515 19.995 9.997 19.995C4.48 19.995 0 15.515 0 9.998C0 4.48 4.48 0 9.997 0ZM9.25 9.25H5.75C5.336 9.25 5 9.586 5 10C5 10.414 5.336 10.75 5.75 10.75H9.25V14.25C9.25 14.664 9.586 15 10 15C10.414 15 10.75 14.664 10.75 14.25V10.75H14.25C14.664 10.75 15 10.414 15 10C15 9.586 14.664 9.25 14.25 9.25H10.75V5.75C10.75 5.336 10.414 5 10 5C9.586 5 9.25 5.336 9.25 5.75V9.25Z" fill="#23BD92"/>
                        </svg>

                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.997 0C15.515 0 19.995 4.48 19.995 9.997C19.995 15.515 15.515 19.995 9.997 19.995C4.48 19.995 0 15.515 0 9.997C0 4.48 4.48 0 9.997 0ZM9.997 8.933L7.276 6.211C7.13 6.065 6.937 5.992 6.745 5.992C6.341 5.992 5.995 6.316 5.995 6.741C5.995 6.934 6.068 7.125 6.214 7.272L8.936 9.994L6.208 12.722C6.061 12.869 5.988 13.062 5.988 13.253C5.988 13.68 6.338 14.003 6.739 14.003C6.931 14.003 7.123 13.93 7.269 13.784L9.997 11.056L12.726 13.784C12.872 13.93 13.064 14.003 13.256 14.003C13.657 14.003 14.006 13.68 14.006 13.253C14.006 13.062 13.933 12.869 13.786 12.722L11.059 9.994L13.776 7.277C13.922 7.13 13.995 6.939 13.995 6.746C13.995 6.321 13.649 5.996 13.245 5.996C13.053 5.996 12.86 6.069 12.714 6.216L9.997 8.933Z" fill="#E94F4F"/>
                        </svg>
                    </div>
                </div>
            </div>

            <div className="flex flex-col w-1/3 gap-10">
                <div className="flex flex-col w-full gap-[23px]">
                    <div className="flex w-full items-center justify-between">
                        <span className="font-montserrat font-bold text-2xl leading-normal tracking-normal">AI-modules</span>
                        <Toggle checked={true}/>
                    </div>

                    {['Documentenchat', 'Vaste gezichten criterium', '3-uursregeling check', 'BKR check'].map(item => {
                        return (
                             <div key={item} className="flex w-full items-center justify-between">
                                <span className="font-montserrat font-normal text-[16px] leading-normal tracking-normal">{item}</span>
                                <Toggle checked={true}/>
                            </div>
                        )
                    })}
                </div>

                <button className="w-[95px] h-[50px] rounded-[8px] bg-[#23BD92] font-montserrat font-bold text-base leading-[100%] tracking-normal text-center text-white">
                    Opslaan
                </button>
            </div>
        </div>
    )
}