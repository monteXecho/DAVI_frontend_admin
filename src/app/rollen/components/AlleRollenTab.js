'use client'

import AddButton from "@/components/buttons/AddButton";
import CheckBox from "@/components/buttons/CheckBox";
import SearchBox from "@/components/input/SearchBox";
import DropdownMenu from "@/components/input/DropdownMenu";
import DownArrowIcon from "@/components/icons/DownArrowIcon";
import EditIcon from "@/components/icons/EditIcon";

const RolData = [
    {
        rol: 'Beheerder',
        gebruikers: '1',
        documenten: '2256',
    },{
        rol: 'PM’er',
        gebruikers: '201',
        documenten: '1767',
    },{
        rol: 'Staff',
        gebruikers: '19',
        documenten: '2254',
    },{
        rol: 'PZ',
        gebruikers: '14',
        documenten: '786',
    }
]
const defaultValue = "Bulkacties";
const allOptions = ["Option 1", "Option 2", "Option 3"];

export default function AlleRollenTab() {
  return (
    <div className="flex flex-col w-full">
        <div className="flex w-full h-[60px] bg-[#F9FBFA] items-center justify-between px-2">
            <div className="flex w-2/3 gap-4">
                <div className="w-4/9">
                    <DropdownMenu defaultValue={defaultValue} allOptions={allOptions} />
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
                    <th className="flex items-center gap-5 w-2/7 font-montserrat font-bold text-[16px] leading-6 text-black">
                        <CheckBox toggle={false} color='#23BD92' /> 
                        <span>Rol</span>
                        <DownArrowIcon />

                    </th>
                    <th className="flex items-center gap-5 w-2/7 font-montserrat font-bold text-[16px] leading-6 text-black">
                        Gebruikers
                        <DownArrowIcon />
                    </th>
                    <th className="flex items-center gap-5 w-3/7 font-montserrat font-bold text-[16px] leading-6 text-black">
                        Documenten toegewezen
                        <DownArrowIcon />
                    </th>
                    <th className="w-[52px] px-4 py-2"></th>
                </tr>
            </thead>
            <tbody>
                {/* Example data rows */}
                {RolData.map(({rol, gebruikers, documenten }, i) => (
                    <tr key={i} className="h-[51px] border-b border-[#C5BEBE] flex items-center gap-[40px]">
                        <td className="flex gap-5 w-2/7 items-center font-montserrat font-normal text-[16px] leading-6 text-black px-2 py-2">
                        <CheckBox toggle={false} color='#23BD92' /> 
                            {rol}
                        </td>
                        <td className="w-2/7 font-montserrat font-normal text-[16px] leading-6 text-black px-4 py-2">{gebruikers}</td>
                        <td className="w-3/7 font-montserrat font-normal text-[16px] leading-6 text-black px-4 py-2">{documenten}</td>
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
