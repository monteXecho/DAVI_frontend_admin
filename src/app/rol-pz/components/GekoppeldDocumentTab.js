'use client'
import { useState } from "react";
import AddButton from "@/components/buttons/AddButton";

const GekoppeldDocumentData = [
    {
        Map: 'Kwaliteit/veiligheid',
        Bestand: 'kwaliteit-veiligheid-2025.pdf',
        greenIcon: true,
        redIcon: true,
    },{
        Map: 'Pedagogiek 0-4',
        Bestand: 'beleid-pedagogiek-0-4-jarig.docx',
        greenIcon: true,
        redIcon: true,
    },{
        Map: 'Gezondheid/voeding',
        Bestand: 'info-voeding-v2b.pdf',
        greenIcon: true,
        redIcon: true,
    },{
        Map: 'Kwaliteit/veiligheid',
        Bestand: 'kwaliteit-veiligheid-2025.pdf',
        greenIcon: true,
        redIcon: true,
    },{
        Map: 'Pedagogiek 0-4',
        Bestand: 'beleid-pedagogiek-0-4-jarig.docx',
        greenIcon: true,
        redIcon: true,
    },{
        Map: 'Pedagogiek 0-4',
        Bestand: 'beleid-pedagogiek-0-4-jarig.docx',
        greenIcon: true,
        redIcon: true,
    },{
        Map: 'Pedagogiek 0-4',
        Bestand: 'beleid-pedagogiek-0-4-jarig.docx',
        greenIcon: true,
        redIcon: true,
    },{
        Map: 'Pedagogiek 0-4',
        Bestand: 'beleid-pedagogiek-0-4-jarig.docx',
        greenIcon: true,
        redIcon: true,
    },{
        Map: 'Kwaliteit/veiligheid',
        Bestand: 'kwaliteit-veiligheid-2025.pdf',
        greenIcon: true,
        redIcon: true,
    },{
        Map: 'Kwaliteit/veiligheid',
        Bestand: 'kwaliteit-veiligheid-2025.pdf',
        greenIcon: true,
        redIcon: true,
    },{
        Map: 'Kwaliteit/veiligheid',
        Bestand: 'kwaliteit-veiligheid-2025.pdf',
        greenIcon: true,
        redIcon: true,
    }
]

export default function GekoppeldDocumentTab() {
  const defaultValue = "Bulkacties";
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
    <div className="flex flex-col w-[777px]">
        <div className="mb-[29px] font-montserrat font-extrabold text-[18px] leading-[100%]">
            786 documenten gekoppeld aan de rol PZ
        </div>

        <div className="flex h-[60px] bg-[#F9FBFA] items-center justify-between px-2">
            <div className="flex gap-4">
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
                        <ul className="absolute top-full left-0 w-full bg-white border border-[#D9D9D9] rounded-lg mt-1 shadow-md max-h-48 overflow-auto z-10" role="listbox" tabIndex={-1}>
                        {dropdownOptions.map(opt => (
                            <li key={opt} className="px-4 py-2 cursor-pointer hover:bg-gray-100" onClick={() => selectOption(opt)} role="option" aria-selected={selected === opt} tabIndex={0} onKeyDown={e => { if(e.key === "Enter" || e.key === " ") { e.preventDefault(); selectOption(opt); } }}>
                            {opt}
                            </li>
                        ))}
                        </ul>
                    )}
                </div>

                <div className="relative w-[203px] h-10">
                <input placeholder="Zoek gebruiker..." className="w-full h-full bg-white border border-[#D9D9D9] focus:outline-none rounded-full pl-4 pr-10 font-montserrat font-normal text-base leading-6 text-[#1E1E1E]" />
                <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 13L10.1 10.1M11.6667 6.33333C11.6667 9.27885 9.27885 11.6667 6.33333 11.6667C3.38781 11.6667 1 9.27885 1 6.33333C1 3.38781 3.38781 1 6.33333 1C9.27885 1 11.6667 3.38781 11.6667 6.33333Z" stroke="#1E1E1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                </div>
            </div>

            <AddButton onClick={() => {}} text="Toevoegen" />
        </div>        

        <table className="w-full border-separate border-spacing-0 border border-transparent">
            <thead className="bg-[#F9FBFA] border-b border-[#C5BEBE]">
                <tr className="h-[51px] flex items-center gap-[40px] w-full px-2">
                {/* We can't use flex on <tr> so use table-layout fixed and padding to simulate */}
                    <th className="flex items-center gap-5 w-3/7 font-montserrat font-bold text-[16px] leading-6 text-black">
                        <input type="checkbox" className="box-border w-4 h-4 bg-white border border-[#757575] rounded-sm" />                        
                        <span>Map</span>
                        <svg width="15" height="9" viewBox="0 0 15 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 1L7.5 7L1 0.999999" stroke="#8F8989" strokeWidth="2"/>
                        </svg>

                    </th>
                    <th className="flex items-center gap-5 w-4/7 font-montserrat font-bold text-[16px] leading-6 text-black">
                        Bestand
                        <svg width="15" height="9" viewBox="0 0 15 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 1L7.5 7L1 0.999999" stroke="#8F8989" strokeWidth="2"/>
                        </svg>
                    </th>
                    <th className="w-[52px] px-4 py-2"></th>
                </tr>
            </thead>
            <tbody>
                {/* Example data rows */}
                {GekoppeldDocumentData.map(({Map, Bestand, greenIcon, redIcon}, i) => (
                    <tr key={i} className="h-[51px] border-b border-[#C5BEBE] flex items-center gap-[40px]">
                        <td className="flex gap-5 w-3/7 items-center font-montserrat font-normal text-[16px] leading-6 text-black px-2 py-2">
                            <input type="checkbox" className="box-border w-4 h-4 bg-white border border-[#757575] rounded-sm" />                        
                            {Map}
                        </td>
                        <td className="w-4/7 font-montserrat font-normal text-[16px] leading-6 text-black px-4 py-2">{Bestand}</td>
                        <td className="w-fit flex justify-end items-center gap-3 px-4 py-2">
                        {greenIcon 
                        &&  <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.005 0.5C4.4825 0.5 0.00500488 4.9775 0.00500488 10.5C0.00500488 16.0225 4.4825 20.5 10.005 20.5C15.5275 20.5 20.005 16.0225 20.005 10.5C20.005 4.9775 15.5275 0.5 10.005 0.5ZM5.83834 14.6667L6.67667 11.3033L9.26501 13.8908L5.83834 14.6667ZM10.1383 13.1008L7.47001 10.4325L12.3375 5.5L15.005 8.16667L10.1383 13.1008Z" fill="#23BD92"/>
                            </svg>
                        }
                        {redIcon 
                        &&  <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.002 0.50293C15.52 0.50293 20 4.98293 20 10.4999C20 16.0179 15.52 20.4979 10.002 20.4979C4.485 20.4979 0.00500488 16.0179 0.00500488 10.4999C0.00500488 4.98293 4.485 0.50293 10.002 0.50293ZM10.002 9.43593L7.281 6.71393C7.135 6.56793 6.942 6.49493 6.75 6.49493C6.346 6.49493 6 6.81893 6 7.24393C6 7.43693 6.073 7.62793 6.219 7.77493L8.941 10.4969L6.21301 13.2249C6.06601 13.3719 5.993 13.5649 5.993 13.7559C5.993 14.1829 6.34301 14.5059 6.74401 14.5059C6.93601 14.5059 7.12801 14.4329 7.274 14.2869L10.002 11.5589L12.731 14.2869C12.877 14.4329 13.069 14.5059 13.261 14.5059C13.662 14.5059 14.011 14.1829 14.011 13.7559C14.011 13.5649 13.938 13.3719 13.791 13.2249L11.064 10.4969L13.781 7.77993C13.927 7.63293 14 7.44193 14 7.24893C14 6.82393 13.654 6.49893 13.25 6.49893C13.058 6.49893 12.865 6.57193 12.719 6.71893L10.002 9.43593Z" fill="#E94F4F"/>
                            </svg> 
                        }
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
}
