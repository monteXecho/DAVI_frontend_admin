'use client'
import { useState } from "react";
import AddButton from "@/components/buttons/AddButton";
import CheckBox from "@/components/buttons/CheckBox";
import DownArrow from "@/components/icons/DownArrowIcon";
import DropdownMenu from "@/components/input/DropdownMenu";
import SearchBox from "@/components/input/SearchBox";
import SelectedData from "@/components/input/SelectedData";
import EditIcon from "@/components/icons/EditIcon";
import RedCancelIcon from "@/components/icons/RedCancelIcon";

const UsersData = [
    {
        Naam: 'Anna Bijsterbosch',
        Email: 'info@annabijsterbosch.nl',
    }
]

export default function GebruikersTab() {
  // Dropdown 1
  const SelectedDoc = "kwaliteit-veiligheid-2025.pdf"; 

  // Dropdown 
  const allOptions = ["Bulkacties", "Option 01", "Option 02", "Option 03"]; 
  const [selected, setSelected] = useState(allOptions[0]); 

  return (
    <div className="flex flex-col w-full">
        <div className="flex w-full bg-[#F9FBFA] gap-4 py-[10px] px-2">
            <div className="w-9/10">
                <SelectedData SelectedData={SelectedDoc}/>
            </div>
        </div>

        <div className="flex w-full h-fit bg-[#F9FBFA] items-center justify-between px-2 py-[6px]">
            <div className="flex w-2/3 gap-4 items-center">
                <div className="w-4/9">
                    <DropdownMenu value={selected} onChange={setSelected} allOptions={allOptions} />
                </div>

                <div className="w-4/9">
                    <SearchBox placeholderText='Zoek gebruiker...' />
                </div>
            </div>

            <AddButton onClick={() => {}} text="Toevoegen" />
        </div>        

        <table className="w-full border-separate border-spacing-0 border border-transparent">
            <thead className="bg-[#F9FBFA]">                
                <tr className="h-[51px] border-b border-[#C5BEBE] flex items-center gap-[40px] w-full px-2">
                    <th className="flex items-center gap-5 w-3/9 font-montserrat font-bold text-[16px] leading-6 text-black">
                        <CheckBox toggle={false} color='#23BD92' />  
                        <span>Naam</span>
                        <DownArrow />
                    </th>
                    <th className="flex items-center gap-5 w-6/9 font-montserrat font-bold text-[16px] leading-6 text-black">
                        E-mail
                        <DownArrow />
                    </th>
                    <th className="w-[52px] px-4 py-2"></th>
                </tr>
            </thead>
            <tbody>
                {UsersData.map(({Naam, Email}, i) => (
                    <tr key={i} className="h-[51px] border-b border-[#C5BEBE] flex items-center gap-[40px]">
                        <td className="flex gap-5 w-3/9 items-center font-montserrat font-normal text-[16px] leading-6 text-black px-2 py-2">
                            <CheckBox toggle={false} color='#23BD92' />  
                            {Naam}
                        </td>
                        <td className="w-6/9 font-montserrat font-normal text-[16px] leading-6 text-black px-4 py-2">{Email}</td>
                        <td className="w-fit flex justify-end items-center gap-3 px-4 py-2">
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
