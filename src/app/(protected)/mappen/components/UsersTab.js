'use client'

import SearchBox from "@/components/input/SearchBox"
import SortableHeader from "@/components/SortableHeader"
import { useSortableData } from "@/lib/useSortableData"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"

export default function UsersTab({ 
  selectedUsers = [], 
  selectedDocFolder = "", 
  selectedDocRole = "" 
}) {
  const router = useRouter()
  const [users, setUsers] = useState(selectedUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUsersSet, setSelectedUsersSet] = useState(new Set())

  useEffect(() => {
    setUsers(selectedUsers)
  }, [selectedUsers])

  const preparedUsers = useMemo(() => {
    return users.map(user => ({
      ...user,
      id: user.id || user.email,
      name: user.name || '',
      email: user.email || ''
    }))
  }, [users])

  const { items: sortedUsers, requestSort, sortConfig } = useSortableData(preparedUsers)

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return sortedUsers

    return sortedUsers.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [sortedUsers, searchQuery])

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="mb-[29px] font-montserrat font-extrabold text-[18px] leading-[100%]">
        {filteredUsers.length} gebruiker{filteredUsers.length !== 1 ? 's' : ''} toegewezen aan de map "{selectedDocFolder}" van rol "{selectedDocRole}"
        {selectedUsersSet.size > 0 && (
          <span className="ml-2 text-gray-600">
            ({selectedUsersSet.size} geselecteerd)
          </span>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex w-full h-fit bg-[#F9FBFA] items-center justify-between px-2 py-1.5">
        <div className="flex w-2/3 gap-4 items-center">
          <div className="w-4/9">
            <SearchBox 
              placeholderText="Zoek gebruiker..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#F9FBFA]">
            <tr className="h-[51px] border-b border-[#C5BEBE]">
              <SortableHeader 
                sortKey="name" 
                onSort={requestSort} 
                currentSort={sortConfig}
                className="px-2 py-2"
              >
                <div className="flex items-center gap-5">
                  Naam
                </div>
              </SortableHeader>

              <SortableHeader 
                sortKey="email" 
                onSort={requestSort} 
                currentSort={sortConfig}
                className="px-2 py-2"
              >
                E-mail
              </SortableHeader>

              <th className="w-[52px] px-4 py-2"></th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-4 py-6 text-center text-gray-500 font-montserrat">
                  {searchQuery ? 'Geen gebruikers gevonden voor deze zoekopdracht.' : 'Geen gebruikers toegewezen'}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = selectedUsersSet.has(user.id)
                
                return (
                  <tr 
                    key={user.id} 
                    className="h-[51px] border-b border-[#C5BEBE] hover:bg-[#F9FBFA] transition-colors"
                  >
                    <td className="px-4 py-2 font-montserrat text-[16px] text-black font-normal">
                      <div className="flex items-center gap-5">
                        {user.name}
                      </div>
                    </td>
                    
                    <td onClick={() => {router.push('/gebruikers')}} className="px-4 py-2 font-montserrat text-[16px] text-black font-normal cursor-pointer">
                      {user.email}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}