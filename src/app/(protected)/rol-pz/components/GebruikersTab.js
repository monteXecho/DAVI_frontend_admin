'use client'
import { useState } from "react";
import AddButton from "@/components/buttons/AddButton";
import CheckBox from "@/components/buttons/CheckBox";
import SearchBox from "@/components/input/SearchBox";
import DropdownMenu from "@/components/input/DropdownMenu";
import GrayCancelIcon from "@/components/icons/GrayCancelIcon";
import DownArrow from "@/components/icons/DownArrowIcon";
import EditIcon from "@/components/icons/EditIcon";
import RedCancelIcon from "@/components/icons/RedCancelIcon";

const RolPZData = [
    { Naam: 'Anna Bijsterbosch', Email: 'info@annabijsterbosch.nl' },
    { Naam: 'Carsten Altena', Email: 'info@creeert.net' },
    { Naam: 'JP Meijer', Email: 'jeanphilippe.meijer@mijndavi.nl' },
    { Naam: 'Carsten Altena', Email: 'info@creeert.net' },
    { Naam: 'JP Meijer', Email: 'jeanphilippe.meijer@mijndavi.nl' },
    { Naam: 'Carsten Altena', Email: 'info@creeert.net' },
    { Naam: 'JP Meijer', Email: 'jeanphilippe.meijer@mijndavi.nl' },
    { Naam: 'Carsten Altena', Email: 'info@creeert.net' },
    { Naam: 'JP Meijer', Email: 'jeanphilippe.meijer@mijndavi.nl' }
];

export default function GebruikersTab() {
  const allOptions1 = ["Bulkacties", "Option 1", "Option 2", "Option 3"]; 
  const [selected1, setSelected1] = useState(allOptions1[0]); 

  const allOptions2 = ["Filter op PZ", "Option 01", "Option 02", "Option 03"]; 
  const [selected2, setSelected2] = useState(allOptions2[0]); 

  return (
    <div className="flex flex-col w-full">
        <div className="mb-[29px] font-montserrat font-extrabold text-[18px] leading-[100%]">
            {RolPZData.length} gebruikers met de rol PZ
        </div>

        <div className="flex h-[60px] bg-[#F9FBFA] items-center justify-between px-2">
             <button className="w-[127px] h-[40px] border-[2px] border-[#23BD92] rounded-lg font-bold text-[16px] leading-[100%] text-[#23BD92]">
                Bulk import
            </button>
            <AddButton onClick={() => {}} text="Toevoegen" />
        </div>

        <div className="flex h-[60px] bg-[#F9FBFA] items-center justify-between px-2">
            <div className="w-32/99">
                <DropdownMenu value={selected1} onChange={setSelected1} allOptions={allOptions1} />
            </div>

            <div className="flex gap-2 items-center w-32/99">
                <DropdownMenu value={selected2} onChange={setSelected2} allOptions={allOptions2} />

                <GrayCancelIcon />
            </div>

            <div className="w-32/99">
                <SearchBox placeholderText='Zoek gebruiker...' />
            </div>
        </div>        

        <table className="w-full border-separate border-spacing-0">
            <thead className="bg-[#F9FBFA]">                
                <tr className="h-[51px] border-b border-[#C5BEBE] flex items-center gap-[40px] px-2">
                    <th className="flex items-center gap-5 w-3/8">
                        <CheckBox toggle={false} color='#23BD92'/> 
                        <span>Naam</span>
                        <DownArrow />
                    </th>
                    <th className="flex items-center gap-5 w-5/8">
                        E-mail
                        <DownArrow />
                    </th>
                    <th className="w-[52px]"></th>
                </tr>
            </thead>
            <tbody>
                {RolPZData.map(({Naam, Email}, i) => (
                    <tr key={i} className="h-[51px] border-b border-[#C5BEBE] flex items-center gap-[40px]">
                        <td className="flex gap-5 w-3/8 px-2 items-center">
                            <CheckBox toggle={false} color='#23BD92' />  
                            {Naam}
                        </td>
                        <td className="w-5/8 px-4">{Email}</td>
                        <td className="flex justify-end items-center gap-3 px-4">
                            <EditIcon />
                            <RedCancelIcon />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
}
