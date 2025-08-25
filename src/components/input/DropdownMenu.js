'use client'
import { useState } from "react";

export default function DropdownMenu ({ defaultValue, allOptions }) {
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
        <div className="relative w-full">
            <div
                className="flex items-center justify-between w-full h-10 bg-white border border-[#D9D9D9] rounded-[8px] px-4 cursor-pointer select-none"
                onClick={toggleDropdown}
                tabIndex={0} onKeyDown={e => { if(e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleDropdown(); } }}
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
    )
}