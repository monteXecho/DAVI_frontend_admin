'use client'
import AddButton from "@/components/buttons/AddButton"
import CheckBox from "@/components/buttons/CheckBox"
import DownArrow from "@/components/icons/DownArrowIcon"
import DropdownMenu from "@/components/input/DropdownMenu"
import SearchBox from "@/components/input/SearchBox"
import SelectedData from "@/components/input/SelectedData"
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

  // Filter users by search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users

    return users.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [users, searchQuery])

  // Handle individual checkbox selection
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

  // Handle select all checkbox
  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      // Select all filtered users
      const allFilteredUserIds = new Set(filteredUsers.map(user => user.id || user.email))
      setSelectedUsersSet(allFilteredUserIds)
    } else {
      // Deselect all
      setSelectedUsersSet(new Set())
    }
  }

  // Check if all filtered users are selected
  const allSelected = filteredUsers.length > 0 && filteredUsers.every(user => 
    selectedUsersSet.has(user.id || user.email)
  )

  // Check if some filtered users are selected
  const someSelected = filteredUsers.some(user => 
    selectedUsersSet.has(user.id || user.email)
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

      <div className="flex w-full bg-[#F9FBFA] gap-4 py-[10px] px-2">
        <div className="w-9/10">
          <SelectedData SelectedData={selectedDocName || "Geen document geselecteerd"} />
        </div>
      </div>

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
        <AddButton onClick={() => {}} text="Voeg gebruiker toe" />
      </div>

      <table className="w-full border-separate border-spacing-0 border border-transparent">
        <thead className="bg-[#F9FBFA]">
          <tr className="h-[51px] border-b border-[#C5BEBE] hover:bg-[#F9FBFA] flex items-center gap-[40px] w-full px-2">
            <th className="flex items-center gap-5 w-3/9 font-montserrat font-bold text-[16px] text-black">
              <CheckBox 
                toggle={allSelected} 
                indeterminate={someSelected}
                onChange={handleSelectAll}
                color="#23BD92" 
              />
              <span>Naam</span>
              <DownArrow />
            </th>
            <th className="flex items-center gap-5 w-6/9 font-montserrat font-bold text-[16px] text-black">
              E-mail
              <DownArrow />
            </th>
            <th className="w-[52px] px-4 py-2"></th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.length === 0 ? (
            <tr className="flex items-center justify-center h-[80px] w-full text-gray-500">
              <td colSpan="3" className="text-center w-full">
                {searchQuery ? 'Geen gebruikers gevonden voor deze zoekopdracht.' : 'Geen gebruikers toegewezen'}
              </td>
            </tr>
          ) : (
            filteredUsers.map((user, i) => {
              const userId = user.id || user.email // Use email as fallback ID
              const isSelected = selectedUsersSet.has(userId)
              
              return (
                <tr key={i} className="h-[51px] border-b border-[#C5BEBE] flex items-center gap-[40px]">
                  <td className="flex gap-5 w-3/9 items-center font-montserrat text-[16px] px-2 py-2">
                    <CheckBox 
                      toggle={isSelected} 
                      onChange={(isSelected) => handleUserSelect(userId, isSelected)}
                      color="#23BD92" 
                    />
                    {user.name}
                  </td>
                  <td className="w-6/9 font-montserrat text-[16px] px-4 py-2">
                    {user.email}
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}