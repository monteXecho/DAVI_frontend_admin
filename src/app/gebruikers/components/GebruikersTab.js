'use client'
import { useState } from "react";
import AddButton from "@/components/buttons/AddButton";
import CheckBox from "@/components/buttons/CheckBox";
import SearchBox from "@/components/input/SearchBox";
import EditIcon from "@/components/icons/EditIcon";
import ResetPassIcon from "@/components/icons/ResetPassIcon";
import RedCancelIcon from "@/components/icons/RedCancelIcon";
import DownArrow from "@/components/icons/DownArrowIcon";
import DropdownMenu from "@/components/input/DropdownMenu";

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
    const allOptions1 = ["Bulkacties", "Option 1", "Option 2", "Option 3"]; 
    const [selected1, setSelected1] = useState(allOptions1[0]); 

    // Dropdown 2 (Filter)
    const allOptions2 = ["Filter op rol", "Filter op Beheerder", "Option 02", "Option 03"]; 
    const [selected2, setSelected2] = useState(allOptions2[0]); 

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
            <div className="w-32/99">
                <DropdownMenu value={selected1} onChange={setSelected1} allOptions={allOptions1} />
            </div>

            {/* Dropdown 2 */}
            <div className="w-32/99">
                <DropdownMenu value={selected2} onChange={setSelected2} allOptions={allOptions2} />
            </div>

            {/* Search */}
            <div className="w-32/99">
                <SearchBox placeholderText='Zoek gebruiker...' />
            </div>
        </div>        

        {/* Table */}
        <table className="w-full border-separate border-spacing-0">
            <thead className="bg-[#F9FBFA]">                
                <tr className="h-[51px] border-b border-[#C5BEBE] flex items-center gap-[40px] px-2">
                    <th className="flex items-center gap-5 w-3/8 font-montserrat font-bold text-[16px] leading-6 text-black">
                        <CheckBox toggle={false} color='#23BD92' />  
                        <span>Naam</span>
                        <DownArrow />
                    </th>
                    <th className="flex items-center gap-5 w-3/8 font-montserrat font-bold text-[16px] leading-6 text-black">
                        E-mail
                        <DownArrow />
                    </th>
                    <th className="flex items-center gap-5 w-1/8 font-montserrat font-bold text-[16px] leading-6 text-black">
                        Rol
                       <DownArrow />
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
                            <EditIcon />
                            <ResetPassIcon />
                            <RedCancelIcon />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
}
