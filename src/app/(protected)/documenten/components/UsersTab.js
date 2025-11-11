'use client'
import AddButton from "@/components/buttons/AddButton"
import CheckBox from "@/components/buttons/CheckBox"
import DropdownMenu from "@/components/input/DropdownMenu"
import SearchBox from "@/components/input/SearchBox"
import SelectedData from "@/components/input/SelectedData"
import SortableHeader from "@/components/SortableHeader"
import { useSortableData } from "@/lib/useSortableData"
import { useState, useEffect, useMemo } from "react"

export default function UsersTab({ selectedUsers = [], selectedDocName }) {
  const [users, setUsers] = useState(selectedUsers)
  const [selected, setSelected] = useState("Bulkacties")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUsersSet, setSelectedUsersSet] = useState(new Set())
  const allOptions = ["Bulkacties", "Option 01", "Option 02"]

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

  const handleUserSelect = (userId, isSelected) => {
    setSelectedUsersSet(prev => {
      const newSelected = new Set(prev)
      if (isSelected) {
        newSelected.add(userId)
      } else {
        newSelected.delete(userId)
      }
      return newSelected
    })
  }

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      const allFilteredUserIds = new Set(filteredUsers.map(user => user.id))
      setSelectedUsersSet(allFilteredUserIds)
    } else {
      setSelectedUsersSet(new Set())
    }
  }

  const allSelected = filteredUsers.length > 0 && filteredUsers.every(user => 
    selectedUsersSet.has(user.id)
  )

  const someSelected = filteredUsers.some(user => 
    selectedUsersSet.has(user.id)
  ) && !allSelected

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="mb-[29px] font-montserrat font-extrabold text-[18px] leading-[100%]">
        {filteredUsers.length} gebruiker{filteredUsers.length !== 1 ? 's' : ''} toegewezen aan &quot;{selectedDocName}&quot;
        {selectedUsersSet.size > 0 && (
          <span className="ml-2 text-gray-600">
            ({selectedUsersSet.size} geselecteerd)
          </span>
        )}
      </div>

      {/* Selected Document */}
      <div className="flex w-full bg-[#F9FBFA] gap-4 py-[10px] px-2">
        <div className="w-9/10">
          <SelectedData SelectedData={selectedDocName || "Geen document geselecteerd"} />
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex w-full h-fit bg-[#F9FBFA] items-center justify-between px-2 py-[6px]">
        <div className="flex w-2/3 gap-4 items-center">
          <div className="w-4/9">
            <DropdownMenu value={selected} onChange={setSelected} allOptions={allOptions} />
          </div>
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
                  <CheckBox 
                    toggle={allSelected} 
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                    color="#23BD92" 
                  />
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
                    <td className="px-2 py-2 font-montserrat text-[16px] text-black font-normal">
                      <div className="flex items-center gap-5">
                        <CheckBox 
                          toggle={isSelected} 
                          onChange={(isSelected) => handleUserSelect(user.id, isSelected)}
                          color="#23BD92" 
                        />
                        {user.name}
                      </div>
                    </td>
                    
                    <td className="px-2 py-2 font-montserrat text-[16px] text-black font-normal">
                      {user.email}
                    </td>
                    
                    <td className="px-4 py-2">
                      {/* Empty cell for alignment - can be used for actions later */}
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