'use client'
import { useState } from "react";
import AddButton from "@/components/buttons/AddButton";
import CheckBox from "@/components/buttons/CheckBox";
import DropdownMenu from "@/components/input/DropdownMenu";
import SearchBox from "@/components/input/SearchBox";
import DownArrow from "@/components/icons/DownArrowIcon";
import EditIcon from "@/components/icons/EditIcon";
import RedCancelIcon from "@/components/icons/RedCancelIcon";

const GekoppeldDocumentData = [
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

export default function GekoppeldDocumentTab() {
  const allOptions1 = ["Option 1", "Option 2", "Option 3"]; 
  const [selected1, setSelected1] = useState(allOptions1[0]); 

  const allOptions2 = ["Option 01", "Option 02", "Option 03"]; 
  const [selected2, setSelected2] = useState(allOptions2[0]); 

  return (
    <div className="flex flex-col w-full">
        <div className="flex w-full bg-[#F9FBFA] gap-4 py-[10px] px-2">
            <div className="w-3/10">
                <DropdownMenu value={selected1} onChange={setSelected1} allOptions={allOptions1} />
            </div>

            <div className="w-3/10">
                <SearchBox placeholderText='Zoek gebruiker...' />
            </div>
        </div>

        <div className="flex w-full h-fit bg-[#F9FBFA] items-center justify-between px-2 py-[6px]">
            <div className="flex w-2/3 gap-4 items-center">
                <CheckBox toggle={false} color='#23BD92' />  
                <div className="w-4/9">
                    <DropdownMenu value={selected2} onChange={setSelected2} allOptions={allOptions2} />
                </div>

                <div className="w-4/9">
                    <SearchBox placeholderText='Zoek document...' />
                </div>
            </div>

            <AddButton onClick={() => {}} text="Toevoegen" />
        </div>        

        <table className="w-full border-separate border-spacing-0 border border-transparent">
            <thead className="bg-[#F9FBFA]">                
                <tr className="h-[51px] border-b border-[#C5BEBE] flex items-center gap-[40px] w-full px-2">
                    <th className="flex items-center gap-5 w-3/9 font-montserrat font-bold text-[16px] leading-6 text-black">
                        <CheckBox toggle={false} color='#23BD92' />  
                        <span>Map</span>
                        <DownArrow />
                    </th>
                    <th className="flex items-center gap-5 w-6/9 font-montserrat font-bold text-[16px] leading-6 text-black">
                        Bestand
                        <DownArrow />
                    </th>
                    <th className="w-[52px] px-4 py-2"></th>
                </tr>
            </thead>
            <tbody>
                {GekoppeldDocumentData.map(({Map, Bestand}, i) => (
                    <tr key={i} className="h-[51px] border-b border-[#C5BEBE] flex items-center gap-[40px]">
                        <td className="flex gap-5 w-3/9 items-center font-montserrat font-normal text-[16px] leading-6 text-black px-2 py-2">
                            <CheckBox toggle={false} color='#23BD92' />   
                            {Map}
                        </td>
                        <td className="w-6/9 font-montserrat font-normal text-[16px] leading-6 text-black px-4 py-2">{Bestand}</td>
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
