'use client'
import { useState } from "react";
import AddButton from "@/components/buttons/AddButton";
import CheckBox from "@/components/buttons/CheckBox";

const RolPZData = [
    { Naam: 'Anna Bijsterbosch', Email: 'info@annabijsterbosch.nl', Rol: 'Beheerder' },
    { Naam: 'Carsten Altena', Email: 'info@creeert.net', Rol: 'MP’er' },
    { Naam: 'JP Meijer', Email: 'jeanphilippe.meijer@mijndavi.nl', Rol: 'MP’er' },
    { Naam: 'Carsten Altena', Email: 'info@creeert.net', Rol: 'MP’er'},
    { Naam: 'JP Meijer', Email: 'jeanphilippe.meijer@mijndavi.nl', Rol: 'MP’er' },
    { Naam: 'Carsten Altena', Email: 'info@creeert.net', Rol: 'MP’er' },
    { Naam: 'JP Meijer', Email: 'jeanphilippe.meijer@mijndavi.nl', Rol: 'MP’er' },
    { Naam: 'Carsten Altena', Email: 'info@creeert.net', Rol: 'MP’er' },
    { Naam: 'JP Meijer', Email: 'jeanphilippe.meijer@mijndavi.nl', Rol: 'MP’er' },
    { Naam: 'Nazar H', Email: 'nazar@dev.net', Rol: 'Beheerder' }
];

export default function GebruikersTab() {
  // Dropdown 1
  const defaultValue1 = "Bulkacties"; 
  const allOptions1 = ["Option 1", "Option 2", "Option 3"]; 
  const [selected1, setSelected1] = useState(defaultValue1); 
  const [open1, setOpen1] = useState(false);

  const dropdownOptions1 = selected1 === defaultValue1
    ? allOptions1
    : [defaultValue1, ...allOptions1.filter(opt => opt !== selected1)];

  function toggleDropdown1() { setOpen1(!open1); }
  function selectOption1(option) { setSelected1(option); setOpen1(false); }

  // Dropdown 2 (Filter)
  const defaultValue2 = "Filter op rol"; 
  const allOptions2 = ["Filter op Beheerder", "Option 02", "Option 03"]; 
  const [selected2, setSelected2] = useState(defaultValue2); 
  const [open2, setOpen2] = useState(false);

  const dropdownOptions2 = selected2 === defaultValue2
    ? allOptions2
    : [defaultValue2, ...allOptions2.filter(opt => opt !== selected2)];

  function toggleDropdown2() { setOpen2(!open2); }

  function selectOption2(option) { 
    setSelected2(option); 
    setOpen2(false); 
  }

  // Filter the data based on dropdown 2 selection
  const filteredData = selected2 === "Filter op Beheerder"
    ? RolPZData.filter(user => user.Rol === "Beheerder")
    : RolPZData;

    // Dynamic title text
    let titleText = "";
    if (selected2 === "Filter op Beheerder") {
    titleText = `${filteredData.length} gebruiker${filteredData.length !== 1 ? 's' : ''} met de rol “Beheerder”`;
    } else {
    titleText = `${filteredData.length} gebruikers`;
    }

  return (
    <div className="flex flex-col w-full">
        <div className="mb-[29px] font-montserrat font-extrabold text-[18px] leading-[100%]">
            {titleText}
        </div>

        <div className="flex h-[60px] bg-[#F9FBFA] items-center justify-between px-2">
             <button className="w-[127px] h-[40px] border-[2px] border-[#23BD92] rounded-[8px] font-bold text-[16px] leading-[100%] text-[#23BD92]">
                Bulk import
            </button>
            <AddButton onClick={() => {}} text="Toevoegen" />
        </div>

        <div className="flex h-[60px] bg-[#F9FBFA] items-center justify-between px-2">
            {/* Dropdown 1 */}
            <div className="relative w-32/99">
                <div
                    className="flex items-center justify-between w-full h-10 bg-white border border-[#D9D9D9] rounded-[8px] px-4 cursor-pointer select-none"
                    onClick={toggleDropdown1}
                    tabIndex={0}
                    onKeyDown={e => { if(e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleDropdown1(); } }}
                    aria-haspopup="listbox"
                    aria-expanded={open1}
                >
                    <div>{selected1}</div>
                    <svg width="10" height="6" className={open1 ? "rotate-180" : ""} style={{ transition: "transform 0.2s" }} viewBox="0 0 10 6" fill="none">
                        <path d="M1 1L5 5L9 1" stroke="#1E1E1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                {open1 && (
                    <ul className="absolute top-full left-0 w-full bg-white border border-[#D9D9D9] rounded-lg mt-1 shadow-md max-h-48 overflow-auto z-10">
                        {dropdownOptions1.map(opt => (
                            <li key={opt} className="px-4 py-2 cursor-pointer hover:bg-gray-100" onClick={() => selectOption1(opt)}>
                                {opt}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Dropdown 2 */}
            <div className="relative w-32/99">
                <div
                    className="flex items-center justify-between w-full h-10 bg-white border border-[#D9D9D9] rounded-[8px] px-4 cursor-pointer select-none"
                    onClick={toggleDropdown2}
                    tabIndex={0}        
                    onKeyDown={e => { if(e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleDropdown2(); } }}
                    aria-haspopup="listbox"
                    aria-expanded={open2}
                >
                    <div>{selected2}</div>
                    <svg width="10" height="6" className={open2 ? "rotate-180" : ""} style={{ transition: "transform 0.2s" }} viewBox="0 0 10 6" fill="none">
                        <path d="M1 1L5 5L9 1" stroke="#1E1E1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                {open2 && (
                    <ul className="absolute top-full left-0 w-full bg-white border border-[#D9D9D9] rounded-lg mt-1 shadow-md max-h-48 overflow-auto z-10">
                        {dropdownOptions2.map(opt => (
                            <li key={opt} className="px-4 py-2 cursor-pointer hover:bg-gray-100" onClick={() => selectOption2(opt)}>
                                {opt}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Search */}
            <div className="w-32/99">
                <SearchBox placeholderText='Zoek gebruiker...' />
            </div>
        </div>        

        {/* Table */}
        <table className="w-full border-separate border-spacing-0">
            <thead className="bg-[#F9FBFA] border-b border-[#C5BEBE]">
                <tr className="h-[51px] flex items-center gap-[40px] px-2">
                    <th className="flex items-center gap-5 w-3/8 font-montserrat font-bold text-[16px] leading-6 text-black">
                        <CheckBox toggle={false} color='#23BD92' />  
                        <span>Naam</span>
                        <svg width="15" height="9" viewBox="0 0 15 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 1L7.5 7L1 0.999999" stroke="#8F8989" strokeWidth="2"/>
                        </svg>
                    </th>
                    <th className="flex items-center gap-5 w-3/8 font-montserrat font-bold text-[16px] leading-6 text-black">
                        E-mail
                        <svg width="15" height="9" viewBox="0 0 15 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 1L7.5 7L1 0.999999" stroke="#8F8989" strokeWidth="2"/>
                        </svg>
                    </th>
                    <th className="flex items-center gap-5 w-1/8 font-montserrat font-bold text-[16px] leading-6 text-black">
                        Rol
                        <svg width="15" height="9" viewBox="0 0 15 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 1L7.5 7L1 0.999999" stroke="#8F8989" strokeWidth="2"/>
                        </svg>
                    </th>
                    <th className="w-1/8 px-4 py-2"></th>
                </tr>
            </thead>
            <tbody>
                {filteredData.map(({ Naam, Email, Rol }, i) => (
                    <tr key={i} className="h-[51px] border-b border-[#C5BEBE] flex items-center gap-[40px] px-2">
                        <td className="flex gap-5 w-3/8 items-center font-montserrat font-normal text-[16px] leading-6 text-black ">
                            <CheckBox toggle={false} color='#23BD92' />                             
                            {Naam}
                        </td>
                        <td className="w-3/8 font-montserrat font-normal text-[16px] leading-6 text-black">{Email}</td>
                        <td className="w-1/8 font-montserrat font-normal text-[16px] leading-6 text-black">{Rol}</td>
                        <td className="w-1/8 flex justify-end items-center gap-3">
                            <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.005 0.5C4.4825 0.5 0.00500488 4.9775 0.00500488 10.5C0.00500488 16.0225 4.4825 20.5 10.005 20.5C15.5275 20.5 20.005 16.0225 20.005 10.5C20.005 4.9775 15.5275 0.5 10.005 0.5ZM5.83834 14.6667L6.67667 11.3033L9.26501 13.8908L5.83834 14.6667ZM10.1383 13.1008L7.47001 10.4325L12.3375 5.5L15.005 8.16667L10.1383 13.1008Z" fill="#23BD92"/>
                            </svg>
                            <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M23.626 9.512C23.873 10.471 24.005 11.476 24.005 12.512C24.005 19.135 18.628 24.5 12.005 24.5C5.382 24.5 0.00500488 19.135 0.00500488 12.512C0.00500488 5.889 5.382 0.512 12.005 0.512C14.586 0.512 16.974 1.334 18.932 2.723L20.65 0.5L22.585 6.512H16.005L17.708 4.308C16.088 3.18 14.126 2.512 12.005 2.512C6.485 2.512 2.005 6.993 2.005 12.512C2.005 18.032 6.485 22.512 12.005 22.512C17.524 22.512 22.005 18.032 22.005 12.512C22.005 11.467 21.844 10.459 21.547 9.512H23.626ZM16.005 17.5H8.005V11.5H9.005V9.5C9.005 7.844 10.349 6.5 12.005 6.5C13.661 6.5 15.005 7.844 15.005 9.5V11.5H16.005V17.5ZM11.005 9.5V11.5H13.005V9.5C13.005 8.948 12.557 8.5 12.005 8.5C11.453 8.5 11.005 8.948 11.005 9.5Z" fill="#23BD92"/>
                            </svg>
                            <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.002 0.50293C15.52 0.50293 20 4.98293 20 10.4999C20 16.0179 15.52 20.4979 10.002 20.4979C4.485 20.4979 0.00500488 16.0179 0.00500488 10.4999C0.00500488 4.98293 4.485 0.50293 10.002 0.50293ZM10.002 9.43593L7.281 6.71393C7.135 6.56793 6.942 6.49493 6.75 6.49493C6.346 6.49493 6 6.81893 6 7.24393C6 7.43693 6.073 7.62793 6.219 7.77493L8.941 10.4969L6.21301 13.2249C6.06601 13.3719 5.993 13.5649 5.993 13.7559C5.993 14.1829 6.34301 14.5059 6.74401 14.5059C6.93601 14.5059 7.12801 14.4329 7.274 14.2869L10.002 11.5589L12.731 14.2869C12.877 14.4329 13.069 14.5059 13.261 14.5059C13.662 14.5059 14.011 14.1829 14.011 13.7559C14.011 13.5649 13.938 13.3719 13.791 13.2249L11.064 10.4969L13.781 7.77993C13.927 7.63293 14 7.44193 14 7.24893C14 6.82393 13.654 6.49893 13.25 6.49893C13.058 6.49893 12.865 6.57193 12.719 6.71893L10.002 9.43593Z" fill="#E94F4F"/>
                            </svg> 
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
}
