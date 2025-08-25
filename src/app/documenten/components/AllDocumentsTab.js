'use client'
import { useState } from "react";
import AddButton from "@/components/buttons/AddButton";
import CheckBox from "@/components/buttons/CheckBox";
import EditIcon from "@/components/icons/EditIcon";

const AllDocumentsData = [
    {
        Map: 'Kwaliteit/veiligheid',
        Bestand: 'kwaliteit-veiligheid-2025.pdf',
    },{
        Map: 'Pedagogiek 0-4',
        Bestand: 'beleid-pedagogiek-0-4-jarig.docx',
    },{
        Map: 'Gezondheid/voeding',
        Bestand: 'info-voeding-v2b.pdf',
    },{
        Map: 'Kwaliteit/veiligheid',
        Bestand: 'kwaliteit-veiligheid-2025.pdf',

    },{
        Map: 'Pedagogiek 0-4',
        Bestand: 'beleid-pedagogiek-0-4-jarig.docx',

    },{
        Map: 'Pedagogiek 0-4',
        Bestand: 'beleid-pedagogiek-0-4-jarig.docx',

    },{
        Map: 'Pedagogiek 0-4',
        Bestand: 'beleid-pedagogiek-0-4-jarig.docx',

    },{
        Map: 'Pedagogiek 0-4',
        Bestand: 'beleid-pedagogiek-0-4-jarig.docx',

    },{
        Map: 'Kwaliteit/veiligheid',
        Bestand: 'kwaliteit-veiligheid-2025.pdf',

    },{
        Map: 'Kwaliteit/veiligheid',
        Bestand: 'kwaliteit-veiligheid-2025.pdf',

    },{
        Map: 'Kwaliteit/veiligheid',
        Bestand: 'kwaliteit-veiligheid-2025.pdf',

    }
]

export default function AllDocumentsTab() {
  // Dropdown 1
  const defaultValue1 = "Filter op rol"; 
  const allOptions1 = ["Option 1", "Option 2", "Option 3"]; 
  const [selected1, setSelected1] = useState(defaultValue1); 
  const [open1, setOpen1] = useState(false);

  const dropdownOptions1 = selected1 === defaultValue1
    ? allOptions1
    : [defaultValue1, ...allOptions1.filter(opt => opt !== selected1)];

  function toggleDropdown1() { setOpen1(!open1); }
  function selectOption1(option) { setSelected1(option); setOpen1(false); }

  // Dropdown 2
  const defaultValue2 = "Bulkacties"; 
  const allOptions2 = ["Option 01", "Option 02", "Option 03"]; 
  const [selected2, setSelected2] = useState(defaultValue2); 
  const [open2, setOpen2] = useState(false);

  const dropdownOptions2 = selected2 === defaultValue2
    ? allOptions2
    : [defaultValue2, ...allOptions2.filter(opt => opt !== selected2)];

  function toggleDropdown2() { setOpen2(!open2); }
  function selectOption2(option) { setSelected2(option); setOpen2(false); }

  return (
    <div className="flex flex-col w-full">
        <div className="flex w-full bg-[#F9FBFA] gap-4 py-[10px] px-2">
            <div className="relative w-3/10">
                <div
                    className="flex items-center justify-between w-full h-10 bg-white border border-[#D9D9D9] rounded-[8px] px-4 cursor-pointer select-none"
                    onClick={toggleDropdown1}
                    tabIndex={0}
                    onKeyDown={e => { if(e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleDropdown1(); } }}
                    aria-haspopup="listbox"
                    aria-expanded={open1}
                >
                    <div className="font-montserrat font-normal text-base leading-6 text-[#1E1E1E]">{selected1}</div>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className={open1 ? "rotate-180" : ""} style={{ transition: "transform 0.2s" }}>
                    <path d="M1 1L5 5L9 1" stroke="#1E1E1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>

                {open1 && (
                    <ul className="absolute top-full left-0 w-full bg-white border border-[#D9D9D9] rounded-lg mt-1 shadow-md max-h-48 overflow-auto z-10" role="listbox" tabIndex={0}>
                    {dropdownOptions1.map(opt => (
                        <li key={opt} className="px-4 py-2 cursor-pointer hover:bg-gray-100" onClick={() => selectOption1(opt)} role="option" aria-selected={selected1 === opt} tabIndex={0} onKeyDown={e => { if(e.key === "Enter" || e.key === " ") { e.preventDefault(); selectOption1(opt); } }}>
                        {opt}
                        </li>
                    ))}
                    </ul>
                )}
            </div>
        </div>

        <div className="flex w-full h-fit bg-[#F9FBFA] items-center justify-between px-2 py-[6px]">
            <div className="flex w-2/3 gap-4 items-center">
                <div className="relative w-4/9">
                    <div
                        className="flex items-center justify-between w-full h-10 bg-white border border-[#D9D9D9] rounded-[8px] px-4 cursor-pointer select-none"
                        onClick={toggleDropdown2}
                        tabIndex={0}
                        onKeyDown={e => { if(e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleDropdown2(); } }}
                        aria-haspopup="listbox"
                        aria-expanded={open2}
                    >
                        <div className="font-montserrat font-normal text-base leading-6 text-[#1E1E1E]">{selected2}</div>
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className={open2 ? "rotate-180" : ""} style={{ transition: "transform 0.2s" }}>
                        <path d="M1 1L5 5L9 1" stroke="#1E1E1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>

                    {open2 && (
                        <ul className="absolute top-full left-0 w-full bg-white border border-[#D9D9D9] rounded-lg mt-1 shadow-md max-h-48 overflow-auto z-10" role="listbox" tabIndex={0}>
                        {dropdownOptions2.map(opt => (
                            <li key={opt} className="px-4 py-2 cursor-pointer hover:bg-gray-100" onClick={() => selectOption2(opt)} role="option" aria-selected={selected1 === opt} tabIndex={0} onKeyDown={e => { if(e.key === "Enter" || e.key === " ") { e.preventDefault(); selectOption2(opt); } }}>
                            {opt}
                            </li>
                        ))}
                        </ul>
                    )}
                </div>

                <div className="w-4/9">
                    <SearchBox placeholderText='Zoek gebruiker...' />
                </div>
            </div>

            <AddButton onClick={() => {}} text="Toevoegen" />
        </div>        

        <table className="w-full border-separate border-spacing-0 border border-transparent">
            <thead className="bg-[#F9FBFA] border-b border-[#C5BEBE]">
                <tr className="h-[51px] flex items-center gap-[40px] w-full px-2">
                {/* We can't use flex on <tr> so use table-layout fixed and padding to simulate */}
                    <th className="flex items-center gap-5 w-3/9 font-montserrat font-bold text-[16px] leading-6 text-black">
                        <CheckBox toggle={false} color='#23BD92' />  
                        <span>Map</span>
                        <svg width="15" height="9" viewBox="0 0 15 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 1L7.5 7L1 0.999999" stroke="#8F8989" strokeWidth="2"/>
                        </svg>
                    </th>
                    <th className="flex items-center gap-5 w-6/9 font-montserrat font-bold text-[16px] leading-6 text-black">
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
                {AllDocumentsData.map(({Map, Bestand}, i) => (
                    <tr key={i} className="h-[51px] border-b border-[#C5BEBE] flex items-center gap-[40px]">
                        <td className="flex gap-5 w-3/9 items-center font-montserrat font-normal text-[16px] leading-6 text-black px-2 py-2">
                            <CheckBox toggle={false} color='#23BD92' />   
                            {Map}
                        </td>
                        <td className="w-6/9 font-montserrat font-normal text-[16px] leading-6 text-black px-4 py-2">{Bestand}</td>
                        <td className="w-fit flex justify-end items-center gap-3 px-4 py-2">
                            <EditIcon />
                            <EditIcon />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
}
