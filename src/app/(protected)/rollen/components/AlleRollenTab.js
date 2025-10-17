'use client'

import { useState } from 'react'
import AddButton from '@/components/buttons/AddButton'
import CheckBox from '@/components/buttons/CheckBox'
import SearchBox from '@/components/input/SearchBox'
import DropdownMenu from '@/components/input/DropdownMenu'
import DownArrow from '@/components/icons/DownArrowIcon'
import EditIcon from '@/components/icons/EditIcon'
import RedCancelIcon from '@/components/icons/RedCancelIcon'

export default function AlleRollenTab({ roles = [], onDeleteRole }) {
  const allOptions = ['Bulkacties', 'Option 1', 'Option 2', 'Option 3']
  const [ selected, setSelected ] = useState(allOptions[0])
  const [ search, setSearch ] = useState('')

  // Filter roles by search
  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col w-full">
      {/* Header controls */}
      <div className="flex w-full h-[60px] bg-[#F9FBFA] items-center justify-between px-4">
        <div className="flex w-2/3 gap-4">
          <div className="w-1/3">
            <DropdownMenu value={selected} onChange={setSelected} allOptions={allOptions} />
          </div>

          <div className="w-1/3">
            <SearchBox
              placeholderText="Zoek rol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <AddButton onClick={() => {}} text="Toevoegen" />
      </div>

      {/* Roles Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#F9FBFA]">
            <tr className="h-[51px] border-b border-[#C5BEBE]">
              <th className="px-4 py-2 font-montserrat font-bold text-[16px] text-black">
                <div className="flex items-center gap-3">
                  <CheckBox toggle={false} color="#23BD92" />
                  <span>Rol</span>
                  <DownArrow />
                </div>
              </th>
              <th className="px-4 py-2 font-montserrat font-bold text-[16px] text-black">
                <div className="flex items-center gap-3">
                  Gebruikers
                  <DownArrow />
                </div>
              </th>
              <th className="px-4 py-2 font-montserrat font-bold text-[16px] text-black">
                <div className="flex items-center gap-3">
                  Documenten toegewezen
                  <DownArrow />
                </div>
              </th>
              <th className="px-4 py-2 w-[52px]" />
            </tr>
          </thead>

          <tbody>
            {filteredRoles.map((role) => (
              <tr
                key={role.name}
                className="h-[51px] border-b border-[#C5BEBE] hover:bg-[#F9FBFA] transition-colors"
              >
                <td className="px-4 py-2 font-montserrat text-[16px] text-black font-normal">
                  <div className="flex items-center gap-3">
                    <CheckBox toggle={false} color="#23BD92" />
                    {role.name}
                  </div>
                </td>

                <td className="px-4 py-2 font-montserrat text-[16px] text-black font-normal">
                  {role.user_count ?? 0}
                </td>

                <td className="px-4 py-2 font-montserrat text-[16px] text-black font-normal">
                  {role.document_count ?? 0}
                </td>

                <td className="px-4 py-2 h-full">
                  <div className='flex items-center gap-3'>
                    <button
                      aria-label={`Edit ${role.name}`}
                      className="hover:opacity-80 transition-opacity"
                      onClick={() => console.log('Edit', role.name)}
                    >
                      <EditIcon />
                    </button>
                    <button
                      aria-label={`Delete ${role.name}`}
                      className="hover:opacity-80 transition-opacity"
                      onClick={async () => await onDeleteRole(role.name)}
                    >
                      <RedCancelIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRoles.length === 0 && (
          <div className="p-6 text-center text-gray-500 font-montserrat">
            Geen rollen gevonden.
          </div>
        )}
      </div>
    </div>
  )
}
