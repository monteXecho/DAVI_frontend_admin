'use client'
import { useState } from "react";
import UpArrow from "../icons/UpArrow";
import DownArrow from "../icons/DownArrowIcon";

export default function DropdownMenu ({ value, onChange, allOptions }) {
    const [open, setOpen] = useState(false);

    const dropdownOptions = allOptions.filter(opt => opt !== value);

    function toggleDropdown() {
        setOpen(!open);
    }

    function selectOption(option) {
        onChange(option); 
        setOpen(false);
    }

    return (
        <div className="relative w-full">
            <div
                className="flex items-center justify-between w-full h-10 bg-white border border-[#D9D9D9] rounded-[8px] px-4 cursor-pointer select-none"
                onClick={toggleDropdown}
                tabIndex={0}
                onKeyDown={e => { if(e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleDropdown(); } }}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <div className="font-montserrat font-normal text-base leading-6 text-[#1E1E1E]">{value}</div>
                { open ? <UpArrow /> : <DownArrow /> }
            </div>

            {open && (
                <ul className="absolute top-full left-0 w-full bg-white border border-[#D9D9D9] rounded-lg mt-1 shadow-md max-h-48 overflow-auto z-10" role="listbox" tabIndex={0}>
                {dropdownOptions.map(opt => (
                    <li key={opt} className="px-4 py-2 cursor-pointer hover:bg-gray-100" 
                        onClick={() => selectOption(opt)} 
                        role="option" aria-selected={value === opt} tabIndex={0} 
                        onKeyDown={e => { if(e.key === "Enter" || e.key === " ") { e.preventDefault(); selectOption(opt); } }}>
                        {opt}
                    </li>
                ))}
                </ul>
            )}
        </div>
    )
}
